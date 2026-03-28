import { createClient } from '@supabase/supabase-js'

// 1. Core Data Sync Client (Reads massive 168hr forecasts mapped directly by the Officer Dashboard)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 2. Mathematically Isolated Authenticator (Separates Tourist Consumer PII from Official Intelligence DBs)
const authUrl = import.meta.env.VITE_TOURIST_AUTH_URL || 'https://rhlskcsojcpgicpnkvfr.supabase.co'
const authKey = import.meta.env.VITE_TOURIST_AUTH_KEY || 'placeholder_key'
export const supabaseAuth = createClient(authUrl, authKey);
