// auth.js
import { supabase } from './supabaseClient.js'

// --- SIGN IN WITH MAGIC LINK ---
export async function signInWithEmail(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin, // Redirect back to site after login
    },
  })

  if (error) {
    console.error("Error sending magic link:", error.message)
    alert("Error sending magic link: " + error.message)
  } else {
    alert("Magic link sent! Please check your email.")
  }
}

// --- SIGN OUT USER ---
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error("Error signing out:", error.message)
    alert("Error signing out: " + error.message)
  } else {
    alert("Signed out!")
  }
}

// --- GET CURRENT USER ---
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) console.error("Error fetching user:", error.message)
  return user
}
