'use strict';
const REFRESH_MS = 30 * 60 * 1000;
const SAFE_CODES = new Set(['INVALID_PAYLOAD', 'INCONSISTENT_STOCK', 'AUTH_FAILED', 'SOURCE_UNAVAILABLE', 'WRONG_UNIT', 'NOT_CONFIGURED']);
function publicSnapshot(snapshot, stale = false) {
  if (!snapshot) return { source: 'autocerto', status: 'unavailable', cars: [], syncedAt: null, checkedAt: null, warning: 'update_pending' };
  return { source: 'autocerto', status: stale || snapshot.lastError ? 'stale' : 'fresh', cars: snapshot.cars,
    syncedAt: snapshot.syncedAt, checkedAt: snapshot.checkedAt, warning: stale || snapshot.lastError ? 'update_pending' : null };
}
function validSnapshot(value, unitCode) {
  return value && value.schemaVersion === 1 && value.unitCode === String(unitCode) && Array.isArray(value.cars)
    && Number.isFinite(Date.parse(value.syncedAt)) && Number.isFinite(Date.parse(value.checkedAt))
    && Number.isFinite(Date.parse(value.refreshAfter)) && value.cars.every(c => c && typeof c.id === 'string' && typeof c.sourceId === 'string');
}
function createInventoryService({ store, fetchStock, normalize, unitCode, now = Date.now }) {
  let pending;
  async function load() {
    let current;
    try { current = await store.read(); } catch { return publicSnapshot(null); }
    const prior = current && validSnapshot(current.value, unitCode) ? current.value : null;
    // Invalid stored data must never be overwritten blindly; it needs operator review.
    if (current && !prior) return publicSnapshot(null);
    if (prior && Date.parse(prior.refreshAfter) > now()) return publicSnapshot(prior);
    const checkedAt = new Date(now()).toISOString();
    try {
      const signal = AbortSignal.timeout(18000);
      const cars = normalize(await fetchStock({ signal }));
      // Full API response has no total-count field. Confirm empty or unusually large
      // removals with another successful, validated read before accepting them.
      if (!cars.length || (prior && cars.length < prior.cars.length * 0.6)) {
        const confirmed = normalize(await fetchStock({ signal }));
        const ids = list => list.map(c => c.sourceId).sort().join(',');
        if (ids(cars) !== ids(confirmed)) throw Object.assign(new Error(), { code: 'INCONSISTENT_STOCK' });
      }
      const next = { schemaVersion: 1, unitCode: String(unitCode), cars, syncedAt: checkedAt, checkedAt,
        refreshAfter: new Date(now() + REFRESH_MS).toISOString(), lastError: null };
      await store.write(next, current?.etag);
      return publicSnapshot(next);
    } catch (error) {
      if (['WRITE_CONFLICT', 'STORAGE_WRITE_FAILED'].includes(error?.code)) {
        try {
          const winner = await store.read();
          if (winner?.etag !== current?.etag && validSnapshot(winner?.value, unitCode)) return publicSnapshot(winner.value);
        } catch { /* Existing snapshot remains the fallback. */ }
      }
      if (!prior) return publicSnapshot(null);
      const stale = { ...prior, checkedAt, lastError: SAFE_CODES.has(error?.code) ? error.code : 'UPDATE_FAILED',
        refreshAfter: new Date(now() + REFRESH_MS).toISOString() };
      // Keep cars and syncedAt intact. Persist retry metadata so cold starts also back off.
      try { await store.write(stale, current.etag); } catch { /* Do not hide valid prior stock on a storage outage. */ }
      return publicSnapshot(stale, true);
    }
  }
  return { get() { if (!pending) pending = load().finally(() => { pending = null; }); return pending; } };
}
module.exports = { createInventoryService, REFRESH_MS, validSnapshot };
