// spondle-layout.js (FIXED VERSION WITH FULL LAYOUT AND SIGN-IN LOGIC)
(function () {
  function renderSidebar(active) {
    const nav = document.createElement("nav");
    nav.className =
      "fixed top-0 left-0 h-screen w-64 bg-zinc-900 text-white p-4 hidden lg:block";
    nav.innerHTML = `
      <div class="text-2xl font-bold mb-8 text-green-400">Spondle</div>
      <ul class="space-y-4">
        <li><a href="/index.html" class="block hover:text-green-400 ${active === 'home' ? 'text-green-400' : ''}">Home</a></li>
        <li><a href="/events.html" class="block hover:text-green-400 ${active === 'events' ? 'text-green-400' : ''}">Events</a></li>
        <li><a href="/organisers.html" class="block hover:text-green-400 ${active === 'organisers' ? 'text-green-400' : ''}">Organisers</a></li>
        <li><a href="/favourites.html" class="block hover:text-green-400 ${active === 'favourites' ? 'text-green-400' : ''}">Favourites</a></li>
        <li id="auth-link">
          <a href="/login.html" class="block hover:text-green-400 ${active === 'login' ? 'text-green-400' : ''}">Sign in</a>
        </li>
      </ul>
    `;
    const root = document.getElementById("layout-root");
    if (root) root.appendChild(nav);
  }

  async function updateAuthLink(active) {
    const sb = window.supabase;
    const authLink = document.getElementById("auth-link");
    if (!authLink || !sb || !sb.auth || !sb.auth.getSession) return;

    try {
      const { data } = await sb.auth.getSession();
      const session = data?.session;
      if (session?.user) {
        authLink.innerHTML = `<a href="#" class="block hover:text-red-400 text-red-400" id="sign-out-link">Sign out</a>`;
        const signOut = document.getElementById("sign-out-link");
        if (signOut) {
          signOut.addEventListener("click", async (e) => {
            e.preventDefault();
            try {
              await sb.auth.signOut();
            } catch (_) {}
            window.location.href = "/login.html";
          });
        }
      } else {
        authLink.innerHTML = `<a href="/login.html" class="block hover:text-green-400 ${active === 'login' ? 'text-green-400' : ''}">Sign in</a>`;
      }
    } catch (_) {
      // On error, do nothing
    }
  }

  window.Layout = {
    init({ active }) {
      renderSidebar(active);
      updateAuthLink(active);
      setTimeout(() => updateAuthLink(active), 500); // Retry in case Supabase loads late
    },
  };
})();
