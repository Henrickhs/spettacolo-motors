'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { renderVehiclePage, shareImage } = require('../server/vehicle-page.cjs');
const shell = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const car = { sourceId: '4962838', brand: 'MERCEDES-BENZ', model: 'GLE 450d', yearModel: '2024', year: '2024/2024', version: '3.0 Diesel', price: 560000, km: 34870,
  image: 'https://autocerto.com/fotos/4734/4962838/4_121408.jpg', sourceModifiedAt: '2026-08-04T15:53:41' };
const render = (cars = [car], extra = {}) => renderVehiclePage({ id: car.sourceId, snapshot: { status: 'fresh', cars, ...extra }, shell });
const meta = (html, property) => html.match(new RegExp(`<meta property="${property}" content="([^"]*)">`))?.[1];
test('server HTML has specific vehicle metadata before JavaScript and keeps app assets rooted', () => {
  const result = render();
  assert.equal(result.status, 200);
  assert.equal(meta(result.html, 'og:title'), 'MERCEDES-BENZ GLE 450d 2024 | Spettacolo Motors');
  assert.equal(meta(result.html, 'og:url'), 'https://www.spettacolomotors.com.br/veiculo/4962838');
  assert.match(meta(result.html, 'og:image'), /^https:\/\/autocerto.com\/fotos\/4734\/4962838\/4_121408.jpg\?v=/);
  assert.equal((result.html.match(/property="og:image"/g) || []).length, 1);
  assert.ok(result.html.indexOf('property="og:image"') < result.html.indexOf('</head>'));
  assert.match(result.html, /<base href="\/">/);
  assert.match(result.html, /rel="icon"[^>]+favicon/);
  assert.match(result.html, /routing.js/);
  assert.ok(!result.html.includes('"@type": "Organization"'));
});
test('newly added cars get their own image and identity without a static page or rebuild', () => {
  const freshCar = { ...car, sourceId: '99999999', brand: 'PORSCHE', model: '911', image: 'https://autocerto.com/fotos/4734/99999999/new.jpg' };
  const result = renderVehiclePage({ id: freshCar.sourceId, snapshot: { status: 'fresh', cars: [car, freshCar] }, shell });
  assert.equal(result.status, 200);
  assert.match(meta(result.html, 'og:title'), /PORSCHE 911/);
  assert.match(meta(result.html, 'og:image'), /99999999\/new.jpg/);
  assert.ok(!result.html.includes(car.image));
});
test('removed vehicles never reuse another car photo and failures are not treated as sold', () => {
  const absent = render([{ ...car, sourceId: '123' }]);
  assert.equal(absent.status, 404);
  assert.match(absent.html, /Veículo fora do estoque/);
  assert.match(absent.html, /noindex, follow/);
  assert.ok(!absent.html.includes(car.image));
  assert.equal(render([], { status: 'unavailable' }).status, 503);
  assert.equal(render([], { status: 'stale' }).status, 503);
  const stale = render([car], { status: 'stale' });
  assert.equal(stale.status, 200);
  assert.match(stale.html, /Dados da última consulta/);
});
test('source content cannot escape HTML attributes, titles or JSON-LD scripts', () => {
  const attack = '</script><script>alert("x")</script><img src=x onerror="alert(1)">';
  const result = render([{ ...car, model: attack, version: attack, privateToken: 'SHOULD_NOT_LEAK' }]);
  assert.ok(!result.html.includes(attack));
  assert.ok(!result.html.includes('SHOULD_NOT_LEAK'));
  assert.match(result.html, /&lt;\/script&gt;/);
  const schema = result.html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
  assert.equal(JSON.parse(schema).model, attack);
});
test('image fallback is branded and image cache identity follows source photo changes', () => {
  assert.match(shareImage({ ...car, image: '/assets/vehicle-placeholder.svg' }), /spettacolo-logo-full.png$/);
  assert.match(shareImage({ ...car, image: 'https://evil.example/photo.jpg' }), /spettacolo-logo-full.png$/);
  assert.notEqual(shareImage(car), shareImage({ ...car, sourceModifiedAt: '2026-11-14T11:00:00' }));
  assert.notEqual(shareImage(car), shareImage({ ...car, image: car.image.replace('4_', '5_') }));
});
