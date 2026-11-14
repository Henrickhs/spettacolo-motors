'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getRoute, routeUrl, createRouter } = require('../routing.js');

const locationAt = path => new URL(path, 'https://www.spettacolomotors.com.br');
test('reads canonical and AutoCerto paths by stable numeric ID', () => {
  for (const path of ['/veiculo/4962838', '/veiculo/4962838/', '/VEICULO/4962838',
    '/Veiculo/gle-450d-2024/4962838/detalhes', '/vEiCuLo/renamed-slug/4962838/dEtAlHeS/?utm_source=autocerto']) {
    assert.equal(getRoute(locationAt(path)), '/veiculo/4962838', path);
  }
});

test('old hash links and hash filters still resolve, including old slug IDs', () => {
  for (const path of ['/#/veiculo/autocerto-4962838', '/#/veiculo/mercedes-benz-gle-2024-4962838', '/#/veiculo/4962838']) {
    assert.equal(getRoute(locationAt(path)), '/veiculo/4962838', path);
  }
  assert.equal(getRoute(locationAt('/#/estoque?marca=mercedes-benz')), '/estoque?marca=mercedes-benz');
  assert.equal(getRoute(locationAt('/veiculo/1#/veiculo/autocerto-2')), '/veiculo/2');
  assert.equal(getRoute(locationAt('/')), '/');
});

test('vehicle navigation emits clean URLs and other pages return to root hashes', () => {
  for (const route of ['/veiculo/4962838', '/veiculo/autocerto-4962838', '/veiculo/mercedes-benz-gle-2024-4962838']) {
    assert.equal(routeUrl(route), '/veiculo/4962838');
  }
  assert.equal(routeUrl('/estoque?marca=audi'), '/#/estoque?marca=audi');
  assert.equal(routeUrl('/contato'), '/#/contato');
  assert.equal(routeUrl('/'), '/#/');
  assert.equal(routeUrl('/veiculo/not-found'), '/#/veiculo/not-found');
  for (const route of ['https://evil.test/', '//evil.test/', 'javascript:alert(1)', '/\\evil.test']) {
    assert.throws(() => routeUrl(route), TypeError);
  }
});

function browserAt(path) {
  const events = new EventTarget();
  const entries = [locationAt(path).href];
  let position = 0;
  let scrolls = 0;
  const browser = {
    Event,
    get location() { return new URL(entries[position]); },
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
    dispatchEvent: events.dispatchEvent.bind(events),
    scrollTo: () => { scrolls++; },
    history: {
      pushState(_state, _title, url) { entries.splice(position + 1); entries.push(new URL(url, entries[position]).href); position++; },
      replaceState(_state, _title, url) { entries[position] = new URL(url, entries[position]).href; },
      back() { if (position) { position--; events.dispatchEvent(new Event('popstate')); } },
      forward() { if (position < entries.length - 1) { position++; events.dispatchEvent(new Event('popstate')); } }
    }
  };
  return { browser, entries, scrolls: () => scrolls };
}

test('car A to B updates pathname, not A hash B; back and forward update subscribers without reload', () => {
  const { browser, entries, scrolls } = browserAt('/Veiculo/car-a/101/detalhes');
  const router = createRouter(browser);
  const observed = [];
  const unsubscribe = router.subscribe(route => observed.push(route));
  assert.equal(router.read(), '/veiculo/101');
  router.go('/veiculo/autocerto-202');
  assert.equal(browser.location.pathname, '/veiculo/202');
  assert.equal(browser.location.hash, '');
  assert.equal(router.read(), '/veiculo/202');
  router.go('/estoque?marca=audi');
  assert.equal(browser.location.pathname, '/');
  assert.equal(browser.location.hash, '#/estoque?marca=audi');
  browser.history.back();
  assert.equal(router.read(), '/veiculo/202');
  browser.history.back();
  assert.equal(router.read(), '/veiculo/101');
  browser.history.forward();
  assert.equal(router.read(), '/veiculo/202');
  assert.deepEqual(observed, ['/veiculo/202', '/estoque?marca=audi', '/veiculo/202', '/veiculo/101', '/veiculo/202']);
  assert.equal(entries.length, 3);
  assert.equal(scrolls(), 2);
  unsubscribe();
  browser.dispatchEvent(new Event('hashchange'));
  assert.equal(observed.length, 5);
});

test('same-route navigation does not add duplicate history and native hash changes notify', () => {
  const { browser, entries } = browserAt('/veiculo/202');
  const router = createRouter(browser);
  let calls = 0;
  router.subscribe(() => calls++);
  router.go('/veiculo/autocerto-202');
  assert.equal(entries.length, 1);
  browser.dispatchEvent(new Event('hashchange'));
  assert.equal(calls, 2);
});

test('opening an old detail hash replaces its URL for copying without reload or adding history', () => {
  const { browser, entries } = browserAt('/?utm_source=autocerto#/veiculo/mercedes-benz-gle-2024-4962838?ref=lead');
  const router = createRouter(browser);
  assert.equal(router.read(), '/veiculo/4962838');
  assert.equal(browser.location.pathname, '/veiculo/4962838');
  assert.equal(browser.location.hash, '');
  assert.equal(browser.location.searchParams.get('utm_source'), 'autocerto');
  assert.equal(browser.location.searchParams.get('ref'), 'lead');
  assert.equal(entries.length, 1);
});

test('a later native hash detail link is canonicalized and not attributed to the previous car', () => {
  const { browser } = browserAt('/veiculo/101');
  const router = createRouter(browser);
  const observed = [];
  router.subscribe(route => observed.push(route));
  browser.history.pushState(null, '', '/veiculo/101#/veiculo/autocerto-202');
  browser.dispatchEvent(new Event('hashchange'));
  assert.equal(browser.location.pathname, '/veiculo/202');
  assert.equal(browser.location.hash, '');
  assert.deepEqual(observed, ['/veiculo/202']);
});
