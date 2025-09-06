<script>
// share.js — lightweight sharing helper (no deps)

(function () {
  function addUTM(url, source) {
    try {
      const u = new URL(url);
      if (!u.searchParams.has('utm_source')) {
        u.searchParams.set('utm_source', source);
        u.searchParams.set('utm_medium', 'share');
        u.searchParams.set('utm_campaign', 'event_share');
      }
      return u.toString();
    } catch {
      return url;
    }
  }

  function buildLinks({ title, url }) {
    const u = encodeURIComponent(url);
    const t = encodeURIComponent(title || 'Check this out');
    return {
      whatsapp: `https://wa.me/?text=${t}%20${u}`,
      x: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      email: `mailto:?subject=${t}&body=${t}%0A${u}`
    };
  }

  async function copyToClipboard(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch { return false; }
  }

  function shareNative({ title, text, url }) {
    if (navigator.share) {
      return navigator.share({ title, text: text || title, url });
    }
    return Promise.reject(new Error('Web Share API not available'));
  }

  function ShareBar(container, { title, url }) {
    const fullUrl = addUTM(url, 'spondle');
    const links = buildLinks({ title, url: fullUrl });

    const el = document.createElement('div');
    el.className = 'sharebar';
    el.innerHTML = `
      <button class="btn share-native" title="Share" aria-label="Share">📲 Share</button>
      <div class="share-icons" role="group" aria-label="Share options">
        <a class="icon" href="${links.whatsapp}" target="_blank" rel="noopener" title="WhatsApp" aria-label="Share on WhatsApp">🟢</a>
        <a class="icon" href="${links.x}" target="_blank" rel="noopener" title="X (Twitter)" aria-label="Share on X">✖️</a>
        <a class="icon" href="${links.facebook}" target="_blank" rel="noopener" title="Facebook" aria-label="Share on Facebook">📘</a>
        <a class="icon" href="${links.email}" title="Email" aria-label="Share via Email">✉️</a>
        <button class="icon copy" title="Copy link" aria-label="Copy link">🔗</button>
      </div>
      <span class="share-toast" aria-live="polite" hidden>Link copied</span>
    `;

    const toast = el.querySelector('.share-toast');

    el.querySelector('.share-native').addEventListener('click', async () => {
      try { await shareNative({ title, text: title, url: fullUrl }); }
      catch { /* fallback: do nothing, user can use icons */ }
    });

    el.querySelector('.copy').addEventListener('click', async () => {
      const ok = await copyToClipboard(fullUrl);
      if (ok) {
        toast.hidden = false;
        toast.textContent = 'Link copied';
        setTimeout(() => { toast.hidden = true; }, 1200);
      }
    });

    container.appendChild(el);
    return el;
  }

  // expose
  window.SpondleShare = { ShareBar };
})();
</script>
