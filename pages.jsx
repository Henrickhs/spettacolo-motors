// SPETTACOLO MOTORS — Pages
const { useState: uS, useEffect: uE, useMemo: uM, useRef: uR } = React;

// ============================================
// HOME
// ============================================
function HomePage() {
  const [cars] = useCars();
  const featured = cars.filter(c => c.featured).slice(0, 6);
  if (featured.length < 6) {
    const fill = cars.filter(c => !c.featured);
    featured.push(...fill.slice(0, 6 - featured.length));
  }
  const topCar = [...cars].sort((a, b) => b.price - a.price)[0];

  return (
    <div className="route-anim">
      <Hero />
      <Marquee />
      <BrandStrip />
      <SpotlightSection car={topCar} />
      <FeaturedSection cars={featured} />
      <ConciergeSection />
      <CategorySection />
      <ProcessSection />
      <CTASection />
    </div>
  );
}

function Hero() {
  const videoRef = uR(null);
  uE(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.85;
    }
  }, []);
  return (
    <section className="hero">
      <div className="hero-poster"/>
      <video ref={videoRef} className="hero-video" autoPlay muted loop playsInline preload="auto">
        <source src="hero-bg.mp4" type="video/mp4"/>
      </video>
      <div className="hero-overlay"/>
      <div className="hero-grain"/>
      <div className="hero-scanline"/>
      <HeroDust/>

      <div className="hero-inner">
        <div className="hero-meta">
          <div className="hero-meta-left">
            <div className="eyebrow" data-anim="fade-up" data-delay="100">Esportivos · SUVs · Colecionáveis</div>
          </div>
        </div>

        <h1>
          <span className="word-reveal" style={{animationDelay:'0.2s'}}><span><span className="acc">S</span>pettacolo</span></span>
          <br/>
          <span className="word-reveal" style={{animationDelay:'0.45s'}}><em>Motors.</em></span>
        </h1>
        <p className="hero-sub" data-anim="fade-up" data-delay="700">
          Uma curadoria de máquinas raras para quem entende que dirigir é arte. Esportivos, SUVs premium e colecionáveis — selecionados peça por peça, com procedência verificada e atendimento concierge.
        </p>
        <div className="hero-actions" data-anim="fade-up" data-delay="900">
          <button className="btn" onClick={() => SM_NAV.go('/estoque')}>
            Ver estoque <span className="arrow">→</span>
          </button>
          <button className="btn ghost" onClick={() => SM_NAV.go('/vender')}>
            Vender meu veículo
          </button>
        </div>
      </div>
    </section>
  );
}

function BrandStrip() {
  return (
    <section className="brand-strip">
      <div className="container">
        <div className="brand-strip-title" data-anim="fade-up">
          <div className="eyebrow" style={{marginBottom:14}}>Trabalhamos com as principais</div>
          <h2 className="serif" style={{fontSize:'clamp(28px, 4vw, 48px)', lineHeight:1, letterSpacing:'-0.015em'}}>
            Marcas sob <em style={{fontStyle:'italic', color:'var(--gold)'}}>curadoria</em>
          </h2>
        </div>
        <div className="brand-grid" data-anim="fade-up" data-delay="200">
          {SM_DATA.brands.map(b => (
            <a key={b.slug} className="brand-cell" href={"#/estoque?marca=" + b.slug}
               onClick={(e) => { e.preventDefault(); SM_NAV.go('/estoque?marca=' + b.slug); }}>
              <img className="brand-logo" src={b.logo} alt={b.name} loading="lazy"
                   onError={(e) => { e.target.style.display = 'none'; }}/>
              <span className="brand-name">{b.name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedSection({ cars }) {
  return (
    <section className="section">
      <div className="container" style={{marginBottom:48}}>
        <div className="flex between" style={{alignItems:'flex-end', flexWrap:'wrap', gap:24}} data-anim="fade-up">
          <div>
            <div className="eyebrow" style={{marginBottom:14}}>Em destaque · últimas novidades</div>
            <h2 className="section-title">
              Coleção <em style={{fontStyle:'italic', color:'var(--gold)'}}>atual</em>
            </h2>
          </div>
          <button className="btn gold-line" onClick={() => SM_NAV.go('/estoque')}>
            Ver todos · {cars.length}+ <span className="arrow">→</span>
          </button>
        </div>
      </div>
      <div className="car-grid" data-anim="fade-up" data-delay="150">
        {cars.map(c => <CarCard key={c.id} car={c}/>)}
      </div>
    </section>
  );
}

function CategorySection() {
  const cats = [
    { l: 'Esportivos', n: '01', d: 'Cupês, conversíveis e máquinas de pista' },
    { l: 'SUVs Premium', n: '02', d: 'Altos rendimentos com altura de comando' },
    { l: 'Colecionáveis', n: '03', d: 'Modelos raros para conservação e revenda' }
  ];
  return (
    <section className="section tight" style={{background:'var(--bg-2)', borderTop:'1px solid var(--line-soft)', borderBottom:'1px solid var(--line-soft)'}}>
      <div className="container">
        <div className="eyebrow" style={{marginBottom:14}}>Três pilares</div>
        <h2 className="section-title" style={{marginBottom:60}}>
          O que <em style={{fontStyle:'italic', color:'var(--gold)'}}>buscamos</em>
        </h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:1, background:'var(--line-soft)', border:'1px solid var(--line-soft)'}} className="cat-grid">
          {cats.map(c => (
            <div key={c.n} style={{background:'var(--bg-2)', padding:'40px 32px'}}>
              <div className="mono" style={{fontSize:12, color:'var(--gold)', letterSpacing:'0.2em', marginBottom:24}}>— {c.n}</div>
              <h3 className="serif" style={{fontSize:36, lineHeight:1, marginBottom:16}}>{c.l}</h3>
              <p style={{color:'var(--ink-mute)', fontSize:14, lineHeight:1.7}}>{c.d}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 720px) { .cat-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

function ProcessSection() {
  const steps = [
    { n: '01', t: 'Curadoria', d: 'Selecionamos cada veículo com histórico transparente, procedência e revisão completa.' },
    { n: '02', t: 'Avaliação', d: 'Vistoria mecânica e estética detalhada antes de qualquer carro entrar no nosso showroom.' },
    { n: '03', t: 'Negociação', d: 'Aceitamos seu carro na troca, financiamos em até 60x e cuidamos da documentação.' },
    { n: '04', t: 'Entrega', d: 'Você sai da loja em um carro impecável — ou recebe em casa, em qualquer estado.' }
  ];
  return (
    <section className="section">
      <div className="container">
        <div className="eyebrow" style={{marginBottom:14}}>Como trabalhamos</div>
        <h2 className="section-title" style={{marginBottom:60}}>
          Quatro passos. <em style={{fontStyle:'italic', color:'var(--gold)'}}>Zero atrito.</em>
        </h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:40}} className="proc-grid">
          {steps.map(s => (
            <div key={s.n}>
              <div className="serif" style={{fontSize:64, color:'var(--gold)', letterSpacing:'-0.03em', lineHeight:1, marginBottom:24, fontStyle:'italic'}}>{s.n}</div>
              <div className="hr-gold" style={{marginBottom:20}}/>
              <h3 style={{fontSize:18, letterSpacing:'0.06em', marginBottom:10, textTransform:'uppercase'}}>{s.t}</h3>
              <p style={{color:'var(--ink-mute)', fontSize:14, lineHeight:1.7}}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 960px) { .proc-grid { grid-template-columns: repeat(2, 1fr) !important; } } @media (max-width: 560px) { .proc-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

function CTASection() {
  return (
    <section className="section" style={{background:'var(--bg-2)', borderTop:'1px solid var(--line-soft)', borderBottom:'1px solid var(--line-soft)'}}>
      <div className="container" style={{textAlign:'center'}}>
        <div className="eyebrow" style={{marginBottom:20}}>Pronto?</div>
        <h2 className="serif" style={{fontSize:'clamp(40px, 7vw, 88px)', lineHeight:0.95, letterSpacing:'-0.02em', maxWidth:920, margin:'0 auto 32px'}}>
          O próximo carro da sua coleção <em style={{fontStyle:'italic', color:'var(--gold)'}}>te espera.</em>
        </h2>
        <div className="flex" style={{gap:16, justifyContent:'center', flexWrap:'wrap'}}>
          <button className="btn" onClick={() => SM_NAV.go('/estoque')}>Ver estoque <span className="arrow">→</span></button>
          <button className="btn ghost" onClick={() => SM_NAV.go('/contato')}>Falar com consultor</button>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = ['Esportivos', 'SUVs Premium', 'Colecionáveis', 'Curadoria Nacional', 'Procedência Verificada', 'Concierge'];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {[...items, ...items, ...items].map((it, i) => (
          <span key={i} className="marquee-item">
            <span className="marquee-dot">◆</span> {it}
          </span>
        ))}
      </div>
    </div>
  );
}

function SpotlightSection({ car }) {
  if (!car) return null;
  const whatsMsg = encodeURIComponent("Olá, tenho interesse no " + car.brand + " " + car.model + " (" + car.ref + ")");
  return (
    <section className="spotlight">
      <div className="spotlight-img">
        <img src={car.image} alt={car.brand + ' ' + car.model}
             onError={(e) => { e.target.style.display='none'; }}/>
        <div className="spotlight-overlay"/>
      </div>
      <div className="container spotlight-content">
        <div className="spotlight-tag" data-anim="fade-up">
          <span className="mono" style={{color:'var(--gold)'}}>◆ DESTAQUE ATUAL</span>
          <span className="mono" style={{color:'var(--ink-mute)'}}>· REF {car.ref}</span>
        </div>
        <h2 className="spotlight-title" data-anim="fade-up" data-delay="100">
          {car.brand}<br/>
          <em>{car.model}</em>
        </h2>
        <div className="spotlight-meta" data-anim="fade-up" data-delay="200">
          <div><span className="lbl">Ano</span><span className="val">{car.year}</span></div>
          <div><span className="lbl">KM</span><span className="val">{SM_FMT.km(car.km)}</span></div>
          <div><span className="lbl">Câmbio</span><span className="val">{car.transmission}</span></div>
          <div><span className="lbl">Valor</span><span className="val gold">{SM_FMT.money(car.price)}</span></div>
        </div>
        <p className="spotlight-desc" data-anim="fade-up" data-delay="300">
          {car.version}. Procedência verificada, revisões em dia, pronto para entrega imediata.
        </p>
        <div className="flex gap-sm" data-anim="fade-up" data-delay="400" style={{gap:14, flexWrap:'wrap'}}>
          <button className="btn" onClick={() => SM_NAV.go('/veiculo/' + car.id)}>
            Ver detalhes <span className="arrow">→</span>
          </button>
          <a className="btn ghost" target="_blank" rel="noreferrer"
             href={"https://api.whatsapp.com/send?phone=" + SM_DATA.contact.whatsapp + "&text=" + whatsMsg}>
            Falar com consultor
          </a>
        </div>
      </div>
    </section>
  );
}

function ConciergeSection() {
  const services = [
    { t: 'Procedência', d: 'Laudo cautelar, vistoria mecânica e histórico aberto antes de cada venda.' },
    { t: 'Financiamento', d: 'Parcerias com os maiores bancos. Aprovação em até 1h útil, sem burocracia.' },
    { t: 'Troca & Consignação', d: 'Aceitamos seu carro na troca ou cuidamos da venda dele para você.' },
    { t: 'Entrega Nacional', d: 'Levamos o carro até você em qualquer estado, com seguro e cegonha credenciada.' }
  ];
  return (
    <section className="section concierge" style={{background:'var(--bg-2)', borderTop:'1px solid var(--line-soft)', borderBottom:'1px solid var(--line-soft)'}}>
      <div className="container">
        <div style={{display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:80, alignItems:'start'}} className="conc-grid">
          <div>
            <div className="eyebrow" style={{marginBottom:14}}>Serviço · concierge</div>
            <h2 className="section-title">
              Muito além de<br/>uma <em style={{fontStyle:'italic', color:'var(--gold)'}}>concessionária.</em>
            </h2>
            <div className="hr-gold" style={{marginTop:32, marginBottom:32}}/>
            <p style={{color:'var(--ink-mute)', fontSize:15, lineHeight:1.8}}>
              Cuidamos do processo inteiro — do primeiro contato à entrega no seu endereço. Você só pensa em dirigir.
            </p>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'var(--line-soft)', border:'1px solid var(--line-soft)'}} className="conc-services">
            {services.map((s, i) => (
              <div key={s.t} style={{background:'var(--bg-2)', padding:'32px 28px'}}>
                <div className="mono" style={{fontSize:11, color:'var(--gold)', letterSpacing:'0.24em', marginBottom:18}}>0{i+1}</div>
                <h3 className="serif" style={{fontSize:28, lineHeight:1, marginBottom:12, letterSpacing:'-0.01em'}}>{s.t}</h3>
                <p style={{color:'var(--ink-mute)', fontSize:14, lineHeight:1.7}}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 960px) { .conc-grid { grid-template-columns: 1fr !important; gap: 40px !important; } } @media (max-width: 560px) { .conc-services { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

// ============================================
// ESTOQUE
// ============================================
function EstoquePage() {
  const [cars] = useCars();
  const route = useRoute();
  const initialMarca = uM(() => {
    const q = route.split('?')[1];
    if (!q) return null;
    const m = new URLSearchParams(q).get('marca');
    return m;
  }, [route]);

  const [brand, setBrand] = uS(initialMarca);
  const [search, setSearch] = uS('');
  const [sort, setSort] = uS('featured');

  uE(() => setBrand(initialMarca), [initialMarca]);

  const filtered = uM(() => {
    let r = [...cars];
    if (brand) r = r.filter(c => c.brand.toLowerCase().replace(/\s/g,'-') === brand.toLowerCase());
    if (search) {
      const s = search.toLowerCase();
      r = r.filter(c => (c.brand + ' ' + c.model + ' ' + c.version).toLowerCase().includes(s));
    }
    if (sort === 'price-asc') r.sort((a,b) => a.price - b.price);
    if (sort === 'price-desc') r.sort((a,b) => b.price - a.price);
    if (sort === 'year-desc') r.sort((a,b) => parseInt(b.year) - parseInt(a.year));
    if (sort === 'km-asc') r.sort((a,b) => a.km - b.km);
    return r;
  }, [cars, brand, search, sort]);

  return (
    <div className="route-anim">
      <PageHeader
        eyebrow="Nosso estoque"
        title={<>Toda a <em style={{fontStyle:'italic', color:'var(--gold)'}}>coleção,</em><br/>num só lugar.</>}
        sub="Esportivos, SUVs premium e colecionáveis disponíveis para compra imediata. Atualizamos diariamente — pergunte sobre disponibilidade e financiamento."
      />
      <section style={{padding:'40px 0 120px'}}>
        <div className="container">
          <div className="filters">
            <button className={"filter-chip " + (!brand ? "active" : "")} onClick={() => setBrand(null)}>Todas</button>
            {SM_DATA.brands.slice(0, 8).map(b => (
              <button key={b.slug} className={"filter-chip " + (brand === b.slug ? "active" : "")} onClick={() => setBrand(b.slug)}>
                {b.name}
              </button>
            ))}
            <input className="filter-search" placeholder="Buscar modelo, versão..." value={search} onChange={e => setSearch(e.target.value)}/>
            <select className="filter-search filter-sort" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="featured">Ordenar: destaques</option>
              <option value="price-asc">Preço crescente</option>
              <option value="price-desc">Preço decrescente</option>
              <option value="year-desc">Mais novos</option>
              <option value="km-asc">Menor KM</option>
            </select>
            <span className="filter-count">{filtered.length} veículos</span>
          </div>
        </div>
        {filtered.length > 0 ? (
          <div className="car-grid">
            {filtered.map(c => <CarCard key={c.id} car={c}/>)}
          </div>
        ) : (
          <div className="container" style={{padding:'80px 0', textAlign:'center', color:'var(--ink-mute)'}}>
            <div className="serif" style={{fontSize:48, fontStyle:'italic', color:'var(--gold)', marginBottom:16}}>—</div>
            <p>Nenhum veículo encontrado com esses filtros.</p>
            <button className="btn ghost sm" style={{marginTop:24}} onClick={() => { setBrand(null); setSearch(''); }}>Limpar filtros</button>
          </div>
        )}
      </section>
    </div>
  );
}

// ============================================
// CAR DETAIL
// ============================================
function CarDetailPage({ id }) {
  const [cars] = useCars();
  const car = cars.find(c => c.id === id);
  if (!car) {
    return (
      <div className="route-anim" style={{padding:'200px 0', textAlign:'center'}}>
        <div className="container">
          <div className="serif" style={{fontSize:80, fontStyle:'italic', color:'var(--gold)', marginBottom:24}}>404</div>
          <p style={{color:'var(--ink-mute)', marginBottom:32}}>Veículo não encontrado.</p>
          <button className="btn" onClick={() => SM_NAV.go('/estoque')}>Voltar ao estoque</button>
        </div>
      </div>
    );
  }

  const whatsMsg = encodeURIComponent(`Olá! Tenho interesse no ${car.brand} ${car.model} (Ref ${car.ref}). Está disponível?`);
  const whatsUrl = `https://api.whatsapp.com/send?phone=${SM_DATA.contact.whatsapp}&text=${whatsMsg}`;

  return (
    <div className="route-anim">
      <section className="detail-hero">
        <div className="container">
          <button className="text-mute" style={{marginBottom:32, fontSize:11, letterSpacing:'0.24em', textTransform:'uppercase', display:'inline-flex', alignItems:'center', gap:10}}
                  onClick={() => SM_NAV.go('/estoque')}>
            ← Voltar ao estoque
          </button>

          <div className="detail-grid">
            <div className="detail-img">
              <img src={car.image} alt={car.brand + ' ' + car.model}
                   onError={(e) => { e.target.style.display='none'; }}/>
            </div>

            <div className="detail-side">
              <div className="flex between center" style={{marginBottom:14}}>
                <div className="eyebrow">{car.brand}</div>
                <span className="mono" style={{fontSize:11, color:'var(--gold)', letterSpacing:'0.18em'}}>REF · {car.ref}</span>
              </div>
              <h1>
                <em>{car.model}</em>
              </h1>
              <p style={{color:'var(--ink-mute)', fontSize:15, lineHeight:1.7, maxWidth:480}}>
                {car.version}
              </p>

              <div className="detail-spec-row">
                <div className="detail-spec">
                  <span className="lbl">Ano</span>
                  <span className="val">{car.year}</span>
                </div>
                <div className="detail-spec">
                  <span className="lbl">Quilometragem</span>
                  <span className="val">{SM_FMT.km(car.km)}</span>
                </div>
                <div className="detail-spec">
                  <span className="lbl">Câmbio</span>
                  <span className="val">{car.transmission}</span>
                </div>
              </div>

              <div className="detail-spec-row">
                <div className="detail-spec">
                  <span className="lbl">Combustível</span>
                  <span className="val">{car.fuel}</span>
                </div>
                <div className="detail-spec">
                  <span className="lbl">Cor</span>
                  <span className="val">{car.color || '—'}</span>
                </div>
                <div className="detail-spec">
                  <span className="lbl">Carroceria</span>
                  <span className="val">{car.bodyType || '—'}</span>
                </div>
              </div>

              <div className="detail-price">
                <div style={{flex:1}}>
                  <span className="label">Valor à vista</span>
                  <div className="amount"><span className="currency">R$</span>{new Intl.NumberFormat('pt-BR').format(car.price)}</div>
                </div>
              </div>

              <div className="flex gap-sm" style={{flexWrap:'wrap', gap:12}}>
                <a className="btn" href={whatsUrl} target="_blank" rel="noreferrer">Conversar no WhatsApp <span className="arrow">→</span></a>
                <button className="btn ghost" onClick={() => SM_NAV.go('/financiamento?ref=' + car.ref)}>Simular financiamento</button>
              </div>

              <div style={{marginTop:32, padding:24, background:'var(--surface)', border:'1px solid var(--line-soft)'}}>
                <div className="eyebrow" style={{marginBottom:12}}>Ou ligue agora</div>
                {SM_DATA.contact.phones.map(p => (
                  <a key={p} href={"tel:+55" + p.replace(/\D/g,'')}
                     style={{display:'block', fontFamily:'var(--serif)', fontSize:22, padding:'4px 0'}}>{p}</a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================
// FINANCIAMENTO
// ============================================
function FinanciamentoPage() {
  const [cars] = useCars();
  const route = useRoute();
  const prefRef = uM(() => {
    const q = route.split('?')[1];
    if (!q) return '';
    return new URLSearchParams(q).get('ref') || '';
  }, [route]);

  const [form, setForm] = uS({ nome:'', cpf:'', telefone:'', email:'', renda:'', veiculo: prefRef, entrada:'', parcelas:'48', mensagem:'' });
  const [sent, setSent] = uS(false);
  uE(() => setForm(f => ({ ...f, veiculo: prefRef })), [prefRef]);

  const submit = (e) => {
    e.preventDefault();
    SM_LEADS.add({
      kind: 'Financiamento',
      nome: form.nome,
      telefone: form.telefone,
      email: form.email,
      subj: form.veiculo || 'Financiamento',
      status: 'novo',
      obs: `Renda: ${form.renda} | Entrada: ${form.entrada} | Parcelas: ${form.parcelas}x${form.mensagem ? ' | ' + form.mensagem : ''}`
    });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="route-anim">
        <section style={{padding:'200px 0', textAlign:'center'}}>
          <div className="container">
            <div className="eyebrow" style={{marginBottom:20}}>Recebido</div>
            <h2 className="serif" style={{fontSize:72, lineHeight:1, marginBottom:24}}>
              Obrigado, <em style={{fontStyle:'italic', color:'var(--gold)'}}>{form.nome.split(' ')[0] || 'amigo'}.</em>
            </h2>
            <p style={{color:'var(--ink-mute)', maxWidth:520, margin:'0 auto 40px', lineHeight:1.7}}>
              Sua ficha foi enviada. Nosso consultor entrará em contato em até 1h útil pelo telefone informado.
            </p>
            <button className="btn ghost" onClick={() => SM_NAV.go('/estoque')}>Ver estoque <span className="arrow">→</span></button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="route-anim">
      <PageHeader
        eyebrow="Ficha de financiamento"
        title={<>Financie em até <em style={{fontStyle:'italic', color:'var(--gold)'}}>60x.</em></>}
        sub="Trabalhamos com os principais bancos do país e CDC com taxas competitivas. Preencha sua ficha — em até 1h útil retornamos com a simulação."
      />
      <section style={{padding:'40px 0 120px'}}>
        <div className="container">
          <form onSubmit={submit}>
            <div className="form-grid">
              <div className="form-field"><label>Nome completo</label><input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required/></div>
              <div className="form-field"><label>CPF</label><input value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} placeholder="000.000.000-00"/></div>
              <div className="form-field"><label>Telefone / WhatsApp</label><input value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} required placeholder="(31) 9 9999-9999"/></div>
              <div className="form-field"><label>E-mail</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}/></div>
              <div className="form-field"><label>Renda mensal aproximada</label><input value={form.renda} onChange={e => setForm({...form, renda: e.target.value})} placeholder="R$ 10.000"/></div>
              <div className="form-field"><label>Veículo de interesse (ref. ou modelo)</label><input value={form.veiculo} onChange={e => setForm({...form, veiculo: e.target.value})} placeholder="ST-001 ou BMW X6"/></div>
              <div className="form-field"><label>Entrada disponível</label><input value={form.entrada} onChange={e => setForm({...form, entrada: e.target.value})} placeholder="R$ 100.000"/></div>
              <div className="form-field"><label>Parcelas desejadas</label>
                <select value={form.parcelas} onChange={e => setForm({...form, parcelas: e.target.value})}>
                  <option value="12">12 meses</option>
                  <option value="24">24 meses</option>
                  <option value="36">36 meses</option>
                  <option value="48">48 meses</option>
                  <option value="60">60 meses</option>
                </select>
              </div>
              <div className="form-field full"><label>Observações</label><textarea value={form.mensagem} onChange={e => setForm({...form, mensagem: e.target.value})} placeholder="Conte mais sobre o que você procura..."/></div>
            </div>
            <div className="flex gap-sm" style={{marginTop:32, justifyContent:'flex-end', flexWrap:'wrap', gap:12}}>
              <button type="button" className="btn ghost" onClick={() => history.back()}>Cancelar</button>
              <button type="submit" className="btn">Enviar ficha <span className="arrow">→</span></button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

// ============================================
// VENDER
// ============================================
function VenderPage() {
  const [form, setForm] = uS({ nome:'', telefone:'', marca:'', modelo:'', ano:'', km:'', preco:'', obs:'' });
  const [sent, setSent] = uS(false);
  const submit = (e) => {
    e.preventDefault();
    SM_LEADS.add({
      kind: 'Avaliação',
      nome: form.nome,
      telefone: form.telefone,
      subj: `${form.marca} ${form.modelo}`,
      status: 'novo',
      obs: `Ano: ${form.ano} | KM: ${form.km} | Preço: ${form.preco}${form.obs ? ' | ' + form.obs : ''}`
    });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="route-anim">
        <section style={{padding:'200px 0', textAlign:'center'}}>
          <div className="container">
            <div className="eyebrow" style={{marginBottom:20}}>Recebido</div>
            <h2 className="serif" style={{fontSize:72, lineHeight:1, marginBottom:24}}>
              Avaliação <em style={{fontStyle:'italic', color:'var(--gold)'}}>em curso.</em>
            </h2>
            <p style={{color:'var(--ink-mute)', maxWidth:520, margin:'0 auto 40px', lineHeight:1.7}}>
              Recebemos os dados do seu veículo. Nosso comprador entrará em contato em até 24h com uma proposta inicial.
            </p>
            <button className="btn ghost" onClick={() => SM_NAV.go('/')}>Voltar à home <span className="arrow">→</span></button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="route-anim">
      <PageHeader
        eyebrow="Venda seu veículo"
        title={<>Compramos <em style={{fontStyle:'italic', color:'var(--gold)'}}>o seu carro.</em></>}
        sub="Aceitamos em troca ou na compra direta. Compramos esportivos, SUVs premium e colecionáveis em todo o Brasil. Avaliação justa e pagamento à vista."
      />
      <section style={{padding:'40px 0 120px'}}>
        <div className="container">
          <form onSubmit={submit}>
            <div className="form-grid">
              <div className="form-field"><label>Nome</label><input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required/></div>
              <div className="form-field"><label>Telefone</label><input value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} required/></div>
              <div className="form-field"><label>Marca</label><input value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} required placeholder="BMW, Porsche..."/></div>
              <div className="form-field"><label>Modelo / Versão</label><input value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} required/></div>
              <div className="form-field"><label>Ano</label><input value={form.ano} onChange={e => setForm({...form, ano: e.target.value})} placeholder="2022"/></div>
              <div className="form-field"><label>Quilometragem</label><input value={form.km} onChange={e => setForm({...form, km: e.target.value})} placeholder="40.000"/></div>
              <div className="form-field full"><label>Preço pretendido (opcional)</label><input value={form.preco} onChange={e => setForm({...form, preco: e.target.value})} placeholder="R$ 350.000"/></div>
              <div className="form-field full"><label>Observações / Diferenciais</label><textarea value={form.obs} onChange={e => setForm({...form, obs: e.target.value})} placeholder="Procedência, revisões, opcionais..."/></div>
            </div>
            <div className="flex" style={{marginTop:32, justifyContent:'flex-end', gap:12, flexWrap:'wrap'}}>
              <button type="submit" className="btn">Enviar avaliação <span className="arrow">→</span></button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

// ============================================
// EMPRESA
// ============================================
function EmpresaPage() {
  return (
    <div className="route-anim">
      <PageHeader
        eyebrow="Quem somos"
        title={<>Curadoria a nível <em style={{fontStyle:'italic', color:'var(--gold)'}}>nacional.</em></>}
        sub="Desde 2010 selecionando esportivos, SUVs premium e colecionáveis. Em Nova Lima — Minas Gerais, atendemos clientes em todo o Brasil."
      />
      <section className="section">
        <div className="container">
          <div className="split">
            <div className="placeholder-img">
              SHOWROOM PHOTO · Spettacolo Motors · Nova Lima
            </div>
            <div>
              <div className="eyebrow" style={{marginBottom:14}}>A casa</div>
              <h2 className="section-title" style={{marginBottom:24}}>
                Um <em style={{fontStyle:'italic', color:'var(--gold)'}}>endereço</em><br/>para quem coleciona.
              </h2>
              <p style={{color:'var(--ink-mute)', fontSize:15, lineHeight:1.8, marginBottom:20}}>
                A Spettacolo Motors nasceu da paixão por carros raros e da convicção de que cada veículo merece uma narrativa. Trabalhamos com curadoria criteriosa — não anunciamos volume, anunciamos peças.
              </p>
              <p style={{color:'var(--ink-mute)', fontSize:15, lineHeight:1.8, marginBottom:32}}>
                Esportivos, SUVs premium e colecionáveis. Vendas, compra direta, troca, consignação e financiamento — tudo sob o mesmo teto, com a mesma atenção aos detalhes.
              </p>
              <div className="flex gap-sm" style={{flexWrap:'wrap', gap:12}}>
                <button className="btn" onClick={() => SM_NAV.go('/estoque')}>Ver estoque <span className="arrow">→</span></button>
                <button className="btn ghost" onClick={() => SM_NAV.go('/contato')}>Visitar a loja</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="stat-row">
        <div className="stat"><div className="n">15+</div><div className="l">Anos de mercado</div></div>
        <div className="stat"><div className="n">2.4k</div><div className="l">Carros entregues</div></div>
        <div className="stat"><div className="n">11.6k</div><div className="l">Seguidores no IG</div></div>
        <div className="stat"><div className="n">100%</div><div className="l">Procedência verificada</div></div>
      </div>

      <section className="section">
        <div className="container">
          <div className="eyebrow" style={{marginBottom:14}}>Valores</div>
          <h2 className="section-title" style={{marginBottom:60}}>
            Como <em style={{fontStyle:'italic', color:'var(--gold)'}}>operamos</em>.
          </h2>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:1, background:'var(--line-soft)', border:'1px solid var(--line-soft)'}} className="cat-grid">
            {[
              { t: 'Transparência', d: 'Histórico, laudo, procedência. Tudo aberto antes da venda.' },
              { t: 'Curadoria', d: 'Compramos peças, não estoque. Cada carro passa por triagem técnica.' },
              { t: 'Relação', d: 'Atendemos colecionadores há mais de 15 anos. A maioria volta.' }
            ].map(v => (
              <div key={v.t} style={{background:'var(--bg-2)', padding:'40px 32px'}}>
                <h3 className="serif" style={{fontSize:32, lineHeight:1, marginBottom:16, fontStyle:'italic', color:'var(--gold)'}}>{v.t}</h3>
                <p style={{color:'var(--ink-mute)', fontSize:14, lineHeight:1.7}}>{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================
// CONTATO
// ============================================
function ContatoPage() {
  return (
    <div className="route-anim">
      <PageHeader
        eyebrow="Contato"
        title={<>Vamos <em style={{fontStyle:'italic', color:'var(--gold)'}}>conversar.</em></>}
        sub="Estamos em Nova Lima — Minas Gerais. Receba uma visita, ligue ou nos chame pelo WhatsApp. Atendimento de seg a sáb."
      />
      <section style={{padding:'40px 0 80px'}}>
        <div className="container">
          <div className="contact-grid">
            <div className="contact-cell">
              <div className="eyebrow" style={{marginBottom:10}}>Onde estamos</div>
              <h3>Showroom</h3>
              <p className="sub">{SM_DATA.contact.address}</p>
              <div className="contact-item">
                <span className="lbl">Tel</span>
                <span className="val">
                  <a href={"tel:+55" + SM_DATA.contact.phones[0].replace(/\D/g,'')}>{SM_DATA.contact.phones[0]}</a>
                  <small>Comercial</small>
                </span>
              </div>
              <div className="contact-item">
                <span className="lbl">WhatsApp</span>
                <span className="val">
                  <a href={"https://api.whatsapp.com/send?phone=" + SM_DATA.contact.whatsapp} target="_blank" rel="noreferrer">{SM_DATA.contact.phones[1]}</a>
                  <small>Atendimento rápido</small>
                </span>
              </div>
              <div className="contact-item">
                <span className="lbl">Horário</span>
                <span className="val" style={{fontSize:16}}>
                  {SM_DATA.contact.hours}
                </span>
              </div>
              <div className="contact-item">
                <span className="lbl">Social</span>
                <span className="val" style={{fontSize:16}}>
                  <a href="https://www.instagram.com/spettacolo.motors/" target="_blank" rel="noreferrer">{SM_DATA.contact.instagram}</a><br/>
                  <a href="https://www.tiktok.com/@spettacolomotors" target="_blank" rel="noreferrer">{SM_DATA.contact.tiktok}</a>
                </span>
              </div>
            </div>
            <div className="contact-cell" style={{padding:0, position:'relative', minHeight:480}}>
              <iframe src={SM_DATA.contact.mapsEmbed} style={{position:'absolute', inset:0, width:'100%', height:'100%', border:0, filter:'invert(0.92) hue-rotate(180deg) saturate(0.4)'}} loading="lazy"/>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, {
  HomePage, EstoquePage, CarDetailPage, FinanciamentoPage, VenderPage, EmpresaPage, ContatoPage
});
