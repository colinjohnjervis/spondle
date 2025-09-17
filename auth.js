// auth.js
import { supabase } from './supabaseClient.js';

export async function signInWithEmail(email) {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/account.html`
      }
    });

    if (error) {
      throw error;
    }

    alert("✅ Check your inbox for the magic link.");
  } catch (err) {
    alert("❌ " + err.message);
  }
}

// Toggle UI behavior
document.addEventListener("DOMContentLoaded", () => {
  let isCreatingAccount = false;

  const title = document.getElementById("form-title");
  const button = document.getElementById("submit-button");
  const toggleLink = document.getElementById("toggle-link");
  const toggleText = document.getElementById("toggle-text");
  const message = document.getElementById("message");
  const emailInput = document.getElementById("email");

  const updateUI = () => {
    title.textContent = isCreatingAccount ? "Create account" : "Sign in";
    button.textContent = isCreatingAccount ? "Create account" : "Send magic link";
    toggleText.textContent = isCreatingAccount ? "Already have an account?" : "New here?";
    toggleLink.textContent = isCreatingAccount ? "Sign in" : "Create an account";
    message.textContent = "";
  };

  toggleLink?.addEventListener("click", (e) => {
    e.preventDefault();
    isCreatingAccount = !isCreatingAccount;
    updateUI();
  });

  button?.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = emailInput?.value?.trim();
    if (!email) {
      message.textContent = "Please enter your email.";
      return;
    }
    message.textContent = isCreatingAccount ? "Creating account..." : "Sending magic link...";
    await signInWithEmail(email);
  });
});
