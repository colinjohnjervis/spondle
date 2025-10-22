// schedule.js
// Self-contained Schedule module: Single / Recurring / Tour Schedule tabs + venue search + repeat-until + Flowbite datepickers

export function initSchedule(targetSelector) {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  // --- Inject required CSS/JS once (Flowbite + Datepicker) ---
  ensureOnce('flowbite-css', () => {
    const l = document.createElement('link');
    l.id = 'flowbite-css';
    l.rel = 'stylesheet';
    l.href = 'https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.5.1/flowbite.min.css';
    document.head.appendChild(l);
  });
  ensureOnce('flowbite-js', () => {
    const s = document.createElement('script');
    s.id = 'flowbite-js';
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.5.1/flowbite.min.js';
    document.head.appendChild(s);
  });
  ensureOnce('flowbite-dp-css', () => {
    const l = document.createElement('link');
    l.id = 'flowbite-dp-css';
    l.rel = 'stylesheet';
    l.href = 'https://cdnjs.cloudflare.com/ajax/libs/flowbite-datepicker/1.3.3/datepicker.min.css';
    document.head.appendChild(l);
  });
  ensureOnce('flowbite-dp-js', () => {
    const s = document.createElement('script');
    s.id = 'flowbite-dp-js';
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/flowbite-datepicker/1.3.3/datepicker.min.js';
    document.head.appendChild(s);
  });

  // --- Core styling (blue outlines, cards, etc.) ---
  injectStyle(`
    .sch-card{background:#0f172a;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.45);padding:1rem;}
    .sch-label{font-size:.95rem;color:#e5e7eb;margin-bottom:6px;display:block;}
    .sch-input{background:#0b1220;color:#fff;width:100%;border:1px solid #374151;border-radius:12px;padding:12px;transition:all .2s;}
    .sch-input:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59,130,246,.3);}
    .sch-clear{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:transparent;border:none;color:#9ca3af;font-size:20px;cursor:pointer;}
    .sch-venue-card{background:#111827;border:1px solid #374151;border-radius:12px;padding:12px 14px;margin:8px 0;transition:all .2s;}
    .sch-venue-card:hover{background:#1b2433;border-color:#3b82f6;cursor:pointer;}
    .sch-nores{padding:12px 14px;background:#111827;border:1px solid #374151;border-radius:12px;text-align:center;font-size:.95rem;color:#9ca3af;margin:8px 0;}
    .sch-tabs button{flex:1;padding:10px 0;border-radius:9999px;background:#1f2937;color:#e5e7eb;font-weight:600;transition:all .2s;}
    .sch-tabs button.sch-active{background:#22c55e;color:#000;}
    .sch-results{position:absolute;left:-6px;right:-6px;top:calc(100% + 6px);z-index:60;background:#0f172a;border-radius:12px;padding:10px;display:none;}
    .sch-results.show{display:block;}
    .datepicker[role="dialog"]{position:fixed!important;top:50%!important;left:50%!important;transform:translate(-50%,-50%)!important;z-index:9999!important;width:92%;max-width:420px;background:#fff!important;color:#111!important;border-radius:16px!important;box-shadow:0 20px 60px rgba(0,0,0,.35)!important;}
    .datepicker .days .datepicker-cell{width:44px!important;height:44px!important;line-height:44px!important;border-radius:50%!important;margin:4px!important;text-align:center!important;}
    .datepicker-cell.selected{background:#22c55e!important;color:#fff!important;}
    .sch-divider{height:1px;background:#1d4ed8;margin:1.25rem 0;}
    .sch-x{font-size:18px;line-height:1;width:28px;height:28px;border-radius:9999px;display:flex;align-items:center;justify-content:center;background:#0b1220;border:1px solid #374151;color:#cbd5e1;}
    .sch-x:hover{color:#fff;border-color:#4b5563;}
  `);

  // --- Supabase client (same project) ---
  const supabase = window.supabase?.createClient
    ? window.supabase.createClient(
        "https://jvuunvnbpdfrttusgelz.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      )
    : null;

  // --- Helpers ---
  const today = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const formatUK = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  const parseUK = (s) => {
    const [dd, mm, yyyy] = s.split("/").map((n) => parseInt(n, 10));
    return new Date(yyyy, mm - 1, dd);
  };
  const addYearsLimit = (ukDateString, years) => {
    const d = parseUK(ukDateString);
    d.setFullYear(d.getFullYear() + years);
    return formatUK(d);
  };

  // --- Venue search (5-limit, relevance) ---
  async function searchVenues(q) {
    const clean = (q || "").replace(/[^a-zA-Z0-9\\s'-]/g, "").trim();
    if (!clean || !supabase) return [];
    const { data, error } = await supabase
      .from("venues")
      .select("id,venue_name,street_name,postcode")
      .ilike("venue_name", `%${clean}%`)
      .limit(50);
    if (error || !data) return [];
    const lower = clean.toLowerCase();
    const starts = data
      .filter((v) => v.venue_name?.toLowerCase().startsWith(lower))
      .sort((a, b) => a.venue_name.localeCompare(b.venue_name));
    const contains = data
      .filter((v) => !v.venue_name?.toLowerCase().startsWith(lower) && v.venue_name?.toLowerCase().includes(lower))
      .sort((a, b) => a.venue_name.localeCompare(b.venue_name));
    return [...starts, ...contains].slice(0, 5);
  }

  // --- Base layout ---
  target.innerHTML = `
    <div class="sch-card">
      <div class="sch-tabs flex gap-2 mb-4">
        <button type="button" data-tab="single" class="sch-active">Single / Recurring</button>
        <button type="button" data-tab="tour">Tour Schedule</button>
      </div>

      <div id="sch-panel-single"></div>
      <div id="sch-panel-tour" class="hidden">
        <div id="sch-tour-root"></div>
        <button id="sch-add-tour" type="button"
          class="mt-6 w-full bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-3 rounded-lg">
          + Add another venue/date
        </button>
      </div>
    </div>
  `;

  const tabsWrap = target.querySelector(".sch-tabs");
  const panelSingle = target.querySelector("#sch-panel-single");
  const panelTour = target.querySelector("#sch-panel-tour");
  const tourRoot = target.querySelector("#sch-tour-root");
  const addTourBtn = target.querySelector("#sch-add-tour");

  // --- Single / Recurring Panel setup ---
  panelSingle.innerHTML = buildSingleRecurringMarkup();
  wireSingleRecurring(panelSingle);

  // --- Tab logic ---
  tabsWrap.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-tab]");
    if (!btn) return;
    tabsWrap.querySelectorAll("button").forEach((b) => b.classList.remove("sch-active"));
    btn.classList.add("sch-active");
    const tab = btn.dataset.tab;
    if (tab === "single") {
      panelSingle.classList.remove("hidden");
      panelTour.classList.add("hidden");
    } else {
      panelTour.classList.remove("hidden");
      panelSingle.classList.add("hidden");
      if (!panelTour.dataset.init) {
        addTourBlock(true);
        panelTour.dataset.init = "1";
      }
    }
  });

  addTourBtn.addEventListener("click", () => addTourBlock(false));

  // --- Sub-functions start here ---
  function buildVenueSearchBlock() {
    return `
      <div class="mb-3 relative">
        <label class="sch-label">Venue</label>
        <div class="relative">
          <input type="text" placeholder="Search by venue name..." class="sch-input sch-venue-search">
          <button type="button" class="sch-clear" title="Clear">&times;</button>
          <div class="sch-results">
            <div class="sch-venue-list"></div>
            <div class="sch-nores hidden">No matches found.<br>
              <span class="text-green-500 underline cursor-pointer sch-create-venue-link">+ Add new venue</span>
            </div>
          </div>
        </div>
        <input type="text" readonly placeholder="Venue ID will appear here" class="sch-input mt-2 sch-venue-id text-green-400">
        <input type="url" placeholder="Ticket Link (optional)" class="sch-input mt-2 sch-ticket-url">
        <div class="sch-new-venue hidden mt-3 space-y-2">
          <input type="text" placeholder="Venue name" class="sch-input sch-new-name">
          <input type="text" placeholder="Street address" class="sch-input sch-new-street">
          <input type="text" placeholder="Postcode" class="sch-input sch-new-post">
          <button type="button" class="w-full bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg sch-create-venue">Create Venue</button>
        </div>
      </div>
    `;
  }

function buildSingleRecurringMarkup() {
    return `
      <div class="space-y-4">
        ${buildVenueSearchBlock()}
        <div class="grid grid-cols-2 gap-4 items-end">
          <div>
            <label class="sch-label">From</label>
            <input type="text" readonly class="sch-input sch-from-date" placeholder="DD/MM/YYYY" />
          </div>
          <div>
            <label class="sch-label">Time</label>
            <select class="sch-input sch-from-time"></select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 items-end">
          <div>
            <label class="sch-label">To</label>
            <input type="text" readonly class="sch-input sch-to-date" placeholder="DD/MM/YYYY" />
          </div>
          <div>
            <label class="sch-label">Time</label>
            <select class="sch-input sch-to-time"></select>
          </div>
        </div>
        <div>
          <label class="sch-label">Repeat</label>
          <select class="sch-input sch-repeat">
            <option value="none">Does not repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="fortnightly">Fortnightly</option>
            <option value="monthly">Monthly</option>
            <option value="bi-monthly">Every 2 Months</option>
            <option value="quarterly">Quarterly</option>
            <option value="semiannual">Every 6 Months</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div class="sch-repeat-until-wrap hidden">
          <label class="sch-label">Repeat until</label>
          <input type="text" readonly class="sch-input sch-repeat-until" placeholder="DD/MM/YYYY (max 1 year)" />
        </div>
      </div>
    `;
  }

  // ========== Venue Search ==========
  function wireVenueSearch(scope) {
    const vSearch = scope.querySelector(".sch-venue-search");
    const vId = scope.querySelector(".sch-venue-id");
    const results = scope.querySelector(".sch-results");
    const vList = scope.querySelector(".sch-venue-list");
    const noRes = scope.querySelector(".sch-nores");
    const clearBtn = scope.querySelector(".sch-clear");
    const newForm = scope.querySelector(".sch-new-venue");
    const nName = scope.querySelector(".sch-new-name");
    const nStreet = scope.querySelector(".sch-new-street");
    const nPost = scope.querySelector(".sch-new-post");
    const createBtn = scope.querySelector(".sch-create-venue");
    const addLink = scope.querySelector(".sch-create-venue-link");

    let timeout;
    function open() { results.classList.add("show"); }
    function close() { results.classList.remove("show"); }

    async function render(q) {
      vList.innerHTML = ""; noRes.classList.add("hidden");
      const list = await searchVenues(q);
      if (!list.length) { noRes.classList.remove("hidden"); return; }
      list.forEach(v => {
        const div = document.createElement("div");
        div.className = "sch-venue-card";
        div.innerHTML = `<div class="font-semibold">${escapeHTML(v.venue_name)}</div>
          <div class="text-gray-300">${[v.street_name, v.postcode].filter(Boolean).map(escapeHTML).join(", ")}</div>`;
        div.onclick = () => { vSearch.value = v.venue_name; vId.value = v.id; close(); newForm.classList.add("hidden"); };
        vList.appendChild(div);
      });
    }

    vSearch.addEventListener("input", () => {
      clearTimeout(timeout);
      const q = vSearch.value.trim();
      if (!q) { vList.innerHTML = ""; close(); return; }
      timeout = setTimeout(() => { render(q); open(); }, 200);
    });
    vSearch.addEventListener("focus", () => { if (vList.children.length || !noRes.classList.contains("hidden")) open(); });
    document.addEventListener("click", (e) => { if (!e.target.closest(".sch-results") && !e.target.closest(".sch-venue-search")) close(); });
    clearBtn.addEventListener("click", () => { vSearch.value = ""; vId.value = ""; vList.innerHTML = ""; noRes.classList.add("hidden"); newForm.classList.add("hidden"); close(); });
    addLink?.addEventListener("click", () => { newForm.classList.remove("hidden"); close(); });
    createBtn?.addEventListener("click", async () => {
      const name = nName.value.trim(), street = nStreet.value.trim(), pc = nPost.value.trim();
      if (!name || !supabase) return;
      const { data, error } = await supabase.from("venues").insert([{ venue_name: name, street_name: street, postcode: pc }]).select("id").single();
      if (error) return;
      vId.value = data.id; vSearch.value = name; newForm.classList.add("hidden");
      nName.value = ""; nStreet.value = ""; nPost.value = "";
    });
  }

  // ========== Single / Recurring wiring ==========
  function wireSingleRecurring(scope) {
    wireVenueSearch(scope);
    const fromDate = scope.querySelector(".sch-from-date");
    const toDate = scope.querySelector(".sch-to-date");
    const fromTime = scope.querySelector(".sch-from-time");
    const toTime = scope.querySelector(".sch-to-time");

    fromDate.value = formatUK(today);
    toDate.value = formatUK(today);
    fillTimes(fromTime); fillTimes(toTime);
    fromTime.value = "10:00"; toTime.value = "11:00";

    const fp = new Datepicker(fromDate, { autohide: true, defaultDate: today, language: "en-GB", format: "dd/mm/yyyy" });
    const tp = new Datepicker(toDate, { autohide: true, defaultDate: today, language: "en-GB", format: "dd/mm/yyyy" });

    fromDate.addEventListener("click", () => fp.show());
    toDate.addEventListener("click", () => tp.show());

    fromDate.addEventListener("changeDate", () => {
      const f = parseUK(fromDate.value), t = parseUK(toDate.value);
      if (t < f) { toDate.value = fromDate.value; tp.setDate(f); }
      const until = scope.querySelector(".sch-repeat-until");
      if (until?.value) {
        const max = addYearsLimit(fromDate.value, 1);
        const u = parseUK(until.value);
        if (u > parseUK(max)) until.value = max;
      }
    });

    fromTime.addEventListener("change", () => {
      const [fh, fm] = fromTime.value.split(":").map(Number);
      const [th, tm] = toTime.value.split(":").map(Number);
      const fmins = fh * 60 + fm, tmins = th * 60 + tm;
      if (tmins <= fmins) {
        const bump = fmins + 60;
        toTime.value = `${pad(Math.floor(bump / 60) % 24)}:${pad(bump % 60)}`;
      }
    });

    const repSel = scope.querySelector(".sch-repeat");
    const untilWrap = scope.querySelector(".sch-repeat-until-wrap");
    const untilInp = scope.querySelector(".sch-repeat-until");
    const up = new Datepicker(untilInp, { autohide: true, language: "en-GB", format: "dd/mm/yyyy" });
    untilInp.addEventListener("click", () => up.show());

    repSel.addEventListener("change", () => {
      if (repSel.value === "none") { untilWrap.classList.add("hidden"); untilInp.value = ""; }
      else {
        const max = addYearsLimit(fromDate.value, 1);
        const start = parseUK(fromDate.value);
        up.setDate(start);
        untilInp.value = max;
        untilWrap.classList.remove("hidden");
      }
    });
  }

  function fillTimes(sel) {
    sel.innerHTML = "";
    for (let m = 0; m < 24 * 60; m += 15) {
      const hh = Math.floor(m / 60), mm = m % 60;
      const val = `${pad(hh)}:${pad(mm)}`;
      sel.add(new Option(val, val));
    }
  }

  // ========== Tour Blocks ==========
  function addTourBlock(isFirst) {
    if (tourRoot.children.length) {
      const sep = document.createElement("div");
      sep.className = "sch-divider";
      tourRoot.appendChild(sep);
    }
    const root = document.createElement("div");
    root.innerHTML = `
      <div class="mb-6 relative">
        <div class="flex items-center justify-between mb-2">
          <label class="sch-label">Venue</label>
          ${isFirst ? "" : '<button type="button" class="sch-x sch-remove" title="Remove">×</button>'}
        </div>
        <div class="relative">
          <input type="text" placeholder="Search by venue name..." class="sch-input sch-venue-search">
          <button type="button" class="sch-clear" title="Clear">&times;</button>
          <div class="sch-results">
            <div class="sch-venue-list"></div>
            <div class="sch-nores hidden">No matches found.<br>
              <span class="text-green-500 underline cursor-pointer sch-create-venue-link">+ Add new venue</span>
            </div>
          </div>
        </div>
        <input type="text" readonly placeholder="Venue ID will appear here" class="sch-input mt-2 sch-venue-id text-green-400">
        <input type="url" placeholder="Ticket Link (optional)" class="sch-input mt-2 sch-ticket-url">
        <div class="sch-new-venue hidden mt-3 space-y-2">
          <input type="text" placeholder="Venue name" class="sch-input sch-new-name">
          <input type="text" placeholder="Street address" class="sch-input sch-new-street">
          <input type="text" placeholder="Postcode" class="sch-input sch-new-post">
          <button type="button" class="w-full bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg sch-create-venue">Create Venue</button>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4 items-end">
        <div><label class="sch-label">From</label>
          <input type="text" readonly class="sch-input sch-from-date" placeholder="DD/MM/YYYY" />
        </div>
        <div><label class="sch-label">Time</label>
          <select class="sch-input sch-from-time"></select>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4 items-end mt-6">
        <div><label class="sch-label">To</label>
          <input type="text" readonly class="sch-input sch-to-date" placeholder="DD/MM/YYYY" />
        </div>
        <div><label class="sch-label">Time</label>
          <select class="sch-input sch-to-time"></select>
        </div>
      </div>
    `;
    tourRoot.appendChild(root);
    wireTourBlock(root, isFirst);
  }

  function wireTourBlock(scope, isFirst) {
    wireVenueSearch(scope);
    const fromDate = scope.querySelector(".sch-from-date");
    const toDate = scope.querySelector(".sch-to-date");
    const fromTime = scope.querySelector(".sch-from-time");
    const toTime = scope.querySelector(".sch-to-time");
    const removeBtn = scope.querySelector(".sch-remove");

    fromDate.value = formatUK(today);
    toDate.value = formatUK(today);
    fillTimes(fromTime); fillTimes(toTime);
    fromTime.value = "10:00"; toTime.value = "11:00";

    const fp = new Datepicker(fromDate, { autohide: true, defaultDate: today, language: "en-GB", format: "dd/mm/yyyy" });
    const tp = new Datepicker(toDate, { autohide: true, defaultDate: today, language: "en-GB", format: "dd/mm/yyyy" });
    fromDate.addEventListener("click", () => fp.show());
    toDate.addEventListener("click", () => tp.show());

    fromDate.addEventListener("changeDate", () => {
      const f = parseUK(fromDate.value), t = parseUK(toDate.value);
      if (t < f) { toDate.value = fromDate.value; tp.setDate(f); }
    });

    fromTime.addEventListener("change", () => {
      const [fh, fm] = fromTime.value.split(":").map(Number);
      const [th, tm] = toTime.value.split(":").map(Number);
      const fmins = fh * 60 + fm, tmins = th * 60 + tm;
      if (tmins <= fmins) {
        const bump = fmins + 60;
        toTime.value = `${pad(Math.floor(bump / 60) % 24)}:${pad(bump % 60)}`;
      }
    });

    if (!isFirst && removeBtn) {
      removeBtn.addEventListener("click", () => {
        const prev = scope.previousElementSibling;
        if (prev && prev.classList.contains("sch-divider")) prev.remove();
        scope.remove();
      });
    }
  }

  // Utility helpers
  function ensureOnce(id, fn) { if (!document.getElementById(id)) fn(); }
  function injectStyle(css) { const s = document.createElement("style"); s.textContent = css; document.head.appendChild(s); }
  function escapeHTML(s) { return (s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])); }
}
