'use strict';
const { createAutoCertoClient } = require('../server/autocerto-client.cjs');
const { normalizeStock } = require('../server/autocerto-model.cjs');
const { createBlobStore } = require('../server/blob-store.cjs');
const { createInventoryService } = require('../server/inventory-service.cjs');
const unitCode = process.env.AUTOCERTO_UNIT_CODE;
const client = createAutoCertoClient({ username: process.env.AUTOCERTO_USERNAME, password: process.env.AUTOCERTO_PASSWORD, unitCode });
const service = createInventoryService({ store: createBlobStore(), fetchStock: client.fetchStock, normalize: normalizeStock, unitCode });
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  const result = await service.get();
  const unavailable = result.status === 'unavailable';
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.setHeader('Vercel-CDN-Cache-Control', unavailable ? 'max-age=30' : 'max-age=300');
  if (unavailable) res.setHeader('Retry-After', '60');
  res.status(unavailable ? 503 : 200);
  return req.method === 'HEAD' ? res.end() : res.json(result);
};
