'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getTransformedRoutes } = require('@vercel/routing-utils');
const config = require('../vercel.json');
const { vehicleId } = require('../server/vehicle-page.cjs');
function rewrite(input) {
  const { routes, error } = getTransformedRoutes(config);
  assert.equal(error, null, error?.message);
  const request = new URL(input, 'https://www.spettacolomotors.com.br');
  for (const route of routes || []) {
    if (!route.dest) continue;
    const match = new RegExp(route.src).exec(request.pathname);
    if (match) return route.dest.replace(/\$(\d+)/g, (_, index) => match[Number(index)] || '');
  }
  return null;
}
const leadPath = '/Veiculo/gle-450d-3.0-i6-mhev-diesel-coupe-4matic-9g-tronic-diesel-2024/4962838/detalhes';
test('AutoCerto lead link and clean URL serve metadata for the same stable vehicle ID', () => {
  for (const path of [leadPath, leadPath + '/', leadPath.toLowerCase(), leadPath.toUpperCase(), '/vEiCuLo/new-model-name/4962838/dEtAlHeS/', '/veiculo/4962838']) {
    const target = rewrite(path);
    assert.equal(target, '/api/veiculo/4962838', path);
    assert.equal(vehicleId(path), '4962838');
    assert.equal(vehicleId(target), '4962838');
  }
  assert.equal(config.redirects?.length || 0, 0, 'A redirect to a hash would erase per-car previews');
});
test('query strings cannot substitute another car for the ID in the path', () => {
  for (const query of ['?utm_source=autocerto', '?id=123&lead=abc%2B123', '?id=123&id=456']) {
    assert.equal(vehicleId(leadPath + query), '4962838');
    assert.equal(vehicleId(rewrite(leadPath + query) + query), '4962838');
  }
});
test('only numeric detail paths match and an unseen future ID works without a new rule', () => {
  for (const path of ['/Veiculo/model/abc/detalhes', '/Veiculo/model/4962838x/detalhes', '/Veiculo/model/-4962838/detalhes', '/Veiculo/model/detalhes', '/Veiculo/model//detalhes', '/Veiculo/model/4962838/detalhes/extra', '/api/estoque', '/assets/logo.png', '/']) assert.equal(rewrite(path), null, path);
  assert.equal(rewrite('/Veiculo/new-car/99999999/detalhes'), '/api/veiculo/99999999');
  assert.equal(vehicleId('/api/veiculo?id=4962838'), null);
});
