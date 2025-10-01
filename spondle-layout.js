/* spondle-layout.css */

/* --- Header --- */
.sp-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #111827; /* dark bg */
  border-bottom: 1px solid #1f2937;
}

.sp-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
}

/* Logo */
.sp-logo {
  display: flex;
  align-items: center;
  font-weight: bold;
  color: white;
  text-decoration: none;
}
.sp-logo__dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  background: #22c55e;
  border-radius: 50%;
  margin-right: 6px;
}
.sp-logo__text {
  font-size: 1.1rem;
}

/* Actions (search + burger) */
.sp-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* space between buttons */
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

/* --- Sidebar + Overlay --- */
.sp-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 40;
  display: none;
}
.sp-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 260px;
  background: #1f2937;
  z-index: 50;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}
.sp-sidebar__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #374151;
  color: white;
}
.sp-nav {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}
.sp-nav a {
  color: #d1d5db;
  text-decoration: none;
  margin-bottom: 0.75rem;
}
.sp-nav a:hover {
  color: white;
}
.sp-nav .is-active {
  color: #22c55e;
  font-weight: 600;
}

.sp-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.25rem;
}

/* Drawer open */
body.sp-drawer-open .sp-overlay {
  display: block;
}
body.sp-drawer-open .sp-sidebar {
  transform: translateX(0);
}

/* --- Search Panel --- */
.sp-search-panel {
  position: fixed;
  top: 56px; /* directly below header */
  left: 0;
  right: 0;
  background: #111827;
  z-index: 45;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}
.sp-search-panel.animate-slide {
  max-height: 300px; /* enough to show form */
}

/* Forms inside search */
.sp-search-panel form label {
  color: #9ca3af;
}
