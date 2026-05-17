// SPETTACOLO MOTORS — App entry
const { useState: rS, useEffect: rE } = React;

function App() {
  const route = useRoute();
  const path = route.split('?')[0];

  useGlobalAnimations();
  useScrollReveal([route]);

  // Admin uses its own full-bleed layout, no NavBar/Footer
  if (path.startsWith('/admin')) {
    return <AdminApp/>;
  }

  let page;
  if (path === '/' || path === '') page = <HomePage/>;
  else if (path === '/estoque') page = <EstoquePage/>;
  else if (path.startsWith('/veiculo/')) page = <CarDetailPage id={path.replace('/veiculo/', '')}/>;
  else if (path === '/financiamento') page = <FinanciamentoPage/>;
  else if (path === '/vender') page = <VenderPage/>;
  else if (path === '/empresa') page = <EmpresaPage/>;
  else if (path === '/contato') page = <ContatoPage/>;
  else page = <HomePage/>;

  return (
    <>
      <NavBar/>
      {page}
      <Footer/>
      <WhatsFab/>
    </>
  );
}

function mountApp() {
  const el = document.getElementById('root');
  if (!el || typeof HomePage === 'undefined' || typeof NavBar === 'undefined' || typeof AdminApp === 'undefined') {
    return setTimeout(mountApp, 50);
  }
  if (el.__mounted) return;
  el.__mounted = true;
  ReactDOM.createRoot(el).render(<App/>);
  // Fade out splash
  const sp = document.getElementById('__splash');
  if (sp) {
    sp.style.opacity = '0';
    setTimeout(() => sp.remove(), 500);
  }
}
mountApp();
