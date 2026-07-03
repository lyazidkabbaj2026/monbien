import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Client anonyme sans session — pour toutes les lectures publiques (pages
// statiques/ISR) et les RPC d'écriture SECURITY DEFINER côté serveur.
let client: SupabaseClient | null = null;

export function supabasePublic(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return client;
}
