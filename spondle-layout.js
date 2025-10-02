// spondle-layout.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  "https://jvuunvnbpdfrttusgelz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dXVudm5icGRmcnR0dXNnZWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Nzk0NjksImV4cCI6MjA3MzA1NTQ2OX0.i5-X-GsirwcZl0CdAfGsA6qM4ml5itnekPh0RoDCPVY"
);

// ---------- Helpers ----------
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
  return p.toString() ? `?${p.toString()}` : "";
}

// Debug helper → append panel below header
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
    panel.style.display = "none";
    const header = document.querySelector(".sp-header");
    if (header && header.parentNode) {
      header.parentNode.insertBefore(panel, header.nextSibling);
    } else {
      document.body.prepend(panel);
    }
  }
  const line = document.createElement("div");
  line.textContent = `[DEBUG] ${message}: ${JSON.stringify(data)}`;
  panel.appendChild(line);
  panel.style.display = "block";
}

// Update page heading
function updateHeading(filters) {
  const heading = document.querySelector("h1");
  const subheading = heading?.nextElementSibling;
  if (!heading || !subheading) return;

  if (filters.text || filters.startDate || filters.endDate) {
    heading.textContent = "Filtered Events";
    subheading.textContent = "Showing results based on your search.";
  } else {
    heading.textContent = "All Events";
    subheading.textContent = "Browse the latest listings from all organisers.";
  }
}

// ---------- Layout ----------
window.Layout = {
  async init({ active } = {}) {
    const { data: { user } } = await supabase.auth.getUser();

    // ----- Header -----
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
    document.body.prepend(nav);

    const actions = nav.querySelector(".sp-actions");

    // Search button
    const searchButton = document.createElement("button");
    searchButton.className = "sp-icon-btn";
    searchButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none"
      viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
    actions.appendChild(searchButton);

    // Burger button
    const burgerButton = document.createElement("button");
    burgerButton.className = "sp-burger";
    burgerButton.innerHTML = `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>`;
    actions.appendChild(burgerButton);

    // ----- Search panel -----
    const searchPanel = document.createElement("div");
    searchPanel.id = "globalSearchPanel";
    searchPanel.className = "sp-search-panel";
    searchPanel.style.display = "none";
    searchPanel.innerHTML = `
      <form id="globalSearchForm" class="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div class="md:col-span-2">
          <label class="block text-xs text-gray-400 mb-1">Search</label>
          <input id="globalSearchInput" type="text"
            class="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
            placeholder="Search by event or venue...">
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">From</label>
          <input id="globalStartDate" type="date"
            class="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white">
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">To</label>
          <input id="globalEndDate" type="date"
            class="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white">
        </div>
        <div class="md:col-span-4">
          <button type="submit" class="px-4 py-2 bg-[color:var(--brand)] text-black rounded">Apply Filters</button>
        </div>
      </form>`;
    document.body.insertBefore(searchPanel, nav.nextSibling);

    // Search toggle
    let searchOpen = false;
    const toggleSearch = (force = null) => {
      searchOpen = force !== null ? force : !searchOpen;
      searchPanel.style.display = searchOpen ? "block" : "none";
      document.body.classList.toggle("sp-search-open", searchOpen);
    };
    searchButton.addEventListener("click", () => toggleSearch());

    // ----- Sidebar + Overlay -----
    const overlay = document.createElement("div");
    overlay.className = "sp-overlay";
    overlay.style.display = "none";
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
    document.body.prepend(overlay);
    document.body.prepend(sidebar);

    sidebar.querySelector(".sp-close").onclick = () => {
      document.body.classList.remove("sp-drawer-open");
      overlay.style.display = "none";
    };
    burgerButton.onclick = () => {
      const isOpen = document.body.classList.toggle("sp-drawer-open");
      overlay.style.display = isOpen ? "block" : "none";
    };

    // ----- Auth links -----
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

    // ----- Search form behaviour -----
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
      debugLog("Search submitted", filters);
      if (eventsGrid) {
        initialLoad(filters);
        toggleSearch(false);
      } else {
        window.location.href = `/events.html${toQueryString(filters)}`;
      }
    });

    // ----- Events page logic -----
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
            </div>`;
          eventsGrid.appendChild(card);
        }
      }

      async function loadEventsServerPaged({ startDate, endDate }) {
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
        if (error) throw error;
        renderCards(data);
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
        debugLog("Deduped buffer length", buffer.length);
        usingClientBuffer = true;
      }

      function loadFromClientBuffer() {
        const slice = buffer.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
        debugLog("loadFromClientBuffer page", page);
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

        updateHeading(filters);

        try {
          if (filters.text) {
            await buildClientBuffer(filters);
            loadFromClientBuffer();
          } else {
            usingClientBuffer = false;
            await loadEventsServerPaged(filters);
          }
        } catch (err) {
          console.error(err);
          eventsError?.classList.remove("hidden");
          if (loadMoreBtn) loadMoreBtn.style.display = "none";
        }
      }

      // Expose
      window.initialLoad = initialLoad;

      // Load more
      loadMoreBtn?.addEventListener("click", () => {
        if (usingClientBuffer) {
          loadFromClientBuffer();
        } else {
          loadEventsServerPaged({
            startDate: document.getElementById("globalStartDate")?.value || "",
            endDate: document.getElementById("globalEndDate")?.value || "",
          });
        }
      });

      // ---- Initial load ----
      const filtersFromURL = getFiltersFromURL();
      if (filtersFromURL.text || filtersFromURL.startDate || filtersFromURL.endDate) {
        await initialLoad(filtersFromURL);
      } else {
        await initialLoad({ text: "", startDate: "", endDate: "" });
      }
    }
  }
};
