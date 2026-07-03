"use client";

import { createBrowserClient } from "@supabase/ssr";

// Client navigateur — utilisé uniquement par /admin (login + mises à jour).
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
