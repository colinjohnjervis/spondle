// auth.js
import { supabase } from './supabaseClient.js';

// --- SIGN IN WITH MAGIC LINK ---
export async function signInWithEmail(email) {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + "/account.html", // Redirect after login
      },
    });

    if (error) {
      console.error("Magic link error:", error.message);
      alert("❌ " + error.message);
    } else {
      alert("✅ Magic link sent! Please check your email.");
    }
  } catch (err) {
    console.error("Unexpected error:", err.message);
    alert("❌ Unexpected error: " + err.message);
  }
}

// --- SIGN OUT USER ---
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Sign out error:", error.message);
    alert("❌ Error signing out: " + error.message);
  } else {
    alert("✅ Signed out!");
  }
}

// --- GET CURRENT USER ---
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Get user error:", error.message);
    return null;
  }
  return data?.user || null;
}
