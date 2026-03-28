import { createClient } from '@supabase/supabase-js'

// 1. Core Data Sync Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://hvmgxmopyzslenzyzjdg.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2bWd4bW9weXpzbGVuenl6amRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MTQ0MzUsImV4cCI6MjA5MDE5MDQzNX0.axJZsxHdRhtW4k9ggZ5IhwlIkYLszuSDdYrUk_CIbZM";

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn("⚠️ AURA CONFIG: Missing Vercel Environment Variables! The app is using a fallback to prevent a crash.");
}

console.log("🛠️ AURA DEBUG: Core URL:", supabaseUrl);
console.log("🛠️ AURA DEBUG: Auth URL:", authUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAuth = createClient(authUrl, authKey);
