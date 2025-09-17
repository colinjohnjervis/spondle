// logout.js
import { signOut } from './auth.js';

document.getElementById("logout-button").addEventListener("click", async () => {
  await signOut();
  window.location.href = "/login.html";
});
