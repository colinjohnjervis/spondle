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
        <li><a href="/login.html" class="${active === 'login' ? 'active' : ''}">Sign in</a></li>
      </ul>
    `;
    document.getElementById("layout-root").appendChild(nav);
  },
};
