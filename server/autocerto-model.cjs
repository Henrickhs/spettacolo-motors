'use strict';

const PLACEHOLDER = '/assets/vehicle-placeholder.svg';
const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

function invalid() {
  const error = new Error('AutoCerto returned an invalid inventory payload.');
  error.code = 'INVALID_PAYLOAD';
  throw error;
}

function object(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function text(value, required = false, max = 500) {
  if (value == null && !required) return '';
  if (typeof value !== 'string') invalid();
  const result = value.trim();
  if ((required && !result) || result.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(result)) invalid();
  return result;
}

// The API normally returns numbers. Accept explicit Brazilian money formats
// without silently interpreting malformed values as zero.
function number(value, { nullable = false, integer = false, max = 1e10 } = {}) {
  if (value === null && nullable) return null;
  let result = value;
  if (typeof value === 'string') {
    const valueText = value.trim().replace(/^R\$\s*/, '');
    if (/^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(valueText)) {
      result = Number(valueText.replace(/\./g, '').replace(',', '.'));
    } else if (/^\d+(?:[.,]\d{1,2})?$/.test(valueText)) {
      result = Number(valueText.replace(',', '.'));
    } else {
      invalid();
    }
  }
  if (typeof result !== 'number' || !Number.isFinite(result) || result < 0 || result > max || (integer && !Number.isInteger(result))) invalid();
  return result;
}

function year(value) {
  const result = number(value, { integer: true, max: 2200 });
  if (result < 1886) invalid();
  return String(result);
}

function safePhoto(value) {
  const source = text(value, true, 2048);
  try {
    const url = new URL(source);
    if (url.protocol !== 'https:' || url.username || url.password || url.port ||
        !(url.hostname === 'autocerto.com' || url.hostname.endsWith('.autocerto.com')) ||
        !/\.(?:jpe?g|png|webp|avif)$/i.test(url.pathname)) return null;
    // Images supplied by AutoCerto use stable paths. Never publish query tokens.
    url.search = '';
    url.hash = '';
    return url.href;
  } catch {
    return null;
  }
}

function photos(value) {
  if (!Array.isArray(value) || value.length > 200) invalid();
  const sorted = value.map((photo, index) => {
    if (!object(photo) || !own(photo, 'URL')) invalid();
    return {
      url: safePhoto(photo.URL),
      position: photo.Posicao == null ? index : number(photo.Posicao, { integer: true, max: 100000 })
    };
  }).sort((a, b) => a.position - b.position);
  const urls = [...new Set(sorted.map(photo => photo.url).filter(Boolean))];
  return (urls.length ? urls : [PLACEHOLDER]).map(url => ({ gallery: url, thumb: url, remote: url }));
}

function features(value) {
  if (value == null) return [];
  if (!Array.isArray(value) || value.length > 300) invalid();
  return [...new Set(value.map(feature => {
    if (!object(feature)) invalid();
    return text(feature.Descricao, true);
  }))];
}

function normalizeCar(value) {
  if (!object(value)) invalid();
  for (const key of ['Codigo', 'Marca', 'Modelo', 'AnoFabricacao', 'AnoModelo', 'Km', 'Fotos']) {
    if (!own(value, key)) invalid();
  }
  if (!own(value, 'PrecoClassificados') && !own(value, 'Preco')) invalid();
  const code = number(value.Codigo, { integer: true, max: Number.MAX_SAFE_INTEGER });
  if (code === 0) invalid();
  const sourceId = String(code);
  const yearModel = year(value.AnoModelo);
  const yearManufacture = year(value.AnoFabricacao);
  const price = number(own(value, 'PrecoClassificados') ? value.PrecoClassificados : value.Preco, { nullable: true });
  const images = photos(value.Fotos);
  if (value.Destaque != null && typeof value.Destaque !== 'boolean') invalid();
  const result = {
    id: `autocerto-${sourceId}`,
    sourceId,
    ref: `AC-${sourceId}`,
    brand: text(value.Marca, true, 200),
    model: text(value.Modelo, true, 200),
    version: text(value.Versao),
    year: `${yearManufacture}/${yearModel}`,
    yearModel,
    km: number(value.Km, { nullable: true, integer: true, max: 1e8 }),
    price: price === 0 ? null : price,
    transmission: text(value.Cambio),
    fuel: text(value.Combustivel),
    color: text(value.Cor),
    bodyType: text(value.Categoria),
    image: images[0].gallery,
    thumbImage: images[0].thumb,
    coverImage: images[0].gallery,
    images,
    features: features(value.Opcionais),
    featured: value.Destaque === true
  };
  if (value.DataModificacao != null && value.DataModificacao !== '') {
    const modified = text(value.DataModificacao, true, 40);
    // AutoCerto returns a local timestamp without an offset; preserve it rather
    // than inventing a timezone. The snapshot carries its own UTC syncedAt.
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,7})?(?:Z|[+-]\d{2}:\d{2})?$/.test(modified) || !Number.isFinite(Date.parse(modified))) invalid();
    result.sourceModifiedAt = modified;
  }
  return result;
}

function normalizeStock(payload) {
  if (!Array.isArray(payload) || payload.length > 5000) invalid();
  const seen = new Set();
  return payload.map(value => {
    const car = normalizeCar(value);
    if (seen.has(car.sourceId)) invalid();
    seen.add(car.sourceId);
    return car;
  });
}

module.exports = { normalizeStock };
