// auth.js — super-light client auth + favourites (prototype only)

const LS_KEYS = {
  USERS: 'spondle_users',         // [{id,email,name,password}]
  SESSION: 'spondle_session',     // { userId }
  FAVES: 'spondle_faves'          // { [userId]: [eventId, ...] }
};

function _read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function _write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

const SpondleAuth = {
  currentUser() {
    const session = _read(LS_KEYS.SESSION, null);
    if (!session) return null;
    const users = _read(LS_KEYS.USERS, []);
    return users.find(u => u.id === session.userId) || null;
  },
  signup({ name, email, password }) {
    email = String(email || '').trim().toLowerCase();
    if (!email || !password) throw new Error('Email and password are required.');
    const users = _read(LS_KEYS.USERS, []);
    if (users.some(u => u.email === email)) throw new Error('That email is already registered.');
    const id = 'u_' + Math.random().toString(36).slice(2, 10);
    const user = { id, name: name?.trim() || email.split('@')[0], email, password: String(password) };
    users.push(user); _write(LS_KEYS.USERS, users);
    _write(LS_KEYS.SESSION, { userId: id });
    return user;
  },
  login({ email, password }) {
    email = String(email || '').trim().toLowerCase();
    const users = _read(LS_KEYS.USERS, []);
    const user = users.find(u => u.email === email && u.password === String(password));
    if (!user) throw new Error('Invalid email or password.');
    _write(LS_KEYS.SESSION, { userId: user.id });
    return user;
  },
  logout() { localStorage.removeItem(LS_KEYS.SESSION); },

  // Favourites
  toggleFavourite(eventId) {
    const user = this.currentUser(); if (!user) throw new Error('Not signed in');
    const all = _read(LS_KEYS.FAVES, {});
    const set = new Set(all[user.id] || []);
    set.has(eventId) ? set.delete(eventId) : set.add(eventId);
    all[user.id] = Array.from(set);
    _write(LS_KEYS.FAVES, all);
    return all[user.id];
  },
  isFavourite(eventId) {
    const user = this.currentUser(); if (!user) return false;
    const all = _read(LS_KEYS.FAVES, {});
    return (all[user.id] || []).includes(eventId);
  },
  listFavourites() {
    const user = this.currentUser(); if (!user) return [];
    const all = _read(LS_KEYS.FAVES, {});
    return all[user.id] || [];
  }
};

window.SpondleAuth = SpondleAuth;
