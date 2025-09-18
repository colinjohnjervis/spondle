import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  "https://jvuunvnbpdfrttusgelz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dXVudm5icGRmcnR0dXNnZWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Nzk0NjksImV4cCI6MjA3MzA1NTQ2OX0.i5-X-GsirwcZl0CdAfGsA6qM4ml5itnekPh0RoDCPVY"
);

export const Layout = {
  init({ active }) {
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
    document.getElementById("layout-root").appendChild(nav);

    // ✅ Update UI if user is logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      const authLink = document.getElementById("auth-link");
      if (user) {
        authLink.innerHTML = `<a href="/account.html">My Account</a>`;
      } else {
        authLink.innerHTML = `<a href="/login.html">Sign in</a>`;
      }
    });
  },
};
