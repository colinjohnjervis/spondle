// spondle-layout.js (with debug panel merged into events page)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  "https://jvuunvnbpdfrttusgelz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dXVudm5icGRmcnR0dXNnZWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Nzk0NjksImV4cCI6MjA3MzA1NTQ2OX0.i5-X-GsirwcZl0CdAfGsA6qM4ml5itnekPh0RoDCPVY"
);

// Helpers
function getFiltersFromURL() {
  const sp = new URL(window.location.href).searchParams;
  return {
    text: (sp.get("text") || "").trim(),
    startDate: (sp.get("startDate") || "").trim(),
    endDate: (sp.get("endDate") || "").trim(),
  };
}
function toQueryString(filters) {
  const p = new URLSearchParams();
  if (filters.text) p.set("text", filters.text);
  if (filters.startDate) p.set("startDate", filters.startDate);
  if (filters.endDate) p.set("endDate", filters.endDate);
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

// Debug helper → write into page
function debugLog(message, data) {
  let panel = document.getElementById("debugPanel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "debugPanel";
    panel.style.background = "#222";
    panel.style.color = "#0f0";
    panel.style.padding = "10px";
    panel.style.fontSize = "12px";
    panel.style.whiteSpace = "pre-wrap";
    panel.style.borderBottom = "2px solid #0f0";
    document.body.prepend(panel);
  }
  const line = document.createElement("div");
  line.textContent = `[DEBUG] ${message}: ${JSON.stringify(data)}`;
  panel.appendChild(line);
  panel.style.display = "block";
}

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
      left: "0", right: "0", top: "64px",
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
        <div>
          <label class="block text-xs text-gray-400 mb-1">From</label>
          <input id="globalStartDate" name="startDate" type="date"
            class="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white" />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">To</label>
          <input id="globalEndDate" name="endDate" type="date"
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
    searchPanel.addEventListener("click", e => e.stopPropagation());

    let searchOpen = false;
    const toggleSearch = (force = null) => {
      searchOpen = force !== null ? force : !searchOpen;
      searchPanel.style.display = searchOpen ? "block" : "none";
      document.body.classList.toggle("sp-search-open", searchOpen);
    };
    searchButton.addEventListener("click", () => toggleSearch());

    document.body.prepend(searchPanel);
    document.body.prepend(nav);

    // ---------- Overlay + Sidebar ----------
    const overlay = document.createElement("div");
    overlay.className = "sp-overlay";
    Object.assign(overlay.style, {
      zIndex: "10020",
      display: "none",
      pointerEvents: "none",
    });
    overlay.onclick = () => {
      document.body.classList.remove("sp-drawer-open");
      overlay.style.display = "none";
      overlay.style.pointerEvents = "none";
      icon.innerHTML = `
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      `;
    };

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
        <a href="/favourites.html" class="${active === 'favourites' ? 'is-active' : ''}">Favourites</a>
      </nav>
    `;
    sidebar.querySelector(".sp-close").onclick = () => {
      document.body.classList.remove("sp-drawer-open");
      overlay.style.display = "none";
      overlay.style.pointerEvents = "none";
      icon.innerHTML = `
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      `;
    };

    document.body.prepend(overlay);
    document.body.prepend(sidebar);

    burgerButton.onclick = () => {
      const isOpen = document.body.classList.toggle("sp-drawer-open");
      overlay.style.display = isOpen ? "block" : "none";
      overlay.style.pointerEvents = isOpen ? "auto" : "none";
      icon.innerHTML = isOpen
        ? `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`
        : `<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>`;
    };

    // ---------- Auth links ----------
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

    // ---------- Prefill search fields ----------
    const urlFilters = getFiltersFromURL();
    document.getElementById("globalSearchInput").value = urlFilters.text || "";
    document.getElementById("globalStartDate").value = urlFilters.startDate || "";
    document.getElementById("globalEndDate").value = urlFilters.endDate || "";

    // ---------- Submit (global) ----------
    const searchForm = document.getElementById("globalSearchForm");
    const eventsGrid = document.getElementById("eventsGrid");
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    const eventsError = document.getElementById("eventsError");

    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const filters = {
        text: document.getElementById("globalSearchInput").value.trim(),
        startDate: document.getElementById("globalStartDate").value,
        endDate: document.getElementById("globalEndDate").value,
      };
      if (eventsGrid) {
        debugLog("Search submitted", filters);
        initialLoad(filters);
        toggleSearch(false);
      } else {
        window.location.href = `/events.html${toQueryString(filters)}`;
      }
    });

    // ---------- Events logic only on pages with #eventsGrid ----------
    if (eventsGrid) {
      const PAGE_SIZE = 12;
      let page = 0, buffer = [], usingClientBuffer = false;

      function renderCards(rows) {
        debugLog("Rendering rows", rows.length);
        for (const event of rows) {
          const card = document.createElement("div");
          card.className = "relative rounded-xl overflow-hidden shadow bg-gray-900";

          const imageContent = event.image_url
            ? `<img src="${event.image_url}" alt="${event.event_name}" class="w-full h-40 object-cover">`
            : `<div class="w-full h-40 flex items-center justify-center bg-gray-800 text-gray-400 text-sm">Image Coming Soon</div>`;

          const formattedDate = new Date(event.event_date).toLocaleDateString("en-GB", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
          });

          const venueName = event.venues?.venue_name || "Venue TBA";
          const townCity = event.venues?.location?.town_city || "";
          const venueDisplay = townCity ? `${venueName}, ${townCity}` : venueName;

          card.innerHTML = `
            ${imageContent}
            <div class="p-4">
              <h3 class="text-xl font-semibold mb-1">${event.event_name}</h3>
              <p class="text-sm text-gray-400 mb-1">${formattedDate}</p>
              <p class="text-sm text-gray-400">${venueDisplay}</p>
            </div>
          `;
          eventsGrid.appendChild(card);
        }
      }

      async function loadEventsServerPaged({ startDate, endDate }) {
        debugLog("loadEventsServerPaged", { startDate, endDate });
        let q = supabase
          .from("events")
          .select("id,event_name,event_date,event_time,image_url,venues(venue_name,location:location_id(town_city))")
          .eq("publish_status", "published")
          .order("event_date", { ascending: true })
          .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

        const today = new Date().toISOString().split("T")[0];
        q = q.gte("event_date", startDate || today);
        if (endDate) q = q.lte("event_date", endDate);

        const { data, error } = await q;
        if (error) debugLog("Supabase error", error.message);
        debugLog("Server query returned", data?.length || 0);
        renderCards(data || []);
        page++;
        if (data.length < PAGE_SIZE && loadMoreBtn) loadMoreBtn.style.display = "none";
      }

      async function buildClientBuffer({ text, startDate, endDate }) {
        debugLog("buildClientBuffer", { text, startDate, endDate });
        const selectCols = "id,event_name,event_date,event_time,image_url,venues(venue_name,location:location_id(town_city))";
        const today = new Date().toISOString().split("T")[0];

        let q1 = supabase.from("events")
          .select(selectCols)
          .eq("publish_status", "published")
          .order("event_date", { ascending: true })
          .ilike("event_name", `%${text}%`)
          .gte("event_date", startDate || today)
          .limit(500);

        let q2 = supabase.from("events")
          .select(`id,event_name,event_date,event_time,image_url,venues!inner(venue_name,location:location_id(town_city))`)
          .eq("publish_status", "published")
          .order("event_date", { ascending: true })
          .ilike("venues.venue_name", `%${text}%`)
          .gte("event_date", startDate || today)
          .limit(500);

        if (endDate) {
          q1 = q1.lte("event_date", endDate);
          q2 = q2.lte("event_date", endDate);
        }

        const [{ data: a }, { data: b }] = await Promise.all([q1, q2]);
        debugLog("Query A results", a?.length || 0);
        debugLog("Query B results", b?.length || 0);

        const dedup = new Map();
        [...(a || []), ...(b || [])].forEach(row => dedup.set(row.id, row));
        buffer = [...dedup.values()].sort((x, y) => x.event_date.localeCompare(y.event_date));
        usingClientBuffer = true;
        debugLog("Deduped buffer length", buffer.length);
      }

      function loadFromClientBuffer() {
        debugLog("loadFromClientBuffer page", page);
        const slice = buffer.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
        renderCards(slice);
        page++;
        if (page * PAGE_SIZE >= buffer.length && loadMoreBtn) loadMoreBtn.style.display = "none";
      }

      async function initialLoad(filters) {
        debugLog("initialLoad called", filters);
        eventsGrid.innerHTML = "";
        eventsError?.classList.add("hidden");
        if (loadMoreBtn) loadMoreBtn.style.display = "block";
        page = 0;

        try {
          if (filters.text) {
            await buildClientBuffer(filters);
            loadFromClientBuffer();
          } else {
            usingClientBuffer = false;
            await loadEventsServerPaged(filters);
          }
        } catch (err) {
          debugLog("initialLoad error", err.message);
        }
      }

      window.initialLoad = initialLoad;

      // Prefill search fields from URL params
      const filtersFromURL = getFiltersFromURL();
      document.getElementById("globalSearchInput").value = filtersFromURL.text || "";
      document.getElementById("globalStartDate").value = filtersFromURL.startDate || "";
      document.getElementById("globalEndDate").value = filtersFromURL.endDate || "";

      debugLog("Filters from URL", filtersFromURL);

      await initialLoad(filtersFrom
