// Public inventory reads only the site's server endpoint. Legacy local edits are left intact.
(function (root) {
  const CACHE_KEY = 'sm_autocerto_snapshot_v1';
  const REFRESH_MS = 5 * 60 * 1000;
  function isSnapshot(value) {
    if (!value || value.source !== 'autocerto' || !['fresh', 'stale'].includes(value.status) ||
        !Number.isFinite(Date.parse(value.syncedAt)) || !Array.isArray(value.cars)) return false;
    const ids = new Set();
    return value.cars.every(car => {
      if (!car || typeof car.id !== 'string' || !car.id || ids.has(car.id) ||
          typeof car.sourceId !== 'string' || !car.sourceId || typeof car.brand !== 'string' ||
          typeof car.model !== 'string' || typeof car.version !== 'string' || typeof car.year !== 'string' ||
          !Array.isArray(car.images) || !car.images.length || !car.images.every(image => image && typeof image.gallery === 'string' && typeof image.thumb === 'string') ||
          typeof car.image !== 'string' || !(car.price === null || (Number.isFinite(car.price) && car.price > 0)) ||
          !(car.km === null || (Number.isFinite(car.km) && car.km >= 0))) return false;
      ids.add(car.id);
      return true;
    });
  }
  function createInventoryStore(options) {
    const fetcher = options.fetch;
    const storage = options.storage;
    const now = options.now || Date.now;
    const listeners = new Set();
    let state = { source: 'autocerto', cars: [], syncedAt: null, checkedAt: null, status: 'loading', warning: null };
    let pending = null;
    let attemptedAt = 0;
    let started = false;
    try {
      const saved = JSON.parse(storage.getItem(CACHE_KEY));
      if (saved && saved.version === 1 && isSnapshot(saved.snapshot)) {
        state = { ...saved.snapshot, status: 'stale', warning: 'update_pending' };
      }
    } catch (_) { /* Storage may be disabled; the server remains authoritative. */ }
    function emit() { listeners.forEach(listener => listener()); }
    function refresh(force) {
      if (pending) return pending;
      if (!force && attemptedAt && now() - attemptedAt < REFRESH_MS) return Promise.resolve(state);
      attemptedAt = now();
      pending = (async function () {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), options.timeoutMs || 35000);
        try {
          const response = await fetcher('/api/estoque', { signal: controller.signal, cache: 'no-store', credentials: 'same-origin' });
          if (!response.ok) throw new Error('Inventory unavailable');
          const payload = await response.json();
          if (!isSnapshot(payload)) throw new Error('Invalid inventory');
          if (state.syncedAt && Date.parse(payload.syncedAt) < Date.parse(state.syncedAt)) {
            state = { ...state, status: 'stale', warning: 'update_pending' };
          } else {
            state = { source: 'autocerto', cars: payload.cars, syncedAt: payload.syncedAt,
              checkedAt: payload.checkedAt || payload.syncedAt, status: payload.status,
              warning: payload.status === 'stale' ? 'update_pending' : null };
            try { storage.setItem(CACHE_KEY, JSON.stringify({ version: 1, snapshot: state })); } catch (_) {}
          }
        } catch (_) {
          state = { ...state, status: state.syncedAt ? 'stale' : 'unavailable', warning: 'update_pending' };
        } finally {
          clearTimeout(timer);
          pending = null;
          emit();
        }
        return state;
      })();
      return pending;
    }
    return {
      read: () => state,
      refresh,
      subscribe(listener) {
        listeners.add(listener);
        if (!started) {
          started = true;
          refresh();
          if (options.schedule) options.schedule(() => refresh(), REFRESH_MS);
          if (options.onVisible) options.onVisible(() => refresh());
        }
        return () => listeners.delete(listener);
      }
    };
  }
  function brandSlug(brand) {
    return brand.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
  }
  function findCar(cars, id) {
    return cars.find(car => car.id === id) || cars.find(car => car.sourceId === (id.match(/(?:^|-)(\d+)$/) || [])[1]);
  }
  const exported = { createInventoryStore, isSnapshot, brandSlug, findCar, CACHE_KEY };
  if (typeof module !== 'undefined' && module.exports) module.exports = exported;
  if (root && root.document) {
    let storage;
    try { storage = root.localStorage; } catch (_) { storage = { getItem: () => null, setItem: () => {} }; }
    root.SM_INVENTORY = createInventoryStore({
      fetch: root.fetch.bind(root), storage,
      schedule: callback => root.setInterval(() => { if (!root.document.hidden) callback(); }, REFRESH_MS),
      onVisible: callback => root.document.addEventListener('visibilitychange', () => { if (!root.document.hidden) callback(); })
    });
    root.SM_INVENTORY_HELPERS = exported;
  }
})(typeof window !== 'undefined' ? window : null);
