import { createClient } from "@supabase/supabase-js";

const runtimeEnv = globalThis.__ANIMA_ENV__ || {};
const url =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_PUBLIC_SUPABASE_URL ||
  runtimeEnv.SUPABASE_URL ||
  "";
const anon =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY ||
  runtimeEnv.SUPABASE_ANON_KEY ||
  "";

const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder-anon-key";

export const supabase = createClient(url || PLACEHOLDER_URL, anon || PLACEHOLDER_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export function isSupabaseConfigured() {
  return Boolean(url && anon);
}
