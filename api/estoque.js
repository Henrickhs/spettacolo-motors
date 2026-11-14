'use strict';
const service = require('../server/inventory-runtime.cjs');
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
