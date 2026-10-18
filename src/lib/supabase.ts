import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://jrpztujkmhkfwqxnpmma.supabase.co"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_MVCPTI10lI5s8e4T4DJw8g_dqArcjvn"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

/**
 * Checks if Supabase connection is active and responsive
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from("courses").select("id").limit(1)
    return !error
  } catch {
    return false
  }
}
