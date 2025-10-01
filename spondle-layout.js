/* --- Header --- */
.sp-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #111;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sp-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
}

.sp-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
  color: #fff;
  text-decoration: none;
}

.sp-logo__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: limegreen;
}

.sp-logo__text {
  font-size: 1.1rem;
}

/* --- Sidebar (drawer) --- */
.sp-sidebar {
  position: fixed;
  top: 0;
  left: -260px;
  width: 260px;
  height: 100%;
  background: #111;
  color: #fff;
  z-index: 60;
  display: flex;
  flex-direction: column;
  transition: left 0.3s ease;
  padding: 1rem;
}
.sp-drawer-open .sp-sidebar {
  left: 0;
}

.sp-sidebar__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.sp-sidebar .sp-close {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: #fff;
  cursor: pointer;
}

.sp-nav {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sp-nav a {
  color: #aaa;
  text-decoration: none;
  font-size: 1rem;
}
.sp-nav a:hover {
  color: #fff;
}
.sp-nav a.is-active {
  color: limegreen;
  font-weight: 600;
}

/* --- Overlay --- */
.sp-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 55;
  display: none;
}
.sp-drawer-open .sp-overlay {
  display: block;
}

/* --- Search panel --- */
.sp-search-panel {
  position: absolute;
  top: 56px; /* below header */
  left: 0;
  right: 0;
  background: #1a1a1a;
  z-index: 49;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.sp-search-panel.hidden {
  display: none;
}

/* Optional animation */
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slide {
  animation: slideDown 0.25s ease forwards;
}

/* --- Actions (search + burger) --- */
.sp-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* space between magnifying glass + burger */
}

.sp-icon-btn,
.sp-burger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: transparent;
  color: white;
  cursor: pointer;
}
.sp-icon-btn:hover,
.sp-burger:hover {
  background: rgba(255, 255, 255, 0.1);
}
