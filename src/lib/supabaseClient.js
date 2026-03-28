import { createClient } from '@supabase/supabase-js'

// 1. Core Data Sync Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://missing-url.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "missing-key";

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn("⚠️ AURA CONFIG: Missing Vercel Environment Variables! The app is using a fallback to prevent a crash.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Mathematically Isolated Authenticator
const authUrl = import.meta.env.VITE_TOURIST_AUTH_URL || "https://missing-auth.supabase.co";
const authKey = import.meta.env.VITE_TOURIST_AUTH_KEY || "missing-key";

export const supabaseAuth = createClient(authUrl, authKey);
