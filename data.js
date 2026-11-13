// SPETTACOLO MOTORS ? Data
window.SM_DATA = {
  contact: {
    phones: ["(31) 99977-0215", "(31) 99161-5477"],
    whatsapp: "5531991615477",
    address: "Avenida Victoria, Nº 260 — Jardim Canadá, Nova Lima — MG",
    hours: "Seg a Sex: 9h às 18h  |  Sáb: 9h às 16h",
    instagram: "@spettacolo.motors",
    tiktok: "@spettacolomotors",
    youtube: "spettacolo.motors",
    email: "contato@spettacolomotors.com.br",
    mapsEmbed: "https://maps.google.com/maps?q=-20.0590303,-43.9805092&z=15&output=embed"
  },

  brands: [
    { slug: "audi",          name: "Audi",          logo: "https://www.autocerto.com/fabricantes/audi.webp?v=2" },
    { slug: "bmw",           name: "BMW",           logo: "https://www.autocerto.com/fabricantes/bmw.webp?v=2" },
    { slug: "cadillac",      name: "Cadillac",      logo: "https://www.autocerto.com/fabricantes/cadillac.webp?v=2" },
    { slug: "chevrolet",     name: "Chevrolet",     logo: "https://www.autocerto.com/fabricantes/chevrolet.webp?v=2" },
    { slug: "ford",          name: "Ford",          logo: "https://www.autocerto.com/fabricantes/ford.webp?v=2" },
    { slug: "jaguar",        name: "Jaguar",        logo: "https://www.autocerto.com/fabricantes/jaguar.webp?v=2" },
    { slug: "land-rover",    name: "Land Rover",    logo: "https://www.autocerto.com/fabricantes/landrover.webp?v=2" },
    { slug: "mercedes-benz", name: "Mercedes-Benz", logo: "https://www.autocerto.com/fabricantes/mercedesbenz.webp?v=2" },
    { slug: "mini",          name: "Mini",          logo: "https://www.autocerto.com/fabricantes/mini.webp?v=2" },
    { slug: "porsche",       name: "Porsche",       logo: "https://www.autocerto.com/fabricantes/porsche.webp?v=2" },
    { slug: "volkswagen",    name: "Volkswagen",    logo: "https://www.autocerto.com/fabricantes/volkswagen.webp?v=2" }
  ]

};

// Format helpers
window.SM_FMT = {
  money(v) {
    if (v === null || v === undefined || !Number.isFinite(v) || v <= 0) return 'Sob consulta';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(v);
  },
  km(v) {
    if (v === null || v === undefined || !Number.isFinite(v)) return 'KM sob consulta';
    return new Intl.NumberFormat('pt-BR').format(v) + ' km';
  },
  shortMoney(v) {
    if (v === null || v === undefined || !Number.isFinite(v) || v <= 0) return 'Sob consulta';
    if (v >= 1000000) return 'R$ ' + (v/1000000).toFixed(2).replace('.', ',') + 'M';
    return 'R$ ' + Math.round(v/1000) + 'k';
  }
};
