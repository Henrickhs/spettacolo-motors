(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.SM_ROUTING = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  const CHANGE_EVENT = 'sm-route-changed';
  function vehicleId(route) {
    const path = route.split('?')[0];
    const legacy = /^\/veiculo\/[^/]+\/(\d+)\/detalhes\/?$/i.exec(path);
    const detail = /^\/veiculo\/([^/]+)\/?$/i.exec(path);
    const raw = legacy?.[1] || (detail?.[1].match(/(?:^|-)(\d+)$/) || [])[1];
    if (!raw || !Number.isSafeInteger(Number(raw)) || Number(raw) <= 0) return null;
    return String(Number(raw));
  }
  function normalizeRoute(route) {
    const id = vehicleId(route);
    return id ? '/veiculo/' + id : route;
  }
  function getRoute(location) {
    if (location.hash?.startsWith('#/')) return normalizeRoute(location.hash.slice(1));
    const id = vehicleId(location.pathname || '/');
    return id ? '/veiculo/' + id : '/';
  }
  function routeUrl(route) {
    if (typeof route !== 'string' || !route.startsWith('/') || route.startsWith('//') || /[\\#\u0000-\u001f]/.test(route)) {
      throw new TypeError('Expected a local application route');
    }
    const id = vehicleId(route);
    return id ? '/veiculo/' + id : '/#' + route;
  }
  function createRouter(host) {
    function canonicalizeDetailHash() {
      const hashRoute = host.location.hash?.startsWith('#/') ? host.location.hash.slice(1) : '';
      const id = vehicleId(hashRoute);
      if (!id) return;
      const params = new URLSearchParams(host.location.search);
      const hashQuery = hashRoute.indexOf('?');
      if (hashQuery !== -1) {
        for (const [key, value] of new URLSearchParams(hashRoute.slice(hashQuery + 1))) params.append(key, value);
      }
      const query = params.toString();
      host.history.replaceState(host.history.state, '', '/veiculo/' + id + (query ? '?' + query : ''));
    }
    const read = () => getRoute(host.location);
    canonicalizeDetailHash();
    return {
      read,
      go(route) {
        const target = routeUrl(route);
        const current = host.location.pathname + host.location.search + host.location.hash;
        if (target !== current) host.history.pushState(null, '', target);
        host.dispatchEvent(new host.Event(CHANGE_EVENT));
        host.scrollTo({ top: 0, behavior: 'instant' });
      },
      subscribe(listener) {
        const update = () => { canonicalizeDetailHash(); listener(read()); };
        for (const event of [CHANGE_EVENT, 'popstate', 'hashchange']) host.addEventListener(event, update);
        return () => {
          for (const event of [CHANGE_EVENT, 'popstate', 'hashchange']) host.removeEventListener(event, update);
        };
      }
    };
  }
  return { getRoute, routeUrl, createRouter };
});
