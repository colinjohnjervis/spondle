// spondle-layout.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  "https://jvuunvnbpdfrttusgelz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dXVudm5icGRmcnR0dXNnZWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Nzk0NjksImV4cCI6MjA3MzA1NTQ2OX0.i5-X-GsirwcZl0CdAfGsA6qM4ml5itnekPh0RoDCPVY"
);

window.Layout = {
  init({ active }) {
    // Inject header
    const header = document.createElement("header");
    header.className = "sp-header";
    header.innerHTML = `
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

    // Inject sidebar overlay
    const overlay = document.createElement("div");
    overlay.className = "sp-overlay";
    overlay.onclick = () => document.body.classList.remove("sp-drawer-open");

    // Inject sidebar
    const sidebar = document.createElement("aside");
    sidebar.className = "sp-sidebar";
    sidebar.innerHTML = `
      <div class="sp-sidebar__head">
        <strong>Spondle</strong>
        <button class="sp-close" onclick="document.body.classList.remove('sp-drawer-open')">✕</button>
      </div>
      <nav class="sp-nav">
        <a href="/index.html" class="${active === 'home' ? 'is-active' : ''}">Home</a>
        <a href="/events.html" class="${active === 'events' ? 'is-active' : ''}">Events</a>
        <a href="/organisers.html" class="${active === 'organisers' ? 'is-active' : ''}">Organisers</a>
        <a href="/favourites.html" class="${active === 'favourites' ? 'is-active' : ''}">Favourites</a>
        <a href="/login.html" id="auth-link" class="${active === 'login' ? 'is-active' : ''}">Sign in</a>
      </nav>
    `;

    // Inject everything
    document.body.prepend(overlay);
    document.body.prepend(sidebar);
    document.body.prepend(header);

    // ✅ Check auth and update auth link
    supabase.auth.getUser().then(({ data: { user } }) => {
      const authLink = document.getElementById("auth-link");
      if (authLink) {
        if (user) {
          authLink.innerText = "Sign out";
          authLink.href = "/logout.html";
        } else {
          authLink.innerText = "Sign in";
          authLink.href = "/login.html";
        }
      }
    });
  }
};
