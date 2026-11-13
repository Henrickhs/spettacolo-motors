'use strict';
const ORIGIN = 'https://integracao.autocerto.com';
const fail = code => Object.assign(new Error(code), { code });
function createAutoCertoClient({ username, password, unitCode, fetchImpl = fetch }) {
  let token, expiresAt = 0;
  async function request(path, options = {}) {
    try {
      const signal = options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(7000)]) : AbortSignal.timeout(7000);
      const response = await fetchImpl(ORIGIN + path, { ...options, redirect: 'error', signal });
      if (!response.ok) throw fail(response.status === 401 || response.status === 403 ? 'AUTH_FAILED' : 'SOURCE_UNAVAILABLE');
      if (!response.headers.get('content-type')?.toLowerCase().includes('json')) throw fail('INVALID_PAYLOAD');
      if (Number(response.headers.get('content-length')) > 5_000_000) throw fail('INVALID_PAYLOAD');
      const body = await response.text();
      if (body.length > 5_000_000) throw fail('INVALID_PAYLOAD');
      try { return JSON.parse(body); } catch { throw fail('INVALID_PAYLOAD'); }
    } catch (error) {
      if (['AUTH_FAILED', 'SOURCE_UNAVAILABLE', 'INVALID_PAYLOAD'].includes(error?.code)) throw error;
      throw fail('SOURCE_UNAVAILABLE');
    }
  }
  async function authenticate(signal) {
    if (!username || !password || !/^\d+$/.test(String(unitCode || ''))) throw fail('NOT_CONFIGURED');
    if (token && Date.now() < expiresAt) return token;
    const result = await request('/oauth/token', { method: 'POST', signal, headers: { Accept: 'application/json' },
      body: new URLSearchParams({ grant_type: 'password', username, password }) });
    if (typeof result.access_token !== 'string' || !result.access_token) throw fail('AUTH_FAILED');
    token = result.access_token;
    expiresAt = Date.now() + Math.max(0, Math.min(Number(result.expires_in) || 0, 3600) - 60) * 1000;
    return token;
  }
  async function readStock({ signal } = {}, retry = true) {
    const headers = { Authorization: 'Bearer ' + await authenticate(signal), Accept: 'application/json' };
    try {
      const [units, stock] = await Promise.all([
        request('/api/Cliente/ObterUnidades', { headers, signal }),
        // Pin the dealership, even if access later expands to additional units.
        request('/api/Veiculo/ObterEstoque?codigoUnidade=' + encodeURIComponent(unitCode), { headers, signal })
      ]);
      const list = Array.isArray(units) ? units : [units];
      if (!list.some(u => String(u?.Codigo) === String(unitCode))) throw fail('WRONG_UNIT');
      return stock;
    } catch (error) {
      if (error.code === 'AUTH_FAILED' && retry) { token = null; expiresAt = 0; return readStock({ signal }, false); }
      throw error;
    }
  }
  return { fetchStock: readStock };
}
module.exports = { createAutoCertoClient };
