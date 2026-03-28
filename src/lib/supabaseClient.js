import { createClient } from '@supabase/supabase-js'

// 1. Core Data Sync Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://hvmgxmopyzslenzyzjdg.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2bWd4bW9weXpzbGVuenl6amRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MTQ0MzUsImV4cCI6MjA5MDE5MDQzNX0.axJZsxHdRhtW4k9ggZ5IhwlIkYLszuSDdYrUk_CIbZM";

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn("⚠️ AURA CONFIG: Missing Vercel Environment Variables! The app is using a fallback to prevent a crash.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Mathematically Isolated Authenticator
const authUrl = import.meta.env.VITE_TOURIST_AUTH_URL || "https://rhlskcsojcpgicpnkvfr.supabase.co";
const authKey = import.meta.env.VITE_TOURIST_AUTH_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJobHNrY3NvamNwZ2ljcG5rdmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MzA3NTEsImV4cCI6MjA5MDIwNjc1MX0.3ssetPBHwQcNaDrOnytG3d8Bh_9wjRpZTQRyvYEOIgc";

export const supabaseAuth = createClient(authUrl, authKey);
