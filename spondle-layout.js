// spondle-layout.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  "https://jvuunvnbpdfrttusgelz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dXVudm5icGRmcnR0dXNnZWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Nzk0NjksImV4cCI6MjA3MzA1NTQ2OX0.i5-X-GsirwcZl0CdAfGsA6qM4ml5itnekPh0RoDCPVY"
);

window.Layout = {
  async init({ active } = {}) {
    const { data: { user } } = await supabase.auth.getUser();

    // Create header
    const nav = document.createElement("nav");
    nav.className = "sp-header";
    nav.innerHTML = `
      <div class="sp-header__inner">
        <a href="/index.html" class="sp-logo">
          <span class="sp-logo__dot"></span>
          <span class="sp-logo__text">Spondle</span>
        </a>
      </div>
    `;

    // Create burger button with toggle
    const burgerButton = document.createElement("button");
    burgerButton.className = "sp-burger";
    burgerButton.setAttribute("aria-label", "Toggle menu");

    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("width", "24");
    icon.setAttribute("height", "24");
    icon.setAttribute("fill", "none");
    icon.setAttribute("stroke", "currentColor");
    icon.setAttribute("stroke-width", "2");
    icon.setAttribute("stroke-linecap", "round");
    icon.setAttribute("stroke-linejoin", "round");
    icon.innerHTML = `
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    `;

    burgerButton.appendChild(icon);

    burgerButton.onclick = () => {
      const isOpen = document.body.classList.toggle("sp-drawer-open");
      icon.innerHTML = isOpen
        ? `
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        `
        : `
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        `;
    };

    nav.querySelector(".sp-header__inner").appendChild(burgerButton);

    // Create overlay
    const overlay = document.createElement("div");
    overlay.className = "sp-overlay";
    overlay.onclick = () => {
      document.body.classList.remove("sp-drawer-open");
      icon.innerHTML = `
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      `;
    };

    // Create sidebar
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
        <a href="/organisers.html" class="${active === 'organisers' ? 'is-active' : ''}">Organisers</a>
        <a href="/favourites.html" class="${active === 'favourites' ? 'is-active' : ''}">Favourites</a>
      </nav>
    `;

    // Add close button logic
    sidebar.querySelector(".sp-close").onclick = () => {
      document.body.classList.remove("sp-drawer-open");
      icon.innerHTML = `
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      `;
    };

    // Inject layout
    document.body.prepend(overlay);
    document.body.prepend(sidebar);
    document.body.prepend(nav);

    // Inject auth-specific links
    const navContainer = document.getElementById("sidebar-links");
    if (!navContainer) return;

    if (user) {
      const profileLink = document.createElement("a");
      profileLink.href = "/profile.html";
      profileLink.textContent = "My Profile";

      const logoutLink = document.createElement("a");
      logoutLink.href = "/logout.html";
      logoutLink.textContent = "Sign out";

      navContainer.appendChild(profileLink);
      navContainer.appendChild(logoutLink);
    } else {
      const loginLink = document.createElement("a");
      loginLink.href = "/login.html";
      loginLink.className = active === "login" ? "is-active" : "";
      loginLink.textContent = "Sign in";

      navContainer.appendChild(loginLink);
    }
  }
};
