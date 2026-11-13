const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createInventoryService, REFRESH_MS } = require('../server/inventory-service.cjs');

function setup({ previous = null, upstream, saveError = false } = {}) {
  let saved = previous && { ...previous };
  let reads = 0, writes = 0, calls = 0;
  const now = Date.parse('2026-11-13T22:00:00Z');
  const store = {
    read: async () => { reads++; return saved && { value: structuredClone(saved), etag: 'v1' }; },
    write: async (value) => { if (saveError) throw new Error('storage down'); writes++; saved = structuredClone(value); }
  };
  const service = createInventoryService({ store, now: () => now, unitCode: '4734',
    fetchStock: async () => { calls++; return upstream(); }, normalize: x => x });
  return { service, now, state: () => ({ saved, reads, writes, calls }) };
}
const cars = [{ id: 'autocerto-1', sourceId: '1', brand: 'AUDI', model: 'A3', price: 150000 }];
function previous(overrides = {}) {
  return { schemaVersion: 1, unitCode: '4734', cars, syncedAt: '2026-11-13T20:00:00.000Z',
    checkedAt: '2026-11-13T20:00:00.000Z', refreshAfter: '2026-11-13T20:30:00.000Z', lastError: null, ...overrides };
}
test('normal update persists actual source data before serving', async () => {
  const s = setup({ upstream: () => cars });
  const result = await s.service.get();
  assert.equal(result.status, 'fresh');
  assert.deepEqual(result.cars, cars);
  assert.equal(s.state().writes, 1);
  assert.equal(Date.parse(s.state().saved.refreshAfter) - s.now, REFRESH_MS);
});
test('new instance serves durable snapshot while source is down and flags stale', async () => {
  const s = setup({ previous: previous(), upstream: () => { throw new Error('timeout'); } });
  const result = await s.service.get();
  assert.equal(result.status, 'stale');
  assert.equal(result.warning, 'update_pending');
  assert.deepEqual(result.cars, cars);
  assert.equal(result.syncedAt, previous().syncedAt);
  assert.deepEqual(s.state().saved.cars, cars);
});
test('malformed/incomplete source never replaces last valid snapshot', async () => {
  const s = setup({ previous: previous(), upstream: () => { throw Object.assign(new Error(), { code: 'INVALID_PAYLOAD' }); } });
  const result = await s.service.get();
  assert.deepEqual(result.cars, cars);
  assert.equal(result.status, 'stale');
});
test('legitimate empty source must be confirmed before replacing stock', async () => {
  const s = setup({ previous: previous(), upstream: () => [] });
  const result = await s.service.get();
  assert.deepEqual(result.cars, []);
  assert.equal(result.status, 'fresh');
  assert.equal(s.state().calls, 2);
});
test('transient empty source is not published', async () => {
  let calls = 0;
  const s = setup({ previous: previous(), upstream: () => ++calls === 1 ? [] : cars });
  assert.deepEqual((await s.service.get()).cars, cars);
  assert.equal(s.state().saved.lastError, 'INCONSISTENT_STOCK');
});
test('price changes, additions and removals replace by stable ID', async () => {
  const changed = [{ ...cars[0], price: 148000 }, { ...cars[0], id: 'autocerto-2', sourceId: '2' }];
  const s = setup({ previous: previous(), upstream: () => changed });
  assert.deepEqual((await s.service.get()).cars, changed);
});
test('source unavailable on first load returns unavailable, no sample inventory', async () => {
  const s = setup({ upstream: () => { throw new Error('down'); } });
  const result = await s.service.get();
  assert.equal(result.status, 'unavailable');
  assert.deepEqual(result.cars, []);
  assert.equal(s.state().writes, 0);
});
test('fresh durable snapshot avoids unnecessary upstream calls', async () => {
  const s = setup({ previous: previous({ refreshAfter: '2026-11-13T22:30:00.000Z' }), upstream: () => { throw new Error(); } });
  assert.equal((await s.service.get()).status, 'fresh');
  assert.equal(s.state().calls, 0);
});
test('failed persistence does not discard prior valid stock', async () => {
  const s = setup({ previous: previous(), upstream: () => [{ ...cars[0], price: 149000 }], saveError: true });
  const result = await s.service.get();
  assert.equal(result.status, 'stale');
  assert.deepEqual(result.cars, cars);
});
test('concurrent requests on same instance coalesce refresh', async () => {
  const s = setup({ upstream: async () => { await new Promise(r => setTimeout(r, 10)); return cars; } });
  const result = await Promise.all([s.service.get(), s.service.get()]);
  assert.equal(s.state().calls, 1);
  assert.deepEqual(result[0], result[1]);
});
test('cold-start creation conflict returns the persisted winner instead of unavailable', async () => {
  let readCount = 0;
  const winner = previous({ syncedAt: '2026-11-13T22:00:00.000Z', refreshAfter: '2026-11-13T22:30:00.000Z' });
  const service = createInventoryService({ unitCode: '4734', now: () => Date.parse('2026-11-13T22:00:00Z'), normalize: x => x,
    fetchStock: async () => cars,
    store: { read: async () => ++readCount === 1 ? null : { value: winner, etag: 'winner' },
      write: async () => { throw Object.assign(new Error(), { code: 'STORAGE_WRITE_FAILED' }); } } });
  assert.deepEqual((await service.get()).cars, cars);
  assert.equal(readCount, 2);
});
