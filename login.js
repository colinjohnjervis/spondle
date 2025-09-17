// login.js
import { signInWithEmail } from './auth.js';

const form = document.getElementById("auth-form");
const emailInput = document.getElementById("email");
const message = document.getElementById("message");
const title = document.getElementById("form-title");
const submitButton = document.getElementById("submit-button");
const toggleLink = document.getElementById("toggle-link");

let isCreatingAccount = false;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  if (!email) {
    message.textContent = "Please enter your email.";
    return;
  }

  message.textContent = isCreatingAccount ? "Creating account..." : "Sending magic link...";
  try {
    await signInWithEmail(email);
    message.textContent = isCreatingAccount
      ? "✅ Account created! Check your inbox to finish setup."
      : "✅ Check your inbox for the magic link.";
  } catch (err) {
    console.error(err);
    message.textContent = "❌ There was a problem. Please try again.";
  }
});

// ✅ GLOBAL toggleForm function so it's accessible
window.toggleForm = function () {
  alert("✅ toggleForm triggered");
  isCreatingAccount = !isCreatingAccount;
  title.textContent = isCreatingAccount ? "Create account" : "Sign in";
  submitButton.textContent = isCreatingAccount ? "Create account" : "Send magic link";
  toggleLink.innerHTML = isCreatingAccount
    ? `Already have an account? <a href="#" onclick="toggleForm()" class="underline">Sign in</a>`
    : `New here? <a href="#" onclick="toggleForm()" class="underline">Create an account</a>`;
  message.textContent = "";
};
