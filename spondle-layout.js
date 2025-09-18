// spondle-layout.js (non-module version)

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  "https://jvuunvnbpdfrttusgelz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dXVudm5icGRmcnR0dXNnZWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Nzk0NjksImV4cCI6MjA3MzA1NTQ2OX0.i5-X-GsirwcZl0CdAfGsA6qM4ml5itnekPh0RoDCPVY"
);

window.Layout = {
  init({ active }) {
    const nav = document.createElement("nav");
    nav.className = "sp-sidebar";

    nav.innerHTML = `
      <div class="sp-sidebar__head">
        <a href="/" class="sp-logo">
          <span class="sp-logo__dot"></span>
          <span class="sp-logo__text">Spondle</span>
        </a>
        <button class="sp-close" onclick="document.body.classList.remove('sp-drawer-open')">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 
            1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 
            1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 
            5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <div class="sp-nav">
        <a href="/index.html" class="${active === 'home' ? 'is-active' : ''}">Home</a>
        <a href="/events.html" class="${active === 'events' ? 'is-active' : ''}">Events</a>
        <a href="/organisers.html" class="${active === 'organisers' ? 'is-active' : ''}">Organisers</a>
        <a href="/favourites.html" class="${active === 'favourites' ? 'is-active' : ''}">Favourites</a>
        <a href="/account.html" id="auth-action-link">Sign in</a>
      </div>
    `;

    document.getElementById("layout-root").appendChild(nav);

    // Add overlay for closing sidebar
    const overlay = document.createElement("div");
    overlay.className = "sp-overlay";
    overlay.onclick = () => document.body.classList.remove("sp-drawer-open");
    document.body.appendChild(overlay);

    // Update auth link based on session
    supabase.auth.getUser().then(({ data: { user } }) => {
      const link = document.getElementById("auth-action-link");
      if (user) {
        link.textContent = "Sign out";
        link.href = "#";
        link.onclick = async (e) => {
          e.preventDefault();
          await supabase.auth.signOut();
          window.location.href = "/login.html";
        };
      } else {
        link.textContent = "Sign in";
        link.href = "/login.html";
      }
    });
  }
};
