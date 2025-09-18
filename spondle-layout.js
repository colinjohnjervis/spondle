// spondle-layout.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  "https://jvuunvnbpdfrttusgelz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dXVudm5icGRmcnR0dXNnZWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Nzk0NjksImV4cCI6MjA3MzA1NTQ2OX0.i5-X-GsirwcZl0CdAfGsA6qM4ml5itnekPh0RoDCPVY"
);

window.Layout = {
  async init({ active }) {
    const { data: { user } } = await supabase.auth.getUser(); // ⏳ Wait for Supabase session

    const nav = document.createElement("nav");
    nav.className = "sp-header";
    nav.innerHTML = `
      <div class="sp-header__inner">
        <a href="/index.html" class="sp-logo">
          <span class="sp-logo__dot"></span>
          <span class="sp-logo__text">Spondle</span>
        </a>
        <button class="sp-burger" onclick="document.body.classList.add('sp-drawer-open')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="feather feather-menu">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>
    `;

    const overlay = document.createElement("div");
    overlay.className = "sp-overlay";
    overlay.onclick = () => document.body.classList.remove("sp-drawer-open");

    const sidebar = document.createElement("div");
    sidebar.className = "sp-sidebar";
    sidebar.innerHTML = `
      <div class="sp-sidebar__head">
        <strong>Spondle</strong>
        <button class="sp-close" onclick="document.body.classList.remove('sp-drawer-open')">✕</button>
      </div>
      <nav class="sp-nav" id="sidebar-links">
        <a href="/index.html" class="${active === 'home' ? 'is-active' : ''}">Home</a>
        <a href="/events.html" class="${active === 'events' ? 'is-active' : ''}">Events</a>
        <a href="/organisers.html" class="${active === 'organisers' ? 'is-active' : ''}">Organisers</a>
        <a href="/favourites.html" class="${active === 'favourites' ? 'is-active' : ''}">Favourites</a>
      </nav>
    `;

    document.body.prepend(overlay);
    document.body.prepend(sidebar);
    document.body.prepend(nav);

    // ✅ Inject auth-specific links
    const navContainer = document.getElementById("sidebar-links");
    if (!navContainer) return;

    if (user) {
      const profileLink = document.createElement("a");
      profileLink.href = "/profile.html";
      profileLink.textContent = "My Profile";

      const logoutLink = document.createElement("a");
      logoutLink.href = "/logout.html";
      logoutLink.textContent = "Sign out";

      navContainer.appendChild(profileLink);
      navContainer.appendChild(logoutLink);
    } else {
      const loginLink = document.createElement("a");
      loginLink.href = "/login.html";
      loginLink.className = active === "login" ? "is-active" : "";
      loginLink.textContent = "Sign in";
      navContainer.appendChild(loginLink);
    }
  }
};
