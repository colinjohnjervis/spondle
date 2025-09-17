// logout.js
import { signOut } from './auth.js';

document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      await signOut();
      window.location.href = "/login.html";
    });
  }
});
