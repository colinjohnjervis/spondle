// spondle-layout.js

export const Layout = {
  init({ active }) {
    // Create overlay
    const overlay = document.createElement("div");
    overlay.className = "sp-overlay";
    document.body.appendChild(overlay);

    // Create sidebar
    const sidebar = document.createElement("aside");
    sidebar.className = "sp-sidebar";
    sidebar.innerHTML = `
      <div class="sp-sidebar__head">
        <a href="/" class="sp-logo">
          <div class="sp-logo__dot"></div>
          <div class="sp-logo__text">Spondle</div>
        </a>
        <button class="sp-close" onclick="document.body.classList.remove('sp-drawer-open')">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 6l8 8M6 14L14 6"/>
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
    `;
    document.body.appendChild(sidebar);

    // Create sticky header
    const header = document.createElement("header");
    header.className = "sp-header";
    header.innerHTML = `
      <div class="sp-header__inner">
        <a href="/" class="sp-logo">
          <div class="sp-logo__dot"></div>
          <div class="sp-logo__text">Spondle</div>
        </a>
        <button class="sp-burger" onclick="document.body.classList.add('sp-drawer-open')">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>
    `;
    document.getElementById("layout-root").appendChild(header);
  }
};
