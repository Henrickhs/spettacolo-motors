const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createAutoCertoClient } = require('../server/autocerto-client.cjs');
const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });
test('uses official hosts only, pins unit and caches OAuth token', async () => {
  const calls = [];
  const client = createAutoCertoClient({ username: 'test-user', password: 'test-secret', unitCode: '4734', fetchImpl: async (url, options) => {
    calls.push({ url, options });
    assert.equal(new URL(url).origin, 'https://integracao.autocerto.com');
    assert.equal(options.redirect, 'error');
    if (url.endsWith('/oauth/token')) { assert.equal(options.body.get('password'), 'test-secret'); return json({ access_token: 'test-token', expires_in: 3600 }); }
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    return url.includes('ObterUnidades') ? json({ Codigo: 4734 }) : json([]);
  } });
  assert.deepEqual(await client.fetchStock(), []);
  await client.fetchStock();
  assert.equal(calls.filter(c => c.url.endsWith('/oauth/token')).length, 1);
  assert.equal(calls.filter(c => c.url.endsWith('ObterEstoque?codigoUnidade=4734')).length, 2);
});
test('incorrect dealership rejects inventory even on HTTP200', async () => {
  const client = createAutoCertoClient({ username: 'test', password: 'test', unitCode: '4734', fetchImpl: async url =>
    url.endsWith('/oauth/token') ? json({ access_token: 'test', expires_in: 60 }) : url.includes('ObterUnidades') ? json({ Codigo: 9999 }) : json([]) });
  await assert.rejects(client.fetchStock(), { code: 'WRONG_UNIT' });
});
test('upstream response/error details are never exposed', async () => {
  const client = createAutoCertoClient({ username: 'test', password: 'test', unitCode: '4734', fetchImpl: async () => { throw new Error('private detail'); } });
  await assert.rejects(client.fetchStock(), error => error.code === 'SOURCE_UNAVAILABLE' && !error.message.includes('private'));
});
test('HTML or invalid JSON success cannot be accepted as empty stock', async () => {
  for (const response of [new Response('<html>error</html>'), new Response('{broken', { headers: { 'content-type': 'application/json' } })]) {
    const client = createAutoCertoClient({ username: 'test', password: 'test', unitCode: '4734', fetchImpl: async () => response });
    await assert.rejects(client.fetchStock(), { code: 'INVALID_PAYLOAD' });
  }
});
test('abort/timeout is a source failure with safe code', async () => {
  const client = createAutoCertoClient({ username: 'test', password: 'test', unitCode: '4734', fetchImpl: async (_url, { signal }) => { signal.throwIfAborted(); return json({}); } });
  await assert.rejects(client.fetchStock({ signal: AbortSignal.abort() }), { code: 'SOURCE_UNAVAILABLE' });
});
