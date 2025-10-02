// spondle-layout.js (with visible debug panel)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  "https://jvuunvnbpdfrttusgelz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dXVudm5icGRmcnR0dXNnZWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Nzk0NjksImV4cCI6MjA3MzA1NTQ2OX0.i5-X-GsirwcZl0CdAfGsA6qM4ml5itnekPh0RoDCPVY"
);

// Helpers
function getFiltersFromURL() {
  const sp = new URL(window.location.href).searchParams;
  const filters = {
    text: (sp.get("text") || "").trim(),
    startDate: (sp.get("startDate") || "").trim(),
    endDate: (sp.get("endDate") || "").trim(),
  };
  return filters;
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

    // ---------- Header (unchanged) ----------
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

    // Search + Burger buttons (unchanged) ...
    // [keeping your working header/sidebar code intact]

    // ---------- Grab form + events grid ----------
    const searchForm = document.getElementById("globalSearchForm");
    const eventsGrid = document.getElementById("eventsGrid");
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    const eventsError = document.getElementById("eventsError");

    // ---------- Submit (global search) ----------
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const filters = {
          text: document.getElementById("globalSearchInput").value.trim(),
          startDate: document.getElementById("globalStartDate").value,
          endDate: document.getElementById("globalEndDate").value,
        };
        debugLog("Search submitted", filters);

        if (eventsGrid) {
          debugLog("Running initialLoad directly", filters);
          initialLoad(filters);
        } else {
          const qs = toQueryString(filters);
          debugLog("Redirecting", `/events.html${qs}`);
          window.location.href = `/events.html${qs}`;
        }
      });
    }

    // ---------- Events page only ----------
    if (eventsGrid) {
      const PAGE_SIZE = 12;
      let page = 0, buffer = [], usingClientBuffer = false;

      function renderCards(rows) {
        debugLog("Rendering rows", rows.length);
        for (const event of rows) {
          const card = document.createElement("div");
          card.className = "relative rounded-xl overflow-hidden shadow bg-gray-900";
          card.innerHTML = `
            <div class="p-4">
              <h3 class="text-xl font-semibold mb-1">${event.event_name}</h3>
              <p class="text-sm text-gray-400 mb-1">${event.event_date}</p>
              <p class="text-sm text-gray-400">${event.venues?.venue_name || "Venue TBA"}</p>
            </div>
          `;
          eventsGrid.appendChild(card);
        }
      }

      async function loadEventsServerPaged({ startDate, endDate }) {
        debugLog("loadEventsServerPaged", { startDate, endDate });
        let q = supabase
          .from("events")
          .select("id,event_name,event_date,venues(venue_name)")
          .eq("publish_status", "published")
          .order("event_date", { ascending: true })
          .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

        const today = new Date().toISOString().split("T")[0];
        q = q.gte("event_date", startDate || today);
        if (endDate) q = q.lte("event_date", endDate);

        const { data, error } = await q;
        if (error) debugLog("Supabase error", error.message);
        debugLog("Supabase server data", data?.length || 0);
        renderCards(data || []);
        page++;
      }

      async function buildClientBuffer({ text, startDate, endDate }) {
        debugLog("buildClientBuffer", { text, startDate, endDate });
        const selectCols = "id,event_name,event_date,venues(venue_name)";
        const today = new Date().toISOString().split("T")[0];

        let q1 = supabase.from("events")
          .select(selectCols)
          .eq("publish_status", "published")
          .order("event_date", { ascending: true })
          .ilike("event_name", `%${text}%`)
          .gte("event_date", startDate || today)
          .limit(500);

        let q2 = supabase.from("events")
          .select(`id,event_name,event_date,venues!inner(venue_name)`)
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
      }

      async function initialLoad(filters) {
        debugLog("initialLoad called", filters);
        eventsGrid.innerHTML = "";
        eventsError?.classList.add("hidden");
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

      // Expose for submit handler
      window.initialLoad = initialLoad;

      // Prefill from URL
      const filtersFromURL = getFiltersFromURL();
      document.getElementById("globalSearchInput").value = filtersFromURL.text || "";
      document.getElementById("globalStartDate").value = filtersFromURL.startDate || "";
      document.getElementById("globalEndDate").value = filtersFromURL.endDate || "";

      debugLog("Filters from URL", filtersFromURL);

      await initialLoad(filtersFromURL);
    }
  }
};
