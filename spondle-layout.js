// spondle-layout.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  "https://jvuunvnbpdfrttusgelz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dXVudm5icGRmcnR0dXNnZWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Nzk0NjksImV4cCI6MjA3MzA1NTQ2OX0.i5-X-GsirwcZl0CdAfGsA6qM4ml5itnekPh0RoDCPVY"
);

window.Layout = {
  async init({ active } = {}) {
    const { data: { user } } = await supabase.auth.getUser();

    // Header
    const nav = document.createElement("nav");
    nav.className = "sp-header";
    nav.innerHTML = `
      <div class="sp-header__inner">
        <a href="/index.html" class="sp-logo">
          <span class="sp-logo__dot"></span>
          <span class="sp-logo__text">Spondle</span>
        </a>
      </div>
    `;

    // 🔍 Search button
    const searchBtn = document.createElement("button");
    searchBtn.className = "sp-search-btn";
    searchBtn.setAttribute("aria-label", "Search");
    searchBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
        stroke="currentColor" stroke-width="2" class="w-6 h-6">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    `;

    // 🍔 Burger button
    const burgerButton = document.createElement("button");
    burgerButton.className = "sp-burger";
    burgerButton.setAttribute("aria-label", "Toggle menu");
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("width", "24");
    icon.setAttribute("height", "24");
    icon.setAttribute("fill", "none");
    icon.setAttribute("stroke", "currentColor");
    icon.setAttribute("stroke-width", "2");
    icon.setAttribute("stroke-linecap", "round");
    icon.setAttribute("stroke-linejoin", "round");
    icon.innerHTML = `
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    `;
    burgerButton.appendChild(icon);

    burgerButton.onclick = () => {
      const isOpen = document.body.classList.toggle("sp-drawer-open");
      icon.innerHTML = isOpen
        ? `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`
        : `<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>`;
    };

    // Inject buttons into header
    const headerInner = nav.querySelector(".sp-header__inner");
    headerInner.appendChild(searchBtn);
    headerInner.appendChild(burgerButton);

    // Overlay
    const overlay = document.createElement("div");
    overlay.className = "sp-overlay";
    overlay.onclick = () => {
      document.body.classList.remove("sp-drawer-open");
      icon.innerHTML = `
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      `;
    };

    // Sidebar
    const sidebar = document.createElement("div");
    sidebar.className = "sp-sidebar";
    sidebar.innerHTML = `
      <div class="sp-sidebar__head">
        <strong>Spondle</strong>
        <button class="sp-close" aria-label="Close sidebar">✕</button>
      </div>
      <nav class="sp-nav" id="sidebar-links">
        <a href="/index.html" class="${active === 'home' ? 'is-active' : ''}">Home</a>
        <a href="/events.html" class="${active === 'events' ? 'is-active' : ''}">Events</a>
        <a href="/favourites.html" class="${active === 'favourites' ? 'is-active' : ''}">Favourites</a>
      </nav>
    `;
    sidebar.querySelector(".sp-close").onclick = () => {
      document.body.classList.remove("sp-drawer-open");
      icon.innerHTML = `
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      `;
    };

    // 🔽 Search panel
    const searchPanel = document.createElement("div");
    searchPanel.className = "sp-search-panel";
    searchPanel.innerHTML = `
      <form id="globalSearchForm" class="p-4 bg-gray-900 border-b border-gray-700 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div class="md:col-span-2">
          <input name="q" type="text" placeholder="Search by event or venue..."
            class="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white" />
        </div>
        <div>
          <input name="from" type="date"
            class="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white" />
        </div>
        <div>
          <input name="to" type="date"
            class="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white" />
        </div>
        <div class="md:col-span-4">
          <button type="submit"
            class="w-full md:w-auto px-4 py-2 bg-[color:var(--brand)] text-black font-medium rounded hover:opacity-90 transition">
            Apply Filters
          </button>
        </div>
      </form>
    `;
    searchPanel.style.maxHeight = "0";
    searchPanel.style.overflow = "hidden";
    searchPanel.style.transition = "max-height 0.3s ease";

    searchBtn.onclick = () => {
      if (searchPanel.style.maxHeight === "0px" || !searchPanel.style.maxHeight) {
        searchPanel.style.maxHeight = "200px";
      } else {
        searchPanel.style.maxHeight = "0";
      }
    };

    // Inject into DOM
    document.body.prepend(overlay);
    document.body.prepend(sidebar);
    document.body.prepend(nav);
    document.body.insertBefore(searchPanel, document.body.children[1]);

    // Auth links
    const navContainer = document.getElementById("sidebar-links");
    if (user) {
      navContainer.insertAdjacentHTML("beforeend", `
        <a href="/event-dashboard.html">Event Dashboard</a>
        <a href="/profile.html">My Profile</a>
        <a href="/logout.html">Sign out</a>
      `);
    } else {
      navContainer.insertAdjacentHTML("beforeend", `
        <a href="/login.html" class="${active === "login" ? "is-active" : ""}">Sign in</a>
      `);
    }

    // Handle global search submit → redirect with params
    const globalSearchForm = document.getElementById("globalSearchForm");
    globalSearchForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const params = new URLSearchParams(new FormData(globalSearchForm));
      window.location.href = "/events.html?" + params.toString();
    });
  }
};
