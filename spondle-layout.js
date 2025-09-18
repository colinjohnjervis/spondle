// spondle-layout.js (CLEAN, WORKING VERSION) import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient( "https://jvuunvnbpdfrttusgelz.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dXVudm5icGRmcnR0dXNnZWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Nzk0NjksImV4cCI6MjA3MzA1NTQ2OX0.i5-X-GsirwcZl0CdAfGsA6qM4ml5itnekPh0RoDCPVY" );

export const Layout = { init({ active }) { const root = document.getElementById("layout-root"); if (!root) return;

root.innerHTML = `
  <header class="sp-header">
    <div class="sp-header__inner">
      <a href="/index.html" class="sp-logo">
        <div class="sp-logo__dot"></div>
        <div class="sp-logo__text">Spondle</div>
      </a>
      <button id="menuButton" class="sp-burger" aria-label="Open menu">
        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
    </div>
  </header>

  <div class="sp-overlay" id="sidebarOverlay"></div>

  <aside class="sp-sidebar" id="sidebar">
    <div class="sp-sidebar__head">
      <div style="font-weight:600">Menu</div>
      <button id="closeSidebar" class="sp-close" aria-label="Close menu">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
    <nav class="sp-nav">
      <a href="/index.html" class="${active === 'home' ? 'is-active' : ''}">Home</a>
      <a href="/events.html" class="${active === 'events' ? 'is-active' : ''}">Events</a>
      <a href="/organisers.html" class="${active === 'organisers' ? 'is-active' : ''}">Organisers</a>
      <a href="/favourites.html" class="${active === 'favourites' ? 'is-active' : ''}">Favourites</a>
      <a href="#" id="authLink">Checking...</a>
    </nav>
  </aside>
`;

// Sidebar open/close
const menuBtn = document.getElementById("menuButton");
const closeBtn = document.getElementById("closeSidebar");
const overlay = document.getElementById("sidebarOverlay");
const sidebar = document.getElementById("sidebar");

function openSidebar() {
  document.body.classList.add("sp-drawer-open");
}
function closeSidebar() {
  document.body.classList.remove("sp-drawer-open");
}

menuBtn?.addEventListener("click", openSidebar);
closeBtn?.addEventListener("click", closeSidebar);
overlay?.addEventListener("click", closeSidebar);

// Auth link update
const authLink = document.getElementById("authLink");
supabase.auth.getUser().then(({ data: { user } }) => {
  if (user) {
    authLink.textContent = "Sign out";
    authLink.href = "#";
    authLink.addEventListener("click", async (e) => {
      e.preventDefault();
      await supabase.auth.signOut();
      window.location.href = "/login.html";
    });
  } else {
    authLink.textContent = "Sign in";
    authLink.href = "/login.html";
  }
});

}, };

