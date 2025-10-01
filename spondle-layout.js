// spondle-layout.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  "https://jvuunvnbpdfrttusgelz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dXVudm5icGRmcnR0dXNnZWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Nzk0NjksImV4cCI6MjA3MzA1NTQ2OX0.i5-X-GsirwcZl0CdAfGsA6qM4ml5itnekPh0RoDCPVY"
);

window.Layout = {
  async init({ active } = {}) {
    const { data: { user } } = await supabase.auth.getUser();

    // --- Header ---
    const nav = document.createElement("nav");
    nav.className = "sp-header";
    nav.innerHTML = `
      <div class="sp-header__inner">
        <a href="/index.html" class="sp-logo">
          <span class="sp-logo__dot"></span>
          <span class="sp-logo__text">Spondle</span>
        </a>
        <div class="sp-actions"></div>
      </div>
    `;

    const actions = nav.querySelector(".sp-actions");

    // --- Search button ---
    const searchButton = document.createElement("button");
    searchButton.className = "sp-icon-btn";
    searchButton.setAttribute("aria-label", "Open search");

    searchButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none"
           viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    `;

    // --- Burger button ---
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

    actions.appendChild(searchButton);
    actions.appendChild(burgerButton);

    // --- Overlay search panel ---
    const searchOverlay = document.createElement("div");
    searchOverlay.id = "globalSearchOverlay";
    searchOverlay.className = "fixed inset-0 bg-black/70 hidden flex items-start justify-center z-50";
    searchOverlay.innerHTML = `
      <div class="bg-gray-900 w-full max-w-4xl mt-20 rounded-lg shadow-lg p-6 animate-slide">
        <form id="globalSearchForm" class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div class="md:col-span-2">
            <label class="block text-xs text-gray-400 mb-1">Search</label>
            <input name="text" type="text" placeholder="Search by event or venue..."
                   class="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">From</label>
            <input name="startDate" type="date"
                   class="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">To</label>
            <input name="endDate" type="date"
                   class="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white" />
          </div>
          <div class="md:col-span-4 flex justify-end gap-2">
            <button type="button" id="closeSearchOverlay"
                    class="px-4 py-2 bg-gray-700 text-white rounded hover:opacity-80">Cancel</button>
            <button type="submit"
                    class="px-4 py-2 bg-[color:var(--brand)] text-black font-medium rounded hover:opacity-90">Apply Filters</button>
          </div>
        </form>
      </div>
    `;

    document.body.prepend(searchOverlay);

    // Open search overlay
    searchButton.onclick = () => {
      searchOverlay.classList.remove("hidden");
    };

    // Close search overlay
    searchOverlay.querySelector("#closeSearchOverlay").onclick = () => {
      searchOverlay.classList.add("hidden");
    };

    // Submit search overlay
    const globalSearchForm = searchOverlay.querySelector("#globalSearchForm");
    globalSearchForm.onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(globalSearchForm);
      const q = formData.get("text").trim();
      const startDate = formData.get("startDate");
      const endDate = formData.get("endDate");

      // If we’re already on /events.html, dispatch a custom event
      if (window.location.pathname.endsWith("events.html")) {
        window.dispatchEvent(new CustomEvent("applyGlobalSearch", {
          detail: { text: q, startDate, endDate }
        }));
      } else {
        // Otherwise redirect to events page with query params
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        window.location.href = "/events.html?" + params.toString();
      }

      searchOverlay.classList.add("hidden");
    };

    // --- Sidebar + overlay ---
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

    document.body.prepend(overlay);
    document.body.prepend(sidebar);
    document.body.prepend(nav);

    // --- Auth-specific links ---
    const navContainer = document.getElementById("sidebar-links");
    if (navContainer) {
      if (user) {
        navContainer.innerHTML += `
          <a href="/event-dashboard.html">Event Dashboard</a>
          <a href="/profile.html">My Profile</a>
          <a href="/logout.html">Sign out</a>
        `;
      } else {
        navContainer.innerHTML += `
          <a href="/login.html" class="${active === "login" ? "is-active" : ""}">Sign in</a>
        `;
      }
    }
  }
};
