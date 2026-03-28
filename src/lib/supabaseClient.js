import { createClient } from '@supabase/supabase-js'

// 1. Core Data Sync Client (Reads massive 168hr forecasts mapped directly by the Officer Dashboard)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("🚩 AURA ERROR: Core Data Keys are MISSING from Vercel! Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.")
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder_key'
)

// 2. Mathematically Isolated Authenticator (Separates Tourist Consumer PII from Official Intelligence DBs)
const authUrl = import.meta.env.VITE_TOURIST_AUTH_URL
const authKey = import.meta.env.VITE_TOURIST_AUTH_KEY

if (!authUrl || !authKey) {
  console.error("🚩 AURA ERROR: Tourist Auth Keys are MISSING from Vercel! Check VITE_TOURIST_AUTH_URL and VITE_TOURIST_AUTH_KEY.")
}

export const supabaseAuth = createClient(
  authUrl || 'https://rhlskcsojcpgicpnkvfr.supabase.co', 
  authKey || 'placeholder_key'
);
