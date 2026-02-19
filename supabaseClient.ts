import { createClient } from '@supabase/supabase-js';

// NOTE: In a real deployment, these should be in .env files
// For this demo generator, users must provide their own keys or the app uses mock data if connection fails.
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);