// SPETTACOLO MOTORS — Shared components
const { useState, useEffect, useRef, useMemo } = React;

// ---------------- ICONS ----------------
const Icon = {
  Arrow:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>,
  Menu:     () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18M3 12h18M3 18h18"/></svg>,
  Close:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 6l12 12M6 18L18 6"/></svg>,
  Whats:    () => <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.8-.4-1.6-.9-2.3-1.7-.6-.5-1-1.2-1.4-1.8-.1-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5 0-.2 0-.4-.1-.5-.1-.1-.7-1.6-1-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1 2.9 1.2 3.1c.1.2 2.1 3.2 5 4.4.7.3 1.2.5 1.7.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.7.5 3.4 1.3 4.8L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>,
  Phone:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/></svg>,
  Pin:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Clock:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  Instagram:() => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
  Search:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  Plus:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>,
  Edit:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Send:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Dashboard:() => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>,
  Car:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 17h14M5 17a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm14 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM3 13l2-6h14l2 6v4H3z"/></svg>,
  Inbox:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  Sparkle:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z"/></svg>,
  Logout:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  Chevron:  () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
};

// ---------------- LOGO ----------------
function Logo({ size = 'md' }) {
  return (
    <div className="nav-logo" onClick={() => SM_NAV.go('/')}>
      <div className="mark">ST</div>
      <div className="word"><em>S</em>pettacolo</div>
    </div>
  );
}

// ---------------- NAV ----------------
function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const route = useRoute();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '/',             label: 'Home' },
    { href: '/estoque',      label: 'Estoque' },
    { href: '/financiamento',label: 'Financiamento' },
    { href: '/vender',       label: 'Venda seu Veículo' },
    { href: '/empresa',      label: 'Quem Somos' },
    { href: '/contato',      label: 'Contato' }
  ];

  const isActive = (h) => h === '/' ? route === '/' : route.startsWith(h);

  return (
    <>
      <nav className={"nav " + (scrolled || open ? "scrolled" : "")}>
        <Logo />
        <div className="nav-links">
          {links.map(l => (
            <a key={l.href} className={"nav-link " + (isActive(l.href) ? "active" : "")}
               href={"#" + l.href} onClick={(e) => { e.preventDefault(); SM_NAV.go(l.href); }}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex center gap-sm" style={{gap:14}}>
          <a className="nav-cta hide-mobile" href={"https://api.whatsapp.com/send?phone=" + SM_DATA.contact.whatsapp} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          <button className="menu-toggle" onClick={() => setOpen(o => !o)}>
            {open ? <Icon.Close/> : <Icon.Menu/>}
          </button>
        </div>
      </nav>

      <div className={"nav-mobile " + (open ? "open" : "")}>
        {links.map(l => (
          <a key={l.href} className={"nav-link " + (isActive(l.href) ? "active" : "")}
             href={"#" + l.href} onClick={(e) => { e.preventDefault(); setOpen(false); SM_NAV.go(l.href); }}>
            {l.label}
          </a>
        ))}
        <a className="nav-cta" style={{marginTop:24, alignSelf:'flex-start'}}
           href={"https://api.whatsapp.com/send?phone=" + SM_DATA.contact.whatsapp} target="_blank" rel="noreferrer">
          Falar no WhatsApp
        </a>
      </div>
    </>
  );
}

// ---------------- CAR CARD ----------------
function CarCard({ car }) {
  return (
    <article className="car-card" onClick={() => SM_NAV.go('/veiculo/' + car.id)}>
      <div className="car-img-wrap">
        <img className="car-img" src={car.image} alt={car.brand + ' ' + car.model}
             onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.style.background = 'repeating-linear-gradient(135deg, #15130F 0px, #15130F 8px, #1C1915 8px, #1C1915 16px)'; }}/>
        <div className="car-tag">{car.ref}</div>
      </div>
      <div className="car-info">
        <div className="car-brand">{car.brand}</div>
        <h3 className="car-model"><em>{car.model.split(' ')[0]}</em>{car.model.split(' ').slice(1).join(' ') ? ' ' + car.model.split(' ').slice(1).join(' ') : ''}</h3>
        <div className="car-spec">{car.version}</div>
        <div className="car-divider"/>
        <div className="car-footer">
          <div className="car-meta">
            <span><strong>{car.year.split('/')[1] || car.year.split('/')[0]}</strong></span>
            <span><strong>{SM_FMT.km(car.km)}</strong></span>
          </div>
          <div className="car-price">
            <span className="car-price-currency">R$</span>
            {new Intl.NumberFormat('pt-BR').format(car.price)}
          </div>
        </div>
      </div>
    </article>
  );
}

// ---------------- FOOTER ----------------
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Logo />
            <p style={{marginTop:20, color:'var(--ink-mute)', fontSize:14, maxWidth:380, lineHeight:1.7}}>
              Esportivos, SUVs e colecionáveis. Curadoria a nível nacional, desde Nova Lima — Minas Gerais.
            </p>
            <div className="hr-gold" style={{marginTop:24}}/>
          </div>
          <div>
            <h4>Navegação</h4>
            <div className="footer-list">
              <a href="#/" onClick={(e)=>{e.preventDefault();SM_NAV.go('/');}}>Home</a>
              <a href="#/estoque" onClick={(e)=>{e.preventDefault();SM_NAV.go('/estoque');}}>Estoque</a>
              <a href="#/financiamento" onClick={(e)=>{e.preventDefault();SM_NAV.go('/financiamento');}}>Financiamento</a>
              <a href="#/vender" onClick={(e)=>{e.preventDefault();SM_NAV.go('/vender');}}>Venda seu Veículo</a>
              <a href="#/empresa" onClick={(e)=>{e.preventDefault();SM_NAV.go('/empresa');}}>Quem Somos</a>
              <a href="#/contato" onClick={(e)=>{e.preventDefault();SM_NAV.go('/contato');}}>Contato</a>
            </div>
          </div>
          <div>
            <h4>Contato</h4>
            <div className="footer-list">
              <a href={"tel:+55" + SM_DATA.contact.phones[0].replace(/\D/g,'')}>{SM_DATA.contact.phones[0]}</a>
              <a href={"tel:+55" + SM_DATA.contact.phones[1].replace(/\D/g,'')}>{SM_DATA.contact.phones[1]}</a>
              <span>{SM_DATA.contact.address}</span>
              <span>{SM_DATA.contact.hours}</span>
            </div>
          </div>
          <div>
            <h4>Social</h4>
            <div className="footer-list">
              <a href="https://www.instagram.com/spettacolo.motors/" target="_blank" rel="noreferrer">Instagram · {SM_DATA.contact.instagram}</a>
              <a href="https://www.tiktok.com/@spettacolomotors" target="_blank" rel="noreferrer">TikTok · {SM_DATA.contact.tiktok}</a>
              <a href="#/admin" onClick={(e)=>{e.preventDefault();SM_NAV.go('/admin');}} style={{opacity:0.6, fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', marginTop:8}}>Acesso restrito</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Spettacolo Motors — CNPJ sob consulta</span>
          <span className="footer-mono">Curadoria a nível nacional.</span>
        </div>
      </div>
    </footer>
  );
}

// ---------------- WHATSAPP FAB ----------------
function WhatsFab() {
  return (
    <a className="fab" target="_blank" rel="noreferrer"
       href={"https://api.whatsapp.com/send?phone=" + SM_DATA.contact.whatsapp + "&text=" + encodeURIComponent("Olá! Vim pelo site da Spettacolo.")}>
      <Icon.Whats />
    </a>
  );
}

// ---------------- PAGE HEADER (reused) ----------------
function PageHeader({ eyebrow, title, sub }) {
  return (
    <section className="empresa-hero">
      <div className="container">
        <div className="eyebrow" style={{marginBottom:16}}>{eyebrow}</div>
        <h1 className="serif" style={{fontSize: 'clamp(48px, 8vw, 110px)', lineHeight: 0.95, letterSpacing: '-0.02em', maxWidth: 1100}}>
          {title}
        </h1>
        {sub && <p style={{marginTop:24, color:'var(--ink-mute)', fontSize:16, maxWidth:640, lineHeight:1.7}}>{sub}</p>}
        <div className="hr-gold" style={{marginTop:40}}/>
      </div>
    </section>
  );
}

// ---------------- ROUTING ----------------
window.SM_NAV = {
  go(path) {
    window.location.hash = path;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
};
function useRoute() {
  const [route, setRoute] = useState(window.location.hash.slice(1) || '/');
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

// ---------------- ANIMATIONS ----------------
function useScrollReveal(deps) {
  useEffect(() => {
    let raf;
    const setup = () => {
      const els = document.querySelectorAll('[data-anim]:not(.in)');
      if (!els.length) return;
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const delay = parseInt(e.target.getAttribute('data-delay') || '0', 10);
            setTimeout(() => e.target.classList.add('in'), delay);
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      els.forEach(el => io.observe(el));
      return io;
    };
    raf = requestAnimationFrame(() => requestAnimationFrame(setup));
    return () => raf && cancelAnimationFrame(raf);
  }, deps || []);
}

function useGlobalAnimations() {
  useEffect(() => {
    // Cursor glow follower
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    let ticking = false;
    let lastX = 0, lastY = 0;
    const onMove = (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          glow.style.transform = `translate(${lastX}px, ${lastY}px) translate(-50%, -50%)`;
          ticking = false;
        });
      }
      if (!document.body.classList.contains('cg-on')) {
        document.body.classList.add('cg-on');
      }
    };
    const onLeave = () => document.body.classList.remove('cg-on');
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);

    // Button ripple position tracking
    const onBtnMove = (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      btn.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    };
    document.addEventListener('mousemove', onBtnMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mousemove', onBtnMove);
      glow.remove();
    };
  }, []);
}

function HeroDust() {
  const dots = useMemo(() => Array.from({ length: 22 }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 14,
    duration: 8 + Math.random() * 10,
    size: 1 + Math.random() * 2.5,
    opacity: 0.3 + Math.random() * 0.5
  })), []);
  return (
    <div className="hero-dust">
      {dots.map((d, i) => (
        <span key={i} style={{
          left: d.left + '%',
          width: d.size + 'px', height: d.size + 'px',
          animationDelay: -d.delay + 's',
          animationDuration: d.duration + 's',
          '--opacity': d.opacity
        }}/>
      ))}
    </div>
  );
}

// ---------------- CAR STORE (localStorage) ----------------
window.SM_STORE = {
  KEY: 'sm_cars_v1',
  read() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return SM_DATA.initialCars;
  },
  write(cars) {
    localStorage.setItem(this.KEY, JSON.stringify(cars));
    window.dispatchEvent(new CustomEvent('sm-cars-changed'));
  },
  reset() {
    localStorage.removeItem(this.KEY);
    window.dispatchEvent(new CustomEvent('sm-cars-changed'));
  }
};
function useCars() {
  const [cars, setCars] = useState(SM_STORE.read());
  useEffect(() => {
    const update = () => setCars(SM_STORE.read());
    window.addEventListener('sm-cars-changed', update);
    return () => window.removeEventListener('sm-cars-changed', update);
  }, []);
  return [cars, (newCars) => { SM_STORE.write(newCars); setCars(newCars); }];
}

// ---------------- LEADS STORE (localStorage) ----------------
window.SM_LEADS = {
  KEY: 'sm_leads_v1',
  read() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  },
  add(lead) {
    const leads = this.read();
    const now = new Date();
    const time = now.toLocaleDateString('pt-BR', { day:'2-digit', month:'short' }) + ' · ' +
                 now.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
    leads.unshift({ ...lead, id: Date.now(), time });
    localStorage.setItem(this.KEY, JSON.stringify(leads));
    window.dispatchEvent(new CustomEvent('sm-leads-changed'));
  }
};
function useLeads() {
  const [leads, setLeads] = useState(SM_LEADS.read());
  useEffect(() => {
    const update = () => setLeads(SM_LEADS.read());
    window.addEventListener('sm-leads-changed', update);
    return () => window.removeEventListener('sm-leads-changed', update);
  }, []);
  return leads;
}

// Export everything to window
Object.assign(window, {
  Icon, Logo, NavBar, Footer, CarCard, WhatsFab, PageHeader, useRoute, useCars,
  useScrollReveal, useGlobalAnimations, HeroDust, useLeads
});
