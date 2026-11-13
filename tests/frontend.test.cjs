const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const context = { module: { exports: {} }, AbortController, setTimeout, clearTimeout };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../inventory.js'), 'utf8'), context);
const { createInventoryStore, isSnapshot, findCar, brandSlug, CACHE_KEY } = context.module.exports;
const car = { id:'autocerto-12', sourceId:'12', brand:'AUDI', model:'Q5', version:'TFSI', year:'2022/2022', price:258000, km:21800,
  image:'/assets/vehicle-placeholder.svg', images:[{gallery:'/assets/vehicle-placeholder.svg', thumb:'/assets/vehicle-placeholder.svg'}] };
const snapshot = (cars = [car], syncedAt = '2026-11-13T21:00:00Z', status = 'fresh') => ({ source:'autocerto', cars, syncedAt, checkedAt:syncedAt, status });
function setup(responses, initial = {}) {
  const values = new Map(Object.entries(initial));
  let calls = 0;
  const storage = { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
  const fetch = async (url, options) => {
    calls++;
    assert.equal(url, '/api/estoque');
    assert.equal(options.credentials, 'same-origin');
    const next = responses.shift();
    if (next instanceof Error) throw next;
    if (typeof next === 'function') return next();
    return { ok:true, json:async () => next };
  };
  return { store:createInventoryStore({fetch, storage}), values, calls:() => calls };
}
test('uses real server stock and never legacy browser stock', async () => {
  const fixture = setup([snapshot()], { sm_cars_v2:JSON.stringify([{id:'fake-car'}]) });
  assert.equal(fixture.store.read().cars.length, 0);
  await fixture.store.refresh();
  assert.equal(fixture.store.read().cars[0].price, 258000);
  assert.equal(fixture.store.read().status, 'fresh');
  assert.equal(JSON.parse(fixture.values.get('sm_cars_v2'))[0].id, 'fake-car');
  assert.equal(JSON.parse(fixture.values.get(CACHE_KEY)).version, 1);
});
test('deduplicates in-flight calls and throttles periodic reads', async () => {
  let resolve;
  const fixture = setup([() => new Promise(r => { resolve = r; })]);
  const first = fixture.store.refresh();
  const second = fixture.store.refresh(true);
  assert.equal(first, second);
  resolve({ok:true, json:async () => snapshot()});
  await first;
  await fixture.store.refresh();
  assert.equal(fixture.calls(), 1);
});
test('keeps the last verified stock after outage or malformed response', async () => {
  const fixture = setup([snapshot(), new Error('timeout'), {source:'autocerto', cars:[]}, snapshot([{...car, price:0}])]);
  await fixture.store.refresh();
  for (let i = 0; i < 3; i++) {
    await fixture.store.refresh(true);
    assert.equal(fixture.store.read().status, 'stale');
    assert.equal(fixture.store.read().cars[0].id, car.id);
    assert.equal(fixture.store.read().cars[0].price, 258000);
  }
});
test('malformed image entries cannot poison detail rendering or browser cache', async () => {
  const fixture = setup([snapshot(), snapshot([{...car, images:[null]}]), snapshot([{...car, images:[]}])]);
  await fixture.store.refresh();
  await fixture.store.refresh(true);
  assert.equal(fixture.store.read().cars[0].images[0].gallery, car.image);
  assert.equal(fixture.store.read().status, 'stale');
  await fixture.store.refresh(true);
  assert.equal(fixture.store.read().cars[0].images[0].gallery, car.image);
});
test('outage on first visit is unavailable, not empty stock', async () => {
  const fixture = setup([() => ({ok:false, status:503})]);
  await fixture.store.refresh();
  assert.equal(fixture.store.read().status, 'unavailable');
  assert.equal(fixture.store.read().syncedAt, null);
});
test('accepts an explicit legitimate empty stock and subsequent changes', async () => {
  const fixture = setup([snapshot(), snapshot([], '2026-11-13T22:00:00Z'), snapshot([{...car, price:250000}], '2026-11-13T23:00:00Z')]);
  await fixture.store.refresh();
  await fixture.store.refresh(true);
  assert.equal(fixture.store.read().status, 'fresh');
  assert.equal(fixture.store.read().cars.length, 0);
  await fixture.store.refresh(true);
  assert.equal(fixture.store.read().cars[0].price, 250000);
});
test('restores only versioned confirmed data as stale, including empty snapshots', async () => {
  for (const cars of [[car], []]) {
    const fixture = setup([new Error('offline')], { [CACHE_KEY]:JSON.stringify({version:1, snapshot:snapshot(cars)}) });
    assert.equal(fixture.store.read().status, 'stale');
    await fixture.store.refresh();
    assert.equal(fixture.store.read().cars.length, cars.length);
    assert.equal(fixture.store.read().status, 'stale');
  }
});
test('does not replace a newer confirmed snapshot with an older server copy', async () => {
  const fixture = setup([snapshot([{...car, price:260000}])], { [CACHE_KEY]:JSON.stringify({version:1, snapshot:snapshot([car], '2026-11-13T23:00:00Z')}) });
  await fixture.store.refresh();
  assert.equal(fixture.store.read().cars[0].price, 258000);
  assert.equal(fixture.store.read().status, 'stale');
});
test('validates payloads and resolves IDs from old links', () => {
  assert.equal(isSnapshot(snapshot([car, car])), false);
  assert.equal(isSnapshot(snapshot([{...car, images:null}])), false);
  assert.equal(isSnapshot(snapshot([{...car, price:null, km:null}])), true);
  assert.equal(findCar([car], 'audi-q5-2022-12').sourceId, '12');
  assert.equal(findCar([car], 'autocerto-12').id, car.id);
  assert.equal(findCar([car], 'unrelated-13'), undefined);
  assert.equal(brandSlug('LAND ROVER'), 'land-rover');
});
