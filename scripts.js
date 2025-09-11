(function(){
  const FAV_KEY = 'sp_favs_v1';
  const grid = document.getElementById('eventsGrid');
  const btn  = document.getElementById('loadMoreBtn');
  const err  = document.getElementById('eventsError');

  if (!Array.isArray(window.EVENTS)) {
    if (err) err.classList.remove('hidden');
    console.error('EVENTS not found. Make sure events-data.js is loaded.');
    return;
  }

  const events = [...window.EVENTS].sort((a,b)=> new Date(a.date)-new Date(b.date));

  const getFavs = ()=> {
    try { return new Set(JSON.parse(localStorage.getItem(FAV_KEY)||'[]')); }
    catch { return new Set(); }
  };
  const saveFavs = (set)=> localStorage.setItem(FAV_KEY, JSON.stringify([...set]));
  const isFav = (id)=> getFavs().has(id);

  function setHeartState(btnEl, on){
    if (!btnEl) return;
    btnEl.classList.toggle('fav-on', !!on);
    btnEl.setAttribute('aria-label', on ? 'Remove from favourites' : 'Add to favourites');
    btnEl.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
      </svg>`;
  }

  let page = 0;
  const PAGE_SIZE = 12;

  function renderPage() {
    const start = page * PAGE_SIZE;
    const slice = events.slice(start, start + PAGE_SIZE);

    slice.forEach(ev => {
      const card = document.createElement('article');
      card.className = 'event-card bg-[color:var(--card)] border border-[color:var(--border)] rounded-2xl overflow-hidden shadow-lg relative';

      // full-tile link
      const link = document.createElement('a');
      link.href = `event.html?id=${encodeURIComponent(ev.id)}`;
      link.className = 'absolute inset-0 z-[1]';
      link.setAttribute('aria-label', `View details: ${ev.title}`);
      card.appendChild(link);

      // image
      const imgWrap = document.createElement('div');
      imgWrap.className = 'relative h-40';
      const img = document.createElement('img');
      img.className = 'w-full h-full object-cover';
      img.src = ev.image; img.alt = ev.title;
      imgWrap.appendChild(img);

      // heart button (uses CSS classes for state)
      const heart = document.createElement('button');
      heart.type = 'button';
      heart.className = 'heart-btn';
      setHeartState(heart, isFav(ev.id));
      heart.addEventListener('click', (e)=>{
        e.preventDefault(); e.stopPropagation();
        const favs = getFavs();
        const onNow = favs.has(ev.id);
        if (onNow) favs.delete(ev.id); else favs.add(ev.id);
        saveFavs(favs);
        setHeartState(heart, favs.has(ev.id));
      });
      imgWrap.appendChild(heart);

      card.appendChild(imgWrap);

      // meta
      const body = document.createElement('div');
      body.className = 'p-4';
      body.innerHTML = `
        <div class="flex flex-wrap gap-2 text-xs text-white/70 mb-2">
          <span class="px-2.5 py-1 rounded-full border border-[color:var(--border)] bg-white/5">${ev.category}</span>
          <span>•</span>
          <span>${ev.city} • ${formatDate(ev.date)}</span>
        </div>
        <h3 class="text-lg font-bold mb-1">${ev.title}</h3>
        <p class="text-white/70">${ev.venue}${ev.priceLabel ? ` • ${ev.priceLabel}` : ''}</p>
      `;
      card.appendChild(body);

      grid.appendChild(card);
    });

    page++;
    if (page * PAGE_SIZE >= events.length) {
      btn.classList.add('hidden');
    } else {
      btn.classList.remove('hidden');
    }

    // Smooth scroll so first new card sits just under sticky bar
    if (slice.length > 0) {
      const firstNewIndex = start;
      const firstNewCard = grid.children[firstNewIndex];
      if (firstNewCard) {
        const y = firstNewCard.getBoundingClientRect().top + window.scrollY - 64;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  }

  function formatDate(iso){
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { month:'short', day:'numeric' });
    } catch { return iso; }
  }

  // init
  renderPage();
  btn.addEventListener('click', renderPage);
})();
