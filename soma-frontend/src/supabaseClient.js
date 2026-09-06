import { createClient } from '@supabase/supabase-js'

// These values are loaded from your .env file
// In Vite, all env variables must start with VITE_ to be accessible in the browser
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
