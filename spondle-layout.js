// Spondle shared layout — sticky header + slide-in sidebar (LOCKED)
//
// Usage on any page:
// <div id="layout-root"></div>
// <script src="https://cdn.tailwindcss.com"></script>
// <link rel="stylesheet" href="/spondle-layout.css?v=1">
// <script src="/spondle-layout.js?v=1"></script>
// <script>Layout.init({ active: 'home' });</script>
//
// active keys: 'home' | 'events' | 'favourites' | 'organisers' | 'login' | 'dash' | 'create' | 'drafts'

window.Layout = (function () {
  const HTML = `
    <header class="topbar glass">
      <div class="brand">
        <span class="brand-dot"></span>
        <span class="font-semibold tracking-wide">Spondle</span>
      </div>
      <button id="sbOpen" class="burger" aria-label="Open menu" aria-expanded="false" aria-controls="sbPanel">
        <span class="burger-lines" aria-hidden="true"></span>
      </button>
    </header>

    <div id="sbOverlay" aria-hidden="true"></div>
    <aside id="sbPanel" role="dialog" aria-modal="true" aria-label="Menu">
      <div class="sb-head">
        <div class="sb-title">Menu</div>
        <button id="sbClose" class="sb-close" aria-label="Close menu">✕</button>
      </div>
      <nav class="sb-list" id="sbNav">
        <a data-key="home"       class="sb-item" href="/index.html">Home</a>
        <a data-key="events"     class="sb-item" href="/events.html">Explore events</a>
        <a data-key="favourites" class="sb-item" href="/favourites.html">Favourites</a>
        <a data-key="organisers" class="sb-item" href="/organisers.html">For organisers</a>
        <a data-key="login"      class="sb-item" href="/login.html">Sign in / Account</a>
        <div class="sb-section">Organiser tools</div>
        <a data-key="dash"       class="sb-item" href="/organiser-dashboard.html">Dashboard</a>
        <a data-key="create"     class="sb-item" href="/organiser-create.html">Create event</a>
        <a data-key="drafts"     class="sb-item" href="/organiser-drafts.html">My drafts</a>
      </nav>
      <div class="sb-foot">© 2025 Spondle</div>
    </aside>
  `;

  function mount(activeKey) {
    let root = document.getElementById('layout-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'layout-root';
      document.body.prepend(root);
    }
    root.innerHTML = HTML;

    // Wire sidebar
    const body = document.body;
    const openBtn = document.getElementById('sbOpen');
    const closeBtn = document.getElementById('sbClose');
    const overlay = document.getElementById('sbOverlay');

    function openMenu(){ body.classList.add('sb-open'); openBtn.setAttribute('aria-expanded','true'); }
    function closeMenu(){ body.classList.remove('sb-open'); openBtn.setAttribute('aria-expanded','false'); }

    openBtn.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
    window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeMenu(); });

    // Active state
    if (activeKey) {
      const links = document.querySelectorAll('#sbNav .sb-item');
      links.forEach(a => {
        if (a.dataset.key === activeKey) a.classList.add('active');
      });
    }
  }

  return {
    init(opts = {}) {
      // opts.active: which nav item to highlight
      mount(opts.active);
    }
  };
})();
