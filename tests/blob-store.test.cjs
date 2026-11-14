const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createBlobStore } = require('../server/blob-store.cjs');
const { BlobError, BlobPreconditionFailedError } = require('@vercel/blob');
test('snapshot private origin read preserves etag for conditional writes', async () => {
  let putOptions;
  const store = createBlobStore({ environment: 'production', sdk: {
    get: async (key, options) => {
      assert.equal(key, 'autocerto/production/inventory-v1.json');
      assert.equal(options.access, 'private'); assert.equal(options.useCache, false);
      return { statusCode: 200, stream: new Response('{"cars":[]}').body, blob: { etag: 'version-1' } };
    }, put: async (_key, _body, options) => { putOptions = options; }
  } });
  const current = await store.read();
  await store.write(current.value, current.etag);
  assert.equal(putOptions.ifMatch, 'version-1');
  assert.equal(putOptions.access, 'private');
});
test('preview cannot overwrite production and first write cannot clobber concurrent creation', async () => {
  const store = createBlobStore({ environment: 'preview', sdk: { put: async (key, _body, options) => {
    assert.equal(key, 'autocerto/preview/inventory-v1.json');
    assert.equal(options.allowOverwrite, false);
    throw new BlobError('Already exists');
  } } });
  await assert.rejects(store.write({ cars: [] }), { code: 'STORAGE_WRITE_FAILED' });
});
test('SDK ETag conflict is recoverable', async () => {
  const store = createBlobStore({ sdk: { put: async () => { throw new BlobPreconditionFailedError(); } } });
  await assert.rejects(store.write({}, 'old-etag'), { code: 'WRITE_CONFLICT' });
});

test('refresh uses the strong origin ETag instead of the compressed weak validator', async () => {
  const strongEtag = '"snapshot-version-1"';
  let written = false;
  const store = createBlobStore({ environment: 'production', sdk: {
    get: async (_key, options) => ({ statusCode: 200,
      stream: new Response('{"cars":[]}').body,
      blob: { etag: options.headers?.['Accept-Encoding'] === 'identity' ? strongEtag : 'W/' + strongEtag }
    }),
    put: async (_key, _body, options) => {
      if (options.ifMatch !== strongEtag) throw new BlobPreconditionFailedError();
      assert.equal(options.allowOverwrite, true);
      written = true;
    }
  } });
  const snapshot = await store.read();
  await store.write(snapshot.value, snapshot.etag);
  assert.equal(written, true);
});
