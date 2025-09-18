import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  "https://jvuunvnbpdfrttusgelz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dXVudm5icGRmcnR0dXNnZWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Nzk0NjksImV4cCI6MjA3MzA1NTQ2OX0.i5-X-GsirwcZl0CdAfGsA6qM4ml5itnekPh0RoDCPVY"
);

export const Layout = {
  init({ active }) {
    // 1. Render the sidebar immediately
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
    const layoutRoot = document.getElementById("layout-root");
    if (layoutRoot) {
      layoutRoot.appendChild(nav);
    }

    // 2. Then safely check session *after* layout renders
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        const authLink = document.getElementById("auth-link");
        if (!authLink) return;

        if (session && session.user) {
          // Logged in: show Sign out
          authLink.innerHTML = `<a href="#" id="sign-out-link">Sign out</a>`;
          const signOutLink = document.getElementById("sign-out-link");
          if (signOutLink) {
            signOutLink.addEventListener("click", async (e) => {
              e.preventDefault();
              await supabase.auth.signOut();
              window.location.href = "/login.html";
            });
          }
        } else {
          // Not logged in: keep Sign in link
          authLink.innerHTML = `<a href="/login.html" class="${active === 'login' ? 'active' : ''}">Sign in</a>`;
        }
      })
      .catch((err) => {
        console.error("❌ Error checking session:", err);
      });
  },
};
