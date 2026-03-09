import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_ANON_KEY || import.meta.env.VITE_API_KEY
const supabaseRoleKey = import.meta.env.VITE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing: VITE_SUPABASE_URL and VITE_ANON_KEY (or VITE_API_KEY) must be set in .env')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// Note: service role client should be used sparingly and carefully on frontend
export const supabaseAdmin = supabaseRoleKey ? createClient(supabaseUrl, supabaseRoleKey) : supabase
