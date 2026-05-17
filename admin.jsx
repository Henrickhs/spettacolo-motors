// SPETTACOLO MOTORS — Admin
const { useState: aS, useEffect: aE, useRef: aR } = React;

const ADMIN_PASSWORD = 'admin0707';
const ADMIN_KEY = 'sm_admin_session_v1';

// ============================================
// ADMIN ROOT
// ============================================
function AdminApp() {
  const [authed, setAuthed] = aS(() => sessionStorage.getItem(ADMIN_KEY) === '1');

  if (!authed) {
    return <AdminLogin onSuccess={() => { sessionStorage.setItem(ADMIN_KEY, '1'); setAuthed(true); }} />;
  }
  return <AdminDashboard onLogout={() => { sessionStorage.removeItem(ADMIN_KEY); setAuthed(false); SM_NAV.go('/'); }} />;
}

// ============================================
// LOGIN
// ============================================
function AdminLogin({ onSuccess }) {
  const [u, setU] = aS('');
  const [p, setP] = aS('');
  const [err, setErr] = aS('');

  const submit = (e) => {
    e.preventDefault();
    // accept either "admin0707" as user or as password (user said "senha e login admin0707")
    if (p === ADMIN_PASSWORD || u === ADMIN_PASSWORD) {
      onSuccess();
    } else {
      setErr('Credenciais inválidas. Verifique e tente novamente.');
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="logo">ST</div>
        <h2>Painel <em style={{fontStyle:'italic', color:'var(--gold)'}}>Spettacolo</em></h2>
        <div className="sub">Acesso restrito · administradores</div>
        <form onSubmit={submit}>
          <input placeholder="Usuário" value={u} onChange={e => setU(e.target.value)} autoFocus/>
          <input type="password" placeholder="Senha" value={p} onChange={e => setP(e.target.value)}/>
          {err && <div className="err">{err}</div>}
          <button type="submit" className="btn" style={{width:'100%', marginTop:8}}>
            Entrar <span className="arrow">→</span>
          </button>
        </form>
        <div style={{marginTop:32, paddingTop:24, borderTop:'1px solid var(--line-soft)', fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--ink-dim)', textAlign:'center'}}>
          ← <a href="#/" onClick={(e) => { e.preventDefault(); SM_NAV.go('/'); }} style={{color:'var(--ink-mute)'}}>Voltar ao site</a>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DASHBOARD
// ============================================
function AdminDashboard({ onLogout }) {
  const [tab, setTab] = aS('overview');

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand">
          <div className="mark">ST</div>
          <div className="name serif" style={{fontStyle:'italic'}}>Spettacolo</div>
        </div>
        {[
          { id:'overview', l:'Visão Geral', icon: <Icon.Dashboard/> },
          { id:'cars',     l:'Veículos',    icon: <Icon.Car/> },
          { id:'leads',    l:'Leads',       icon: <Icon.Inbox/> },
          { id:'settings', l:'Ajustes',     icon: <Icon.Sparkle/> }
        ].map(it => (
          <button key={it.id} className={"admin-nav-item " + (tab === it.id ? 'active' : '')} onClick={() => setTab(it.id)}>
            <span className="icon">{it.icon}</span>
            {it.l}
          </button>
        ))}
        <div className="foot">
          <button onClick={() => SM_NAV.go('/')} style={{display:'flex', alignItems:'center', gap:10}}>
            <Icon.Chevron/> Ver site público
          </button>
          <button onClick={onLogout} style={{marginTop:14, display:'flex', alignItems:'center', gap:10, color:'var(--danger)'}}>
            <Icon.Logout/> Sair
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {tab === 'overview' && <AdminOverview/>}
        {tab === 'cars' && <AdminCars/>}
        {tab === 'leads' && <AdminLeads/>}
        {tab === 'settings' && <AdminSettings/>}
      </main>

      <aside className="admin-ai">
        <AIAgent/>
      </aside>
    </div>
  );
}

// ============================================
// OVERVIEW
// ============================================
function AdminOverview() {
  const [cars] = useCars();
  const totalValue = cars.reduce((s, c) => s + (c.price || 0), 0);
  const avgPrice = cars.length ? totalValue / cars.length : 0;

  return (
    <>
      <div className="admin-head">
        <div>
          <div className="sub">Painel · 14 Mai 2026</div>
          <h1>Visão <em style={{fontStyle:'italic', color:'var(--gold)'}}>geral</em></h1>
        </div>
        <div className="flex gap-sm">
          <button className="btn sm gold-line" onClick={() => window.dispatchEvent(new CustomEvent('sm-admin-tab', { detail: 'cars' }))}>+ Novo veículo</button>
        </div>
      </div>

      <div className="admin-kpis">
        <div className="kpi">
          <div className="l">Estoque ativo</div>
          <div className="v">{String(cars.length).padStart(2, '0')}</div>
          <div className="d up">▲ veículos disponíveis</div>
        </div>
        <div className="kpi">
          <div className="l">Valor em estoque</div>
          <div className="v">{SM_FMT.shortMoney(totalValue)}</div>
          <div className="d">capital alocado</div>
        </div>
        <div className="kpi">
          <div className="l">Ticket médio</div>
          <div className="v">{SM_FMT.shortMoney(avgPrice)}</div>
          <div className="d">por veículo</div>
        </div>
        <div className="kpi">
          <div className="l">Leads · 7d</div>
          <div className="v">42</div>
          <div className="d up">▲ +18% vs semana ant.</div>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:24}} className="ov-grid">
        <div>
          <h3 style={{fontSize:12, letterSpacing:'0.28em', textTransform:'uppercase', color:'var(--ink-mute)', marginBottom:16}}>Últimos cadastros</h3>
          <table className="admin-table">
            <thead>
              <tr><th></th><th>Veículo</th><th>Ano</th><th>Preço</th></tr>
            </thead>
            <tbody>
              {cars.slice(0, 5).map(c => (
                <tr key={c.id}>
                  <td style={{width:80}}><img className="thumb" src={c.image} alt="" onError={e => { e.target.style.background='var(--surface)'; e.target.removeAttribute('src'); }}/></td>
                  <td>
                    <div style={{fontFamily:'var(--serif)', fontSize:16}}>{c.brand} {c.model}</div>
                    <div style={{fontSize:11, color:'var(--ink-mute)', letterSpacing:'0.06em'}}>{c.ref}</div>
                  </td>
                  <td>{c.year}</td>
                  <td><span className="price">{SM_FMT.money(c.price)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h3 style={{fontSize:12, letterSpacing:'0.28em', textTransform:'uppercase', color:'var(--ink-mute)', marginBottom:16}}>Atividade recente</h3>
          <div style={{background:'var(--bg-2)', border:'1px solid var(--line-soft)'}}>
            {[
              ['18:42', 'Novo lead', 'Porsche 718 · WhatsApp'],
              ['16:10', 'Lead financiamento', 'Ford Mustang 2024 · 60x'],
              ['14:33', 'Veículo visualizado', 'Corvette Stingray'],
              ['11:21', 'Avaliação enviada', 'Cliente em Belo Horizonte'],
              ['09:58', 'Visita agendada', 'Sáb 17/05 · 14h']
            ].map((row, i) => (
              <div key={i} style={{padding:'16px 20px', borderBottom:'1px solid var(--line-soft)', display:'flex', gap:16, alignItems:'center'}}>
                <span style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--gold)', minWidth:50}}>{row[0]}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13}}>{row[1]}</div>
                  <div style={{fontSize:11, color:'var(--ink-mute)'}}>{row[2]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 1100px) { .ov-grid { grid-template-columns: 1fr !important; } }`}</style>
    </>
  );
}

// ============================================
// CARS (CRUD)
// ============================================
function AdminCars() {
  const [cars, setCars] = useCars();
  const [editing, setEditing] = aS(null); // car obj or 'new'
  const [search, setSearch] = aS('');

  aE(() => {
    const handler = (e) => { if (e.detail === 'cars') { /* noop */ } };
    window.addEventListener('sm-admin-tab', handler);
    return () => window.removeEventListener('sm-admin-tab', handler);
  }, []);

  const filtered = cars.filter(c => !search || (c.brand + ' ' + c.model + ' ' + c.ref).toLowerCase().includes(search.toLowerCase()));

  const onDelete = (id) => {
    if (!confirm('Excluir esse veículo do estoque?')) return;
    setCars(cars.filter(c => c.id !== id));
  };

  const onSave = (car) => {
    if (editing === 'new') {
      const id = car.brand.toLowerCase().replace(/\s/g,'-') + '-' + car.model.toLowerCase().replace(/\s/g,'-') + '-' + Date.now().toString(36);
      const ref = 'ST-' + String(cars.length + 1).padStart(3, '0');
      setCars([{ ...car, id, ref, featured: !!car.featured }, ...cars]);
    } else {
      setCars(cars.map(c => c.id === editing.id ? { ...c, ...car } : c));
    }
    setEditing(null);
  };

  const onReset = () => {
    if (!confirm('Restaurar estoque inicial (perde alterações locais)?')) return;
    SM_STORE.reset();
  };

  return (
    <>
      <div className="admin-head">
        <div>
          <div className="sub">Gestão · estoque</div>
          <h1>Veículos <em style={{fontStyle:'italic', color:'var(--gold)'}}>· {cars.length}</em></h1>
        </div>
        <div className="flex gap-sm" style={{gap:12, flexWrap:'wrap'}}>
          <button className="btn ghost sm" onClick={onReset}>Restaurar inicial</button>
          <button className="btn sm" onClick={() => setEditing('new')}>+ Novo veículo</button>
        </div>
      </div>

      <input className="filter-search" placeholder="Buscar por marca, modelo ou referência..."
             style={{width:'100%', marginBottom:24}}
             value={search} onChange={e => setSearch(e.target.value)}/>

      <table className="admin-table">
        <thead>
          <tr>
            <th></th>
            <th>Veículo</th>
            <th>Ref</th>
            <th>Ano</th>
            <th>KM</th>
            <th>Preço</th>
            <th>Destaque</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(c => (
            <tr key={c.id}>
              <td style={{width:80}}><img className="thumb" src={c.image} alt="" onError={e => e.target.removeAttribute('src')}/></td>
              <td>
                <div style={{fontFamily:'var(--serif)', fontSize:16}}>{c.brand} {c.model}</div>
                <div style={{fontSize:11, color:'var(--ink-mute)'}}>{c.version}</div>
              </td>
              <td style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--gold)'}}>{c.ref}</td>
              <td>{c.year}</td>
              <td>{SM_FMT.km(c.km)}</td>
              <td><span className="price">{SM_FMT.money(c.price)}</span></td>
              <td>{c.featured ? <span style={{color:'var(--gold)', fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase'}}>★ Sim</span> : <span style={{color:'var(--ink-dim)'}}>—</span>}</td>
              <td>
                <div className="actions">
                  <button className="iconbtn" title="Editar" onClick={() => setEditing(c)}><Icon.Edit/></button>
                  <button className="iconbtn danger" title="Excluir" onClick={() => onDelete(c.id)}><Icon.Trash/></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && <CarEditModal car={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSave={onSave}/>}
    </>
  );
}

function CarEditModal({ car, onClose, onSave }) {
  const blank = { brand:'', model:'', version:'', year:'', km:0, price:0, transmission:'Automático', fuel:'Gasolina', color:'', bodyType:'', image:'', featured:false };
  const [f, setF] = aS(car ? { ...blank, ...car } : blank);
  const upd = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : (e.target.type === 'number' ? Number(e.target.value) : e.target.value) });

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{car ? 'Editar veículo' : 'Novo veículo'}</h3>
          <button className="modal-close" onClick={onClose}><Icon.Close/></button>
        </div>
        <div className="modal-body">
          <div className="modal-row">
            <div><label>Marca</label><input value={f.brand} onChange={upd('brand')} placeholder="Porsche"/></div>
            <div><label>Modelo</label><input value={f.model} onChange={upd('model')} placeholder="911"/></div>
          </div>
          <div><label>Versão</label><input value={f.version} onChange={upd('version')} placeholder="3.0 Turbo Carrera S"/></div>
          <div className="modal-row">
            <div><label>Ano</label><input value={f.year} onChange={upd('year')} placeholder="2022/2023"/></div>
            <div><label>Quilometragem</label><input type="number" value={f.km} onChange={upd('km')}/></div>
          </div>
          <div className="modal-row">
            <div><label>Preço (R$)</label><input type="number" value={f.price} onChange={upd('price')}/></div>
            <div><label>Carroceria</label><input value={f.bodyType} onChange={upd('bodyType')} placeholder="Cupê esportivo"/></div>
          </div>
          <div className="modal-row">
            <div><label>Câmbio</label>
              <select value={f.transmission} onChange={upd('transmission')}>
                <option>Automático</option><option>Manual</option><option>PDK</option><option>Tiptronic</option><option>SpeedShift</option><option>SelectShift</option>
              </select>
            </div>
            <div><label>Combustível</label>
              <select value={f.fuel} onChange={upd('fuel')}>
                <option>Gasolina</option><option>Flex</option><option>Diesel</option><option>Híbrido</option><option>Elétrico</option>
              </select>
            </div>
          </div>
          <div><label>Cor</label><input value={f.color} onChange={upd('color')}/></div>
          <div><label>URL da imagem</label><input value={f.image} onChange={upd('image')} placeholder="https://..."/></div>
          <label style={{display:'flex', alignItems:'center', gap:10, cursor:'pointer'}}>
            <input type="checkbox" checked={!!f.featured} onChange={upd('featured')} style={{width:'auto'}}/>
            <span style={{fontSize:12, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--ink)'}}>★ Destacar na home</span>
          </label>
        </div>
        <div className="modal-foot">
          <button className="btn ghost sm" onClick={onClose}>Cancelar</button>
          <button className="btn sm" onClick={() => onSave(f)} disabled={!f.brand || !f.model}>Salvar veículo</button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// LEADS
// ============================================
function AdminLeads() {
  const leads = useLeads();
  const statusColor = { 'novo':'var(--gold)', 'em-andamento':'#5B91D9', 'concluído':'var(--ok)' };

  const onDelete = (id) => {
    if (!confirm('Remover este lead?')) return;
    const updated = SM_LEADS.read().filter(l => l.id !== id);
    localStorage.setItem(SM_LEADS.KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('sm-leads-changed'));
  };

  const toggleStatus = (id) => {
    const cycle = { 'novo':'em-andamento', 'em-andamento':'concluído', 'concluído':'novo' };
    const updated = SM_LEADS.read().map(l => l.id === id ? { ...l, status: cycle[l.status] || 'novo' } : l);
    localStorage.setItem(SM_LEADS.KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('sm-leads-changed'));
  };

  return (
    <>
      <div className="admin-head">
        <div>
          <div className="sub">Inbox · CRM</div>
          <h1>Leads <em style={{fontStyle:'italic', color:'var(--gold)'}}>· {leads.length}</em></h1>
        </div>
      </div>

      {leads.length === 0 ? (
        <div style={{padding:'60px 0', textAlign:'center', color:'var(--ink-mute)'}}>
          <div className="serif" style={{fontSize:48, fontStyle:'italic', color:'var(--gold)', marginBottom:16}}>—</div>
          <p>Nenhum lead ainda. Os contatos dos formulários aparecerão aqui.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead><tr><th>Data</th><th>Cliente</th><th>Telefone</th><th>Interesse</th><th>Origem</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {leads.map(l => (
              <tr key={l.id}>
                <td style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--ink-mute)', whiteSpace:'nowrap'}}>{l.time}</td>
                <td>
                  <div style={{fontFamily:'var(--serif)', fontSize:16}}>{l.nome}</div>
                  {l.obs && <div style={{fontSize:11, color:'var(--ink-mute)', marginTop:2}}>{l.obs.slice(0,60)}{l.obs.length>60?'…':''}</div>}
                </td>
                <td>{l.telefone}</td>
                <td>{l.subj}</td>
                <td><span style={{fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--ink-mute)'}}>{l.kind}</span></td>
                <td>
                  <span title="Clique para avançar status" onClick={() => toggleStatus(l.id)}
                    style={{fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color: statusColor[l.status||'novo'], fontWeight:600, cursor:'pointer'}}>
                    {l.status || 'novo'}
                  </span>
                </td>
                <td>
                  <button className="iconbtn danger" title="Remover" onClick={() => onDelete(l.id)}><Icon.Trash/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

// ============================================
// SETTINGS
// ============================================
function AdminSettings() {
  const [claudeKey, setClaudeKey] = aS(() => localStorage.getItem('sm_claude_key') || '');
  const [keySaved, setKeySaved] = aS(false);

  const saveKey = () => {
    localStorage.setItem('sm_claude_key', claudeKey);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  return (
    <>
      <div className="admin-head">
        <div>
          <div className="sub">Configurações</div>
          <h1>Ajustes do <em style={{fontStyle:'italic', color:'var(--gold)'}}>site</em></h1>
        </div>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'var(--line-soft)', border:'1px solid var(--line-soft)'}} className="set-grid">
        <div style={{background:'var(--bg-2)', padding:'32px'}}>
          <div className="eyebrow" style={{marginBottom:14}}>IA · Sofia</div>
          <h3 className="serif" style={{fontSize:24, marginBottom:12}}>Chave da API Anthropic</h3>
          <p style={{color:'var(--ink-mute)', fontSize:13, marginBottom:20}}>
            Cole sua chave da <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{color:'var(--gold)'}}>console.anthropic.com</a> para ativar a Sofia. Salvo localmente, nunca enviado a terceiros.
          </p>
          <div style={{display:'flex', gap:10}}>
            <input type="password" value={claudeKey} onChange={e => setClaudeKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              style={{flex:1, padding:'12px 14px', background:'var(--bg)', border:'1px solid var(--line-soft)', color:'var(--ink)', fontSize:13}}/>
            <button className="btn sm" onClick={saveKey}>{keySaved ? '✓ Salvo' : 'Salvar'}</button>
          </div>
        </div>
        <div style={{background:'var(--bg-2)', padding:'32px'}}>
          <div className="eyebrow" style={{marginBottom:14}}>Persistência</div>
          <h3 className="serif" style={{fontSize:24, marginBottom:12}}>Estoque local</h3>
          <p style={{color:'var(--ink-mute)', fontSize:13, marginBottom:20}}>Veículos adicionados são salvos no navegador (localStorage). Em produção, conectar ao banco do AutoCerto.</p>
          <button className="btn ghost sm" onClick={() => { if (confirm('Limpar estoque local?')) SM_STORE.reset(); }}>Restaurar estoque inicial</button>
        </div>
      </div>
      <style>{`@media (max-width: 720px) { .set-grid { grid-template-columns: 1fr !important; } }`}</style>
    </>
  );
}

// ============================================
// AI AGENT (vertical sidebar)
// ============================================
function AIAgent() {
  const [cars] = useCars();
  const [msgs, setMsgs] = aS([
    { role: 'bot', content: 'Olá! Sou a Sofia, sua assistente de IA da Spettacolo. Posso ajudar com:\n\n• Gerar descrições de veículos\n• Sugerir preços\n• Responder dúvidas sobre o estoque\n• Criar copy para anúncios e redes' }
  ]);
  const [input, setInput] = aS('');
  const [busy, setBusy] = aS(false);
  const endRef = aR(null);

  aE(() => {
    if (endRef.current) endRef.current.scrollTop = endRef.current.scrollHeight;
  }, [msgs, busy]);

  const suggestions = [
    'Resumo do estoque',
    'Descrição para o Mustang',
    'Sugerir preço de um 911 2020',
    'Post de IG para o Corvette'
  ];

  const send = async (text) => {
    const userText = (text || input).trim();
    if (!userText || busy) return;
    setInput('');
    const newMsgs = [...msgs, { role: 'user', content: userText }];
    setMsgs(newMsgs);
    setBusy(true);

    const ctx = `Você é a Sofia, assistente da Spettacolo Motors — concessionária premium de esportivos, SUVs e colecionáveis em Nova Lima/MG.

Estoque atual:
${cars.map(c => `- [${c.ref}] ${c.brand} ${c.model} (${c.year}) ${SM_FMT.km(c.km)} — ${SM_FMT.money(c.price)} — ${c.version}`).join('\n')}

Contato: ${SM_DATA.contact.phones.join(' / ')}. Endereço: ${SM_DATA.contact.address}.

Responda em português brasileiro, tom premium e direto. Máximo 6 linhas. Use marcadores quando ajudar.`;

    try {
      // Ambiente Claude Code: usa window.claude se disponível
      if (window.claude && typeof window.claude.complete === 'function') {
        const reply = await window.claude.complete({
          messages: [{ role: 'user', content: ctx + '\n\nPergunta: ' + userText }]
        });
        setMsgs(m => [...m, { role: 'bot', content: reply }]);
        return;
      }

      // Produção: usa chave da API Anthropic salva nas configurações
      const apiKey = localStorage.getItem('sm_claude_key');
      if (!apiKey) {
        setMsgs(m => [...m, { role: 'bot', content: 'Sofia não está configurada ainda.\n\nVá em Ajustes → Chave da API Anthropic, cole sua chave de console.anthropic.com e salve. A Sofia estará pronta!' }]);
        return;
      }

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-allow-browser': 'true'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 400,
          system: ctx,
          messages: [{ role: 'user', content: userText }]
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Erro ' + res.status);
      }

      const data = await res.json();
      setMsgs(m => [...m, { role: 'bot', content: data.content[0].text }]);
    } catch (e) {
      setMsgs(m => [...m, { role: 'bot', content: `Erro ao conectar: ${e.message}.\n\nVerifique a chave da API em Ajustes.` }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="ai-head">
        <div className="dot"/>
        <div>
          <div className="title">Sofia <em style={{fontStyle:'italic', color:'var(--gold)'}}>· IA</em></div>
          <div className="sub">Assistente · sempre online</div>
        </div>
      </div>

      <div className="ai-messages" ref={endRef}>
        {msgs.map((m, i) => (
          <div key={i} className={"ai-msg " + m.role}>
            <span className="role">{m.role === 'bot' ? 'Sofia' : 'Você'}</span>
            <div style={{whiteSpace:'pre-wrap'}}>{m.content}</div>
          </div>
        ))}
        {busy && <div className="ai-thinking"><span/><span/><span/></div>}
      </div>

      <div className="ai-suggestions">
        {suggestions.map(s => (
          <button key={s} className="ai-suggestion" onClick={() => send(s)}>{s}</button>
        ))}
      </div>

      <div className="ai-input-wrap">
        <input className="ai-input" placeholder="Pergunte algo..." value={input}
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => { if (e.key === 'Enter') send(); }}/>
        <button className="ai-send" disabled={busy || !input.trim()} onClick={() => send()}>
          <Icon.Send/>
        </button>
      </div>
    </>
  );
}

Object.assign(window, { AdminApp });
