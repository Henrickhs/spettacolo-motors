'use strict';
const { createHash } = require('node:crypto');
const ORIGIN = 'https://www.spettacolomotors.com.br';
const BRAND_IMAGE = ORIGIN + '/assets/brand/spettacolo-logo-full.png';
const METADATA = /<!-- PAGE_METADATA_START -->[\s\S]*?<!-- PAGE_METADATA_END -->/;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const scriptJson = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

function vehicleId(url) {
  const pathname = new URL(url, ORIGIN).pathname;
  const match = pathname.match(/^\/(?:api\/)?veiculo\/([1-9][0-9]{0,15})\/?$/i) ||
    pathname.match(/^\/veiculo\/[^/]+\/([1-9][0-9]{0,15})\/detalhes\/?$/i);
  return match ? match[1] : null;
}

function shareImage(car) {
  try {
    const image = new URL(car.image);
    if (image.protocol !== 'https:' || image.username || image.password || image.port ||
        !(image.hostname === 'autocerto.com' || image.hostname.endsWith('.autocerto.com')) ||
        !/\.(?:jpe?g|png|webp|avif)$/i.test(image.pathname)) return BRAND_IMAGE;
    image.search = '';
    image.hash = '';
    // A new source photo/version gets a distinct URL in messaging caches.
    image.searchParams.set('v', createHash('sha256').update(image.href + '|' + (car.sourceModifiedAt || '')).digest('hex').slice(0, 12));
    return image.href;
  } catch { return BRAND_IMAGE; }
}

function renderVehiclePage({ id, snapshot, shell }) {
  if (!METADATA.test(shell)) throw new Error('VEHICLE_SHELL_INVALID');
  const unavailable = !snapshot || snapshot.status === 'unavailable';
  const car = !unavailable && snapshot.cars.find(item => item.sourceId === id);
  const uncertainMissing = !car && snapshot?.status === 'stale';
  const status = unavailable || uncertainMissing ? 503 : car ? 200 : 404;
  const canonical = ORIGIN + '/veiculo/' + id;
  const name = car ? [car.brand, car.model, car.yearModel].filter(Boolean).join(' ') : '';
  const title = car ? name + ' | Spettacolo Motors' : status === 503 ? 'Estoque temporariamente indisponível | Spettacolo Motors' : 'Veículo fora do estoque | Spettacolo Motors';
  const details = car ? [car.version, car.year, car.km == null ? null : new Intl.NumberFormat('pt-BR').format(car.km) + ' km',
    car.price == null ? 'Preço sob consulta' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(car.price)].filter(Boolean).join(' · ') : '';
  const description = car ? details + '. ' + (snapshot.status === 'stale' ? 'Dados da última consulta. ' : '') + 'Confirme a disponibilidade com a Spettacolo Motors.' :
    status === 503 ? 'Não foi possível confirmar o estoque agora. Tente novamente ou fale com a Spettacolo Motors.' : 'Este veículo não consta no estoque atual. Conheça os veículos disponíveis na Spettacolo Motors.';
  const image = car ? shareImage(car) : BRAND_IMAGE;
  const imageAlt = car && image !== BRAND_IMAGE ? name + ' — foto do veículo' : 'Spettacolo Motors';
  const meta = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<meta name="robots" content="${status === 200 ? 'index, follow, max-image-preview:large' : 'noindex, follow'}">`,
    `<link rel="canonical" href="${canonical}">`,
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="Spettacolo Motors">',
    '<meta property="og:locale" content="pt_BR">',
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${escapeHtml(image)}">`,
    `<meta property="og:image:secure_url" content="${escapeHtml(image)}">`,
    `<meta property="og:image:alt" content="${escapeHtml(imageAlt)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    `<meta name="twitter:image" content="${escapeHtml(image)}">`,
    `<meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}">`
  ];
  if (car) {
    const schema = { '@context': 'https://schema.org', '@type': 'Car', name, url: canonical, image,
      brand: { '@type': 'Brand', name: car.brand }, model: car.model, vehicleModelDate: car.yearModel,
      ...(car.price == null ? {} : { offers: { '@type': 'Offer', url: canonical, priceCurrency: 'BRL', price: car.price } }) };
    meta.push(`<script type="application/ld+json">${scriptJson(schema)}</script>`);
  }
  // Public content is useful even when the reader does not execute JavaScript.
  const fallback = `<noscript><main style="max-width:1000px;margin:80px auto;padding:24px"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p>${car ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(imageAlt)}" style="max-width:100%;height:auto">` : ''}<p><a href="/#/estoque">Ver estoque da Spettacolo Motors</a></p></main><style>#__splash{display:none}</style></noscript>`;
  const html = shell.replace(METADATA, () => meta.join('\n')).replace('<div id="root"></div>', () => '<div id="root"></div>' + fallback);
  return { html, status, cacheSeconds: status === 503 ? 30 : snapshot?.status === 'stale' ? 60 : 300 };
}

module.exports = { vehicleId, renderVehiclePage, shareImage, ORIGIN };
