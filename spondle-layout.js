// spondle-layout.js (non-module, safe on every page)
// - No `import`
// - Works with <script src="./spondle-layout.js"> (classic script)
// - Uses window.supabase if present, otherwise leaves "Sign in"

(function () {
  function renderSidebar(active) {
    const nav = document.createElement("nav");
    nav.className = "sidebar";
    nav.innerHTML = `
      <div class="logo">🟢 Spondle</div>
      <ul>
        <li><a href="/index.html" class="${active === 'home' ? 'active' : ''}">Home</a></li>
        <li><a href="/events.html" class="${active === 'events' ? 'active' : ''}">Events</a></li>
        <li><a href="/organisers.html" class="${active === 'organisers' ? 'active' : ''}">Organisers</a></li>
        <li><a href="/favourites.html" class="${active === 'favourites' ? 'active' : ''}">Favourites</a></li>
        <li id="auth-link">
          <a href="/login.html" class="${active === 'login' ? 'active' : ''}">Sign in</a>
        </li>
      </ul>
    `;
    const root = document.getElementById("layout-root");
    if (root) root.appendChild(nav);
  }

  async function updateAuthLink(active) {
    // Only run if Supabase client exists globally
    const sb = window.supabase;
    const authLink = document.getElementById("auth-link");
    if (!authLink || !sb || !sb.auth || !sb.auth.getSession) return;

    try {
      const { data } = await sb.auth.getSession();
      const session = data && data.session;
      if (session && session.user) {
        // Logged in → show Sign out
        authLink.innerHTML = `<a href="#" id="sign-out-link">Sign out</a>`;
        const signOut = document.getElementById("sign-out-link");
        if (signOut) {
          signOut.addEventListener("click", async (e) => {
            e.preventDefault();
            try {
              await sb.auth.signOut();
            } catch (_) {}
            // Redirect back to login after sign out
            window.location.href = "/login.html";
          });
        }
      } else {
        // Not logged in → show Sign in (keep active class behavior)
        authLink.innerHTML = `<a href="/login.html" class="${active === 'login' ? 'active' : ''}">Sign in</a>`;
      }
    } catch (_) {
      // On any error, leave default "Sign in"
    }
  }

  // Public API used by pages: Layout.init({ active: '...' })
  window.Layout = {
    init({ active }) {
      renderSidebar(active);
      // Try to update auth link now…
      updateAuthLink(active);
      // …and try once more after a short delay in case supabase loads later
      setTimeout(() => updateAuthLink(active), 500);
    },
  };
})();
