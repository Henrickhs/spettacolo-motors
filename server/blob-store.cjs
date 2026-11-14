'use strict';
const { get, put, BlobPreconditionFailedError } = require('@vercel/blob');
function createBlobStore({ environment = process.env.VERCEL_ENV, sdk = { get, put } } = {}) {
  const namespace = environment === 'production' ? 'production' : 'preview';
  const pathname = `autocerto/${namespace}/inventory-v1.json`;
  return {
    async read() {
      // Compressed responses can weaken the ETag (W/), which cannot satisfy
      // Blob's strong If-Match comparison. Read the identity representation.
      const result = await sdk.get(pathname, { access: 'private', useCache: false,
        headers: { 'Accept-Encoding': 'identity' }, abortSignal: AbortSignal.timeout(4000) });
      if (!result) return null;
      if (result.statusCode !== 200) throw new Error('STORAGE_READ_FAILED');
      const value = await new Response(result.stream).json();
      return { value, etag: result.blob.etag };
    },
    async write(value, etag) {
      try {
        return await sdk.put(pathname, JSON.stringify(value), { access: 'private', addRandomSuffix: false,
          contentType: 'application/json', cacheControlMaxAge: 60, allowOverwrite: !!etag,
          ...(etag ? { ifMatch: etag } : {}), abortSignal: AbortSignal.timeout(4000) });
      } catch (error) {
        const type = error?.constructor?.name;
        console.error('[inventory] snapshot_write_failed', {
          type: /^Blob[A-Za-z]*Error$/.test(type || '') ? type : 'Error',
          etagPresent: !!etag, etagWeak: String(etag || '').startsWith('W/'),
          etagQuoted: /^".*"$/.test(etag || '')
        });
        if (error instanceof BlobPreconditionFailedError) {
          throw Object.assign(new Error('WRITE_CONFLICT'), { code: 'WRITE_CONFLICT' });
        }
        // The SDK reports create-if-absent collisions as a generic BlobError.
        // The service re-reads after any failed write to recover a concurrent winner.
        throw Object.assign(new Error('STORAGE_WRITE_FAILED'), { code: 'STORAGE_WRITE_FAILED' });
      }
    }
  };
}
module.exports = { createBlobStore };
