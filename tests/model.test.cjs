'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeStock } = require('../server/autocerto-model.cjs');

function vehicle(overrides = {}) {
  return {
    Codigo: 4047856, Marca: 'AUDI', Modelo: 'A3', Versao: '2.0 TFSI',
    AnoFabricacao: 2015, AnoModelo: 2016, Km: 65807,
    Preco: 150000, PrecoClassificados: 150000, Cambio: 'Automático',
    Combustivel: 'Gasolina', Cor: 'Branco', Categoria: 'Sedan', Destaque: false,
    Fotos: [{ URL: 'https://autocerto.com/fotos/4734/4047856/1.jpg', Posicao: 1 }],
    Opcionais: [{ Codigo: 4, Descricao: 'Ar condicionado' }],
    DataModificacao: '2026-08-05T15:46:35', ...overrides
  };
}

function rejects(value) {
  assert.throws(() => normalizeStock(value), error => error.code === 'INVALID_PAYLOAD' && !/PRIVATE/.test(error.message));
}

test('maps stable source IDs and public vehicle details without leaking private fields', () => {
  const [car] = normalizeStock([vehicle({ Placa: 'PRIVATE', Renavam: 'PRIVATE', Chassi: 'PRIVATE', Observacao: 'PRIVATE' })]);
  assert.equal(car.id, 'autocerto-4047856');
  assert.equal(car.ref, 'AC-4047856');
  assert.equal(car.sourceId, '4047856');
  assert.equal(car.year, '2015/2016');
  assert.equal(car.price, 150000);
  assert.equal(car.km, 65807);
  assert.equal(car.bodyType, 'Sedan');
  assert.equal(car.sourceModifiedAt, '2026-08-05T15:46:35');
  assert.deepEqual(car.features, ['Ar condicionado']);
  assert.ok(!JSON.stringify(car).includes('PRIVATE'));
  assert.equal(normalizeStock([vehicle({ Marca: 'Brand renamed', Modelo: 'Model renamed' })])[0].id, car.id);
});

test('uses classified price, including explicit zero/null, and falls back only if absent', () => {
  assert.equal(normalizeStock([vehicle({ PrecoClassificados: 258000 })])[0].price, 258000);
  assert.equal(normalizeStock([vehicle({ PrecoClassificados: 0 })])[0].price, null);
  assert.equal(normalizeStock([vehicle({ PrecoClassificados: null })])[0].price, null);
  const source = vehicle();
  delete source.PrecoClassificados;
  assert.equal(normalizeStock([source])[0].price, 150000);
});

test('normalizes Brazilian money and mileage without coercing invalid numbers', () => {
  const [car] = normalizeStock([vehicle({ PrecoClassificados: 'R$ 258.000,50', Km: '65.807', AnoModelo: '2016' })]);
  assert.equal(car.price, 258000.5);
  assert.equal(car.km, 65807);
  assert.equal(normalizeStock([vehicle({ PrecoClassificados: '258000.50' })])[0].price, 258000.5);
  assert.equal(normalizeStock([vehicle({ Km: null })])[0].km, null);
  assert.equal(normalizeStock([vehicle({ Km: 0 })])[0].km, 0);
  for (const bad of [-1, NaN, Infinity, '', false, '123junk', '1,2,3', {}, 'PRIVATE']) {
    rejects([vehicle({ PrecoClassificados: bad })]);
  }
  rejects([vehicle({ Km: 1.5 })]);
});

test('orders photos by source position, deduplicates paths and strips query tokens', () => {
  const [car] = normalizeStock([vehicle({ Fotos: [
    { URL: 'https://www.autocerto.com/fotos/2.jpg?token=PRIVATE', Posicao: 2 },
    { URL: 'https://autocerto.com/fotos/1.jpg', Posicao: 1 },
    { URL: 'https://www.autocerto.com/fotos/2.jpg?other=PRIVATE#PRIVATE', Posicao: 3 }
  ] })]);
  assert.equal(car.images.length, 2);
  assert.equal(car.image, 'https://autocerto.com/fotos/1.jpg');
  assert.equal(car.images[1].gallery, 'https://www.autocerto.com/fotos/2.jpg');
  assert.ok(!JSON.stringify(car.images).includes('PRIVATE'));
});

test('untrusted or absent photos produce a neutral fallback, never another vehicle', () => {
  for (const url of ['https://autocerto.com.evil.test/1.jpg', 'http://autocerto.com/1.jpg', 'https://user:PRIVATE@autocerto.com/1.jpg', 'javascript:alert(1)', 'https://autocerto.com/oauth/token']) {
    const [car] = normalizeStock([vehicle({ Fotos: [{ URL: url }] })]);
    assert.equal(car.image, '/assets/vehicle-placeholder.svg');
    assert.equal(car.images.length, 1);
  }
  assert.equal(normalizeStock([vehicle({ Fotos: [] })])[0].image, '/assets/vehicle-placeholder.svg');
});

test('allows missing optional description fields but rejects incomplete inventory records', () => {
  const minimal = { Codigo: 1, Marca: 'Marca', Modelo: 'Modelo', AnoFabricacao: 2020, AnoModelo: 2021, Km: null, Preco: null, Fotos: [] };
  assert.equal(normalizeStock([minimal])[0].version, '');
  assert.deepEqual(normalizeStock([minimal])[0].features, []);
  for (const field of ['Codigo', 'Marca', 'Modelo', 'AnoFabricacao', 'AnoModelo', 'Km', 'Preco', 'Fotos']) {
    const partial = { ...minimal };
    delete partial[field];
    rejects([partial]);
  }
  rejects([vehicle(), { Codigo: 2 }]);
  rejects([vehicle({ Marca: ' ' })]);
  rejects([vehicle({ Fotos: [{ URL: null }] })]);
  rejects([vehicle({ Opcionais: ['unexpected string'] })]);
  rejects([vehicle({ Destaque: 'false' })]);
  rejects([vehicle({ AnoModelo: 1 })]);
});

test('distinguishes legitimate empty arrays from failed/enveloped responses', () => {
  assert.deepEqual(normalizeStock([]), []);
  for (const payload of [null, {}, { cars: [] }, { error: 'PRIVATE' }, '', [null]]) rejects(payload);
});

test('duplicate IDs reject the entire snapshot and changed stock does not retain sold cars', () => {
  rejects([vehicle(), vehicle({ Codigo: '4047856' })]);
  const updated = normalizeStock([vehicle({ Codigo: 2, PrecoClassificados: 175000 })]);
  assert.deepEqual(updated.map(car => car.sourceId), ['2']);
  assert.equal(updated[0].price, 175000);
});

test('rejects excessive collections and malformed fields with sanitized errors', () => {
  rejects(Array.from({ length: 5001 }, () => vehicle()));
  rejects([vehicle({ Fotos: Array.from({ length: 201 }, () => ({ URL: 'https://autocerto.com/1.jpg' })) })]);
  rejects([vehicle({ Codigo: 0 })]);
  rejects([vehicle({ Codigo: Number.MAX_SAFE_INTEGER + 1 })]);
  rejects([vehicle({ DataModificacao: 'PRIVATE' })]);
});
