// Shared fixed header + left drawer sidebar
const Layout = (function(){
  function headerHTML(){
    return `
      <header class="sp-header">
        <div class="sp-header__inner max-w-7xl mx-auto">
          <a class="sp-logo" href="/index.html" aria-label="Spondle home">
            <span class="sp-logo__dot"></span>
            <span class="sp-logo__text">Spondle</span>
          </a>
          <button class="sp-burger" id="sp-burger" aria-label="Open menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
              <path d="M3 6h18M3 12h18M3 18h18"/>
            </svg>
          </button>
        </div>
      </header>
      <div class="sp-overlay" id="sp-overlay"></div>
      <aside class="sp-sidebar" id="sp-sidebar" aria-label="Sidebar">
        <div class="sp-sidebar__head">
          <a class="sp-logo" href="/index.html">
            <span class="sp-logo__dot"></span>
            <span class="sp-logo__text">Spondle</span>
          </a>
          <button class="sp-close" id="sp-close" aria-label="Close menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
              <path d="M6 6l12 12M18 6l-12 12"/>
            </svg>
          </button>
        </div>
        <nav class="sp-nav" id="sp-nav">
          ${navLink('/index.html','home','Home')}
          ${navLink('/events.html','events','Events')}
          ${navLink('/organisers.html','organisers','Organisers')}
          ${navLink('/favourites.html','favourites','Favourites')}
          ${navLink('/profile.html','profile','My Profile')}
          ${navLink('/login.html','login','Sign in')}
        </nav>
      </aside>
    `;
  }
  function navLink(href, key, label){ return `<a href="${href}" data-key="${key}">${label}</a>`; }

  function mount(activeKey){
    const root = document.getElementById('layout-root');
    if (!root) return;
    root.innerHTML = headerHTML();

    const burger = document.getElementById('sp-burger');
    const close  = document.getElementById('sp-close');
    const overlay= document.getElementById('sp-overlay');
    const nav    = document.getElementById('sp-nav');

    if (activeKey){
      [...nav.querySelectorAll('a')].forEach(a=>{
        a.classList.toggle('is-active', a.dataset.key === activeKey);
      });
    }

    const open = ()=> document.body.classList.add('sp-drawer-open');
    const shut = ()=> document.body.classList.remove('sp-drawer-open');

    burger.addEventListener('click', open);
    close.addEventListener('click', shut);
    overlay.addEventListener('click', shut);
    window.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') shut(); }, { passive:true });
    nav.addEventListener('click', (e)=>{ const a=e.target.closest('a'); if (a) shut(); });
  }

  return { init: ({active}={}) => mount(active) };
})();
