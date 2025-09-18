export const Layout = {
  init({ active }) {
    const root = document.getElementById("layout-root");

    root.innerHTML = `
      <header class="sp-header">
        <div class="sp-header__inner">
          <a href="/index.html" class="sp-logo">
            <span class="sp-logo__dot"></span>
            <span class="sp-logo__text">Spondle</span>
          </a>
          <button class="sp-burger" id="burgerBtn" aria-label="Toggle menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <div class="sp-overlay" id="overlay"></div>

      <aside class="sp-sidebar" id="sidebar">
        <div class="sp-sidebar__head">
          <div class="sp-logo">
            <span class="sp-logo__dot"></span>
            <span class="sp-logo__text">Spondle</span>
          </div>
          <button class="sp-close" id="closeBtn" aria-label="Close menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav class="sp-nav">
          <a href="/index.html" class="${active === 'home' ? 'is-active' : ''}">Home</a>
          <a href="/events.html" class="${active === 'events' ? 'is-active' : ''}">Events</a>
          <a href="/organisers.html" class="${active === 'organisers' ? 'is-active' : ''}">Organisers</a>
          <a href="/favourites.html" class="${active === 'favourites' ? 'is-active' : ''}">Favourites</a>
          <a href="/login.html" class="${active === 'login' ? 'is-active' : ''}">Sign in</a>
        </nav>
      </aside>
    `;

    // Toggle sidebar
    const burger = document.getElementById("burgerBtn");
    const close = document.getElementById("closeBtn");
    const overlay = document.getElementById("overlay");

    function toggleDrawer(open) {
      document.body.classList.toggle("sp-drawer-open", open);
    }

    burger?.addEventListener("click", () => toggleDrawer(true));
    close?.addEventListener("click", () => toggleDrawer(false));
    overlay?.addEventListener("click", () => toggleDrawer(false));
  }
};
