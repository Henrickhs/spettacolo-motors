'use strict';
const fs = require('node:fs');
const path = require('node:path');
const service = require('../../server/inventory-runtime.cjs');
const { vehicleId, renderVehiclePage } = require('../../server/vehicle-page.cjs');
let shell;
module.exports = async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  // Read identity from the path, never a caller-supplied ?id= override.
  const id = vehicleId(req.url);
  if (!id) return res.status(404).end();
  shell ||= fs.readFileSync(path.join(__dirname, '../../server/generated/vehicle-shell.html'), 'utf8');
  const result = renderVehiclePage({ id, snapshot: await service.get(), shell });
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.setHeader('Vercel-CDN-Cache-Control', `max-age=${result.cacheSeconds}`);
  if (result.status === 503) res.setHeader('Retry-After', '60');
  res.status(result.status);
  return req.method === 'HEAD' ? res.end() : res.send(result.html);
};
