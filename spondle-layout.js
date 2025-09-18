import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  "https://jvuunvnbpdfrttusgelz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dXVudm5icGRmcnR0dXNnZWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Nzk0NjksImV4cCI6MjA3MzA1NTQ2OX0.i5-X-GsirwcZl0CdAfGsA6qM4ml5itnekPh0RoDCPVY"
);

export const Layout = {
  init({ active }) {
    const root = document.getElementById("layout-root");

    // --- Sticky Header ---
    const header = document.createElement("header");
    header.className = "sp-header";
    header.innerHTML = `
      <div class="sp-header__inner">
        <a href="/index.html" class="sp-logo">
          <div class="sp-logo__dot"></div>
          <div class="sp-logo__text">Spondle</div>
        </a>
        <button class="sp-burger" id="burgerBtn" aria-label="Open menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>
    `;

    // --- Overlay + Sidebar ---
    const overlay = document.createElement("div");
    overlay.className = "sp-overlay";
    overlay.id = "sidebarOverlay";

    const sidebar = document.createElement("aside");
    sidebar.className = "sp-sidebar";
    sidebar.id = "sidebarDrawer";
    sidebar.innerHTML = `
      <div class="sp-sidebar__head">
        <a href="/index.html" class="sp-logo">
          <div class="sp-logo__dot"></div>
          <div class="sp-logo__text">Spondle</div>
        </a>
        <button class="sp-close" id="closeSidebarBtn" aria-label="Close menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <nav class="sp-nav" id="sidebarNav">
        <a href="/index.html" class="${active === 'home' ? 'is-active' : ''}">Home</a>
        <a href="/events.html" class="${active === 'events' ? 'is-active' : ''}">Events</a>
        <a href="/organisers.html" class="${active === 'organisers' ? 'is-active' : ''}">Organisers</a>
        <a href="/favourites.html" class="${active === 'favourites' ? 'is-active' : ''}">Favourites</a>
        <a href="#" id="authLink" class="${active === 'login' ? 'is-active' : ''}">Sign in</a>
      </nav>
    `;

    // Append to layout root
    root.appendChild(header);
    root.appendChild(overlay);
    root.appendChild(sidebar);

    // --- Toggle logic ---
    document.getElementById("burgerBtn").onclick = () => {
      document.body.classList.add("sp-drawer-open");
    };
    document.getElementById("closeSidebarBtn").onclick = () => {
      document.body.classList.remove("sp-drawer-open");
    };
    overlay.onclick = () => {
      document.body.classList.remove("sp-drawer-open");
    };

    // --- Supabase auth link ---
    const authLink = document.getElementById("authLink");
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        authLink.textContent = "Sign out";
        authLink.onclick = async (e) => {
          e.preventDefault();
          await supabase.auth.signOut();
          location.reload(); // Refresh UI
        };
      } else {
        authLink.textContent = "Sign in";
        authLink.setAttribute("href", "/login.html");
      }
    });
  },
};
