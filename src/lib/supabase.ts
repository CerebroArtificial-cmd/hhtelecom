import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export const isSupabaseConfigured = Boolean(url && anonKey);

export function getSupabase(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error("Supabase nao configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  if (!client) {
    client = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
  }
  return client;
}
