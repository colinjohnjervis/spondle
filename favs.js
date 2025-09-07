// Simple favourites via localStorage, shared across pages
(function(){
  const KEY = "spondle:favs";
  function getSet(){ try{ return new Set(JSON.parse(localStorage.getItem(KEY)||"[]")); }catch(e){ return new Set(); } }
  function saveSet(set){ localStorage.setItem(KEY, JSON.stringify([...set])); }
  window.Favs = {
    all: () => [...getSet()],
    has: id => getSet().has(id),
    add: id => { const s=getSet(); s.add(id); saveSet(s); Favs.renderBadge(); return true; },
    remove: id => { const s=getSet(); s.delete(id); saveSet(s); Favs.renderBadge(); return false; },
    toggle: id => (Favs.has(id) ? Favs.remove(id) : Favs.add(id)),
    count: () => getSet().size,
    renderBadge: () => {
      const el = document.querySelector('[data-fav-count]');
      if (!el) return;
      const n = Favs.count();
      el.textContent = n;
      el.style.display = n ? 'inline-flex' : 'none';
    }
  };
  document.addEventListener('DOMContentLoaded', Favs.renderBadge);
})();
