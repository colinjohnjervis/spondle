// spondle-layout.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  "https://jvuunvnbpdfrttusgelz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dXVudm5icGRmcnR0dXNnZWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Nzk0NjksImV4cCI6MjA3MzA1NTQ2OX0.i5-X-GsirwcZl0CdAfGsA6qM4ml5itnekPh0RoDCPVY"
);

// -------------------------
// Helpers
// -------------------------
function getFiltersFromURL() {
  const sp = new URL(window.location.href).searchParams;
  return {
    text: (sp.get("text") || "").trim(),
    startDate: (sp.get("startDate") || "").trim(),
    endDate: (sp.get("endDate") || "").trim(),
    location: (sp.get("location") || "").trim(),
  };
}
function toQueryString(filters) {
  const p = new URLSearchParams();
  if (filters.text) p.set("text", filters.text);
  if (filters.startDate) p.set("startDate", filters.startDate);
  if (filters.endDate) p.set("endDate", filters.endDate);
  if (filters.location) p.set("location", filters.location);
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}
function debounce(fn, wait = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// -------------------------
// Flatpickr loader
// -------------------------
async function ensureFlatpickrLoaded() {
  const FLATPICKR_CSS_ID = "sp-flatpickr-css";
  const FLATPICKR_THEME_ID = "sp-flatpickr-dark-css";
  const FLATPICKR_JS_ID = "sp-flatpickr-js";
  const head = document.head;

  function addLink(id, href) {
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = href;
      head.appendChild(link);
    }
  }
  function addScript(id, src) {
    return new Promise((resolve) => {
      if (document.getElementById(id)) return resolve();
      const s = document.createElement("script");
      s.id = id;
      s.src = src;
      s.onload = () => resolve();
      head.appendChild(s);
    });
  }

  addLink(FLATPICKR_CSS_ID, "https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css");
  addLink(FLATPICKR_THEME_ID, "https://cdn.jsdelivr.net/npm/flatpickr/dist/themes/dark.css");
  await addScript(FLATPICKR_JS_ID, "https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.js");
}

// -------------------------
// Date utils
// -------------------------
function formatYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function getToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function getTomorrow() {
  const d = getToday();
  d.setDate(d.getDate() + 1);
  return d;
}
function getUpcomingWeekend() {
  const d = getToday();
  const day = d.getDay(); // 0=Sun ... 6=Sat
  const daysUntilSaturday = (6 - day + 7) % 7;
  const saturday = new Date(d);
  saturday.setDate(d.getDate() + daysUntilSaturday);
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  return { start: saturday, end: sunday };
}

// -------------------------
// Layout Init
// -------------------------
window.Layout = {
  async init({ active } = {}) {
    const { data: { user } } = await supabase.auth.getUser();

    // ---------- Header ----------
    const nav = document.createElement("nav");
    nav.className = "sp-header";
    nav.innerHTML = `
      <div class="sp-header__inner">
        <a href="/index.html" class="sp-logo">
          <span class="sp-logo__dot"></span>
          <span class="sp-logo__text">Spondle</span>
        </a>
        <div class="sp-actions flex items-center gap-2"></div>
      </div>
    `;
    nav.style.position = "relative";
    nav.style.zIndex = "10050";
    const actions = nav.querySelector(".sp-actions");

    // Search button
    const searchButton = document.createElement("button");
    searchButton.className = "sp-icon-btn";
    searchButton.setAttribute("aria-label", "Toggle search");
    searchButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none"
        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    `;

    // Burger button
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
    actions.appendChild(searchButton);
    actions.appendChild(burgerButton);

    // ---------- Search panel ----------
    const searchPanel = document.createElement("div");
    searchPanel.id = "globalSearchPanel";
    searchPanel.className = "sp-search-panel";
    Object.assign(searchPanel.style, {
      position: "fixed",
      left: "0",
      right: "0",
      top: "64px",
      display: "none",
      background: "#0b0b0b",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      zIndex: "10040",
    });
    searchPanel.innerHTML = `
      <form id="globalSearchForm" class="p-4 grid grid-cols-1 md:grid-cols-4 gap-3" style="pointer-events:auto;">
        <div class="md:col-span-2">
          <label class="block text-xs text-gray-400 mb-1">Search</label>
          <input id="globalSearchInput" name="text" type="text" placeholder="Search by event or venue..."
            class="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white" />
        </div>

        <div class="md:col-span-2">
          <label class="block text-xs text-gray-400 mb-1">Location</label>
          <div class="relative">
            <input id="globalLocationInput" name="location" type="text" autocomplete="off" placeholder="Type a town or city…"
              class="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white" />
            <div id="locationSuggestions"
              class="absolute left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg overflow-hidden hidden z-[10060]"></div>
          </div>
        </div>

        <div class="md:col-span-2 flex flex-col items-center">
          <div id="spDatePicker" class="rounded-md border border-gray-700 overflow-hidden w-full flex justify-center"></div>
          <input id="globalStartDate" name="startDate" type="hidden" />
          <input id="globalEndDate" name="endDate" type="hidden" />
          <div class="mt-3 flex flex-wrap justify-center gap-2">
            <button type="button" id="spAnytimeBtn" class="px-3 py-1.5 rounded bg-gray-800 border border-gray-700 text-white text-sm hover:bg-gray-700">Anytime</button>
            <button type="button" id="spTodayBtn" class="px-3 py-1.5 rounded bg-gray-800 border border-gray-700 text-white text-sm hover:bg-gray-700">Today</button>
            <button type="button" id="spTomorrowBtn" class="px-3 py-1.5 rounded bg-gray-800 border border-gray-700 text-white text-sm hover:bg-gray-700">Tomorrow</button>
            <button type="button" id="spWeekendBtn" class="px-3 py-1.5 rounded bg-gray-800 border border-gray-700 text-white text-sm hover:bg-gray-700">Weekend</button>
          </div>
        </div>

        <div class="md:col-span-4">
          <button type="submit"
            class="w-full md:w-auto px-4 py-2 bg-[color:var(--brand)] text-black font-medium rounded hover:opacity-90 transition">
            Apply Filters
          </button>
        </div>
      </form>
    `;
    // Allow interaction inside the panel without closing anything
    searchPanel.addEventListener("click", (e) => e.stopPropagation());

    // ---------- Overlay + Sidebar ----------
    const overlay = document.createElement("div");
    overlay.className = "sp-overlay";
    Object.assign(overlay.style, {
      zIndex: "10020",
      display: "none",
      pointerEvents: "none",
    });

    const sidebar = document.createElement("div");
    sidebar.className = "sp-sidebar";
    sidebar.style.zIndex = "10030";
    sidebar.innerHTML = `
      <div class="sp-sidebar__head">
        <strong>Spondle</strong>
        <button class="sp-close" aria-label="Close sidebar">✕</button>
      </div>
      <nav class="sp-nav" id="sidebar-links">
        <a href="/index.html" class="${active === 'home' ? 'is-active' : ''}">Home</a>
        <a href="/events.html" class="${active === 'events' ? 'is-active' : ''}">Events</a>
      </nav>
    `;

    // ---------- Helper functions (centralised toggles) ----------
    const resetBurgerIcon = () => {
      icon.innerHTML = `
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      `;
    };

    const showCloseIcon = () => {
      icon.innerHTML = `
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      `;
    };

    const closeAllPanels = () => {
      // Close search
      searchPanel.style.display = "none";
      document.body.classList.remove("sp-search-open");

      // Close sidebar
      document.body.classList.remove("sp-drawer-open");
      overlay.style.display = "none";
      overlay.style.pointerEvents = "none";
      resetBurgerIcon();
    };

    const toggleSidebar = () => {
      const willOpen = !document.body.classList.contains("sp-drawer-open");

      // If opening sidebar, ensure search is closed
      if (willOpen) {
        searchPanel.style.display = "none";
        document.body.classList.remove("sp-search-open");
      }

      document.body.classList.toggle("sp-drawer-open");
      const isOpen = document.body.classList.contains("sp-drawer-open");

      if (isOpen) {
        overlay.style.display = "block";
        overlay.style.pointerEvents = "auto";
        showCloseIcon();
      } else {
        overlay.style.display = "none";
        overlay.style.pointerEvents = "none";
        resetBurgerIcon();
      }
    };

    const toggleSearch = () => {
      const isOpen = searchPanel.style.display === "block";

      if (isOpen) {
        // close search
        searchPanel.style.display = "none";
        document.body.classList.remove("sp-search-open");
      } else {
        // close sidebar if open
        document.body.classList.remove("sp-drawer-open");
        overlay.style.display = "none";
        overlay.style.pointerEvents = "none";
        resetBurgerIcon();

        // open search
        searchPanel.style.display = "block";
        document.body.classList.add("sp-search-open");
      }
    };

    // ---------- Event bindings ----------
    overlay.onclick = closeAllPanels;
    sidebar.querySelector(".sp-close").onclick = closeAllPanels;
    burgerButton.onclick = toggleSidebar;
    searchButton.onclick = toggleSearch;

    // ---------- Add elements to DOM ----------
    document.body.prepend(searchPanel);
    document.body.prepend(nav);
    document.body.prepend(overlay);
    document.body.prepend(sidebar);

    // ---------- Sidebar links (About + conditionals) ----------
    const navContainer = document.getElementById("sidebar-links");
    if (navContainer) {
      if (user) {
        // Logged in order:
        // Home, Events, Favourites, Event Dashboard, My Profile, About, Sign out
        navContainer.innerHTML += `
          <a href="/favourites.html" class="${active === 'favourites' ? 'is-active' : ''}">Favourites</a>
          <a href="/event-dashboard.html">Event Dashboard</a>
          <a href="/profile.html">My Profile</a>
          <a href="/about.html">About</a>
          <a href="/logout.html">Sign out</a>
        `;
      } else {
        // Logged out order:
        // Home, Events, About, Sign in
        navContainer.innerHTML += `
          <a href="/about.html">About</a>
          <a href="/login.html" class="${active === "login" ? "is-active" : ""}">Sign in</a>
        `;
      }
    }

    // ---------- Init Flatpickr ----------
    await ensureFlatpickrLoaded();

    const urlFilters = getFiltersFromURL();

    const startInput = document.getElementById("globalStartDate");
    const endInput = document.getElementById("globalEndDate");

    const defaultDates = [];
    if (urlFilters.startDate) defaultDates.push(urlFilters.startDate);
    if (urlFilters.endDate) defaultDates.push(urlFilters.endDate);

    startInput.value = urlFilters.startDate || "";
    endInput.value = urlFilters.endDate || "";

    const fp = flatpickr("#spDatePicker", {
      inline: true,
      mode: "range",
      dateFormat: "Y-m-d",
      defaultDate: defaultDates.length ? defaultDates : null,
      disableMobile: true,
      onChange: (selectedDates) => {
        if (selectedDates.length === 2) {
          startInput.value = formatYMD(selectedDates[0]);
          endInput.value = formatYMD(selectedDates[1]);
        } else if (selectedDates.length === 1) {
          startInput.value = formatYMD(selectedDates[0]);
          endInput.value = "";
        } else {
          startInput.value = "";
          endInput.value = "";
        }
      }
    });

    // ---------- Quick date buttons ----------
    document.getElementById("spAnytimeBtn").addEventListener("click", () => {
      fp.clear();
      startInput.value = "";
      endInput.value = "";
    });
    document.getElementById("spTodayBtn").addEventListener("click", () => {
      const t = getToday();
      fp.setDate([t, t], true);
      startInput.value = formatYMD(t);
      endInput.value = formatYMD(t);
    });
    document.getElementById("spTomorrowBtn").addEventListener("click", () => {
      const t = getTomorrow();
      fp.setDate([t, t], true);
      startInput.value = formatYMD(t);
      endInput.value = formatYMD(t);
    });
    document.getElementById("spWeekendBtn").addEventListener("click", () => {
      const { start, end } = getUpcomingWeekend();
      fp.setDate([start, end], true);
      startInput.value = formatYMD(start);
      endInput.value = formatYMD(end);
    });

    // ---------- Prefill search + location from URL ----------
    document.getElementById("globalSearchInput").value = urlFilters.text || "";
    const globalLocationInput = document.getElementById("globalLocationInput");
    const locationSuggestions = document.getElementById("locationSuggestions");
    globalLocationInput.value = urlFilters.location || "";

    // ---------- Location autocomplete (top 5) ----------
    function hideSuggestions() {
      locationSuggestions.classList.add("hidden");
      locationSuggestions.innerHTML = "";
    }
    function showSuggestions(items) {
      if (!items || items.length === 0) {
        hideSuggestions();
        return;
      }
      locationSuggestions.innerHTML = items
        .map(t => `<button type="button" class="w-full text-left px-3 py-2 hover:bg-gray-700">${t}</button>`)
        .join("");
      locationSuggestions.classList.remove("hidden");

      Array.from(locationSuggestions.querySelectorAll("button")).forEach(btn => {
        btn.addEventListener("click", () => {
          globalLocationInput.value = btn.textContent.trim();
          hideSuggestions();
        });
      });
    }

    const fetchLocations = debounce(async (term) => {
      term = term.trim();
      if (!term) {
        hideSuggestions();
        return;
      }
      // Query top 5 matching town_city
      const { data, error } = await supabase
        .from("location")
        .select("town_city")
        .ilike("town_city", `%${term}%`)
        .order("town_city", { ascending: true })
        .limit(5);

      if (error) {
        console.error(error);
        hideSuggestions();
        return;
      }
      const unique = Array.from(new Set((data || []).map(r => r.town_city).filter(Boolean)));
      showSuggestions(unique.slice(0, 5));
    }, 200);

    globalLocationInput.addEventListener("input", () => {
      fetchLocations(globalLocationInput.value);
    });
    globalLocationInput.addEventListener("focus", () => {
      if (globalLocationInput.value.trim()) fetchLocations(globalLocationInput.value);
    });
    document.addEventListener("click", (e) => {
      const within = e.target.closest("#globalLocationInput") || e.target.closest("#locationSuggestions");
      if (!within) hideSuggestions();
    });
    // ESC to close suggestions
    globalLocationInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hideSuggestions();
    });

    // ---------- Submit (global) ----------
    const searchForm = document.getElementById("globalSearchForm");
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const filters = {
        text: document.getElementById("globalSearchInput").value.trim(),
        startDate: startInput.value,
        endDate: endInput.value,
        location: globalLocationInput.value.trim(),
      };
      window.location.href = `/events.html${toQueryString(filters)}`;
    });
  }
};
