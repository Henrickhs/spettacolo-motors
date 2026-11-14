'use strict';
const { createAutoCertoClient } = require('./autocerto-client.cjs');
const { normalizeStock } = require('./autocerto-model.cjs');
const { createBlobStore } = require('./blob-store.cjs');
const { createInventoryService } = require('./inventory-service.cjs');
const unitCode = process.env.AUTOCERTO_UNIT_CODE;
const client = createAutoCertoClient({ username: process.env.AUTOCERTO_USERNAME, password: process.env.AUTOCERTO_PASSWORD, unitCode });
module.exports = createInventoryService({ store: createBlobStore(), fetchStock: client.fetchStock, normalize: normalizeStock, unitCode });
