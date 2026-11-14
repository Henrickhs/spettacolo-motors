'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getTransformedRoutes } = require('@vercel/routing-utils');
const config = require('../vercel.json');
const { findCar } = require('../inventory.js');

// Compile the actual deployed configuration with Vercel's own routing compiler.
// The CDN forwards incoming queries automatically; the preview check must verify
// that runtime behavior, while these tests guard the rule and hash interpolation.
function redirect(input) {
  const { routes, error } = getTransformedRoutes(config);
  assert.equal(error, null, error?.message);
  const request = new URL(input, 'https://www.spettacolomotors.com.br');
  for (const route of routes || []) {
    if (!route.headers?.Location) continue;
    const match = new RegExp(route.src).exec(request.pathname);
    if (!match) continue;
    const location = route.headers.Location.replace(/\$(\d+)/g, (_, index) => match[Number(index)] || '');
    return { status: route.status, target: new URL(location, request.origin) };
  }
  return null;
}

const leadPath = '/Veiculo/gle-450d-3.0-i6-mhev-diesel-coupe-4matic-9g-tronic-diesel-2024/4962838/detalhes';
test('the exact AutoCerto lead URL redirects to its stable vehicle ID', () => {
  const result = redirect('http://spettacolomotors.com.br' + leadPath);
  assert.ok(result, 'AutoCerto lead link has no matching redirect');
  assert.equal(result.status, 308);
  assert.equal(result.target.pathname, '/');
  assert.equal(result.target.hash, '#/veiculo/autocerto-4962838');
});

test('legacy link accepts case variants, changed slug and optional trailing slash', () => {
  for (const path of [leadPath + '/', leadPath.toLowerCase(), leadPath.toUpperCase(), '/vEiCuLo/new-model-name/4962838/dEtAlHeS/']) {
    assert.equal(redirect(path)?.target.hash, '#/veiculo/autocerto-4962838', path);
  }
});

test('query strings do not affect matching and rules leave CDN passthrough intact', () => {
  const result = redirect(leadPath + '?utm_source=autocerto&lead=abc%2B123&tag=one&tag=two');
  assert.equal(result?.target.hash, '#/veiculo/autocerto-4962838');
  for (const rule of config.redirects || []) {
    assert.equal(new URL(rule.destination, 'https://www.spettacolomotors.com.br').search, '');
    assert.ok(!rule.has?.some(condition => condition.type === 'query'));
    assert.ok(!rule.missing?.some(condition => condition.type === 'query'));
  }
});

test('only numeric vehicle detail paths match, with no generic fallback', () => {
  for (const path of [
    '/Veiculo/model/abc/detalhes', '/Veiculo/model/4962838x/detalhes',
    '/Veiculo/model/-4962838/detalhes', '/Veiculo/model/496.28/detalhes',
    '/Veiculo/model/detalhes', '/Veiculo/model//detalhes',
    '/Veiculo/model/4962838/detalhes/extra', '/api/estoque', '/assets/logo.png', '/',
    '/Veiculo/4962838/detalhes', '/veiculo/autocerto-4962838'
  ]) assert.equal(redirect(path), null, path);
});

test('redirect preserves any numeric source ID and does not substitute another car', () => {
  const cars = [{ id: 'autocerto-4962838', sourceId: '4962838' }];
  const target = redirect('/Veiculo/model/9999999/detalhes')?.target.hash.slice('#/veiculo/'.length);
  assert.equal(target, 'autocerto-9999999');
  assert.equal(findCar(cars, target), undefined);
  assert.equal(findCar(cars, 'autocerto-4962838'), cars[0]);
  assert.equal(findCar(cars, 'mercedes-benz-gle-2024-4962838'), cars[0]);
});
