import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

// Chemins revalidables depuis l'admin (préfixes autorisés).
const ALLOWED_PREFIXES = [
  "/annonces",
  "/prix-immobilier",
  "/quartiers",
  "/immobilier",
];
const SAFE_PATH = /^\/[a-z0-9/-]*$/;

/** Revalidation ISR après une écriture depuis /admin. */
export async function POST(request: Request) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { slugs?: unknown; paths?: unknown };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const paths = new Set<string>(["/", "/annonces", "/sitemap.xml"]);

  // Rétro-compatibilité : slugs d'annonces
  if (Array.isArray(body.slugs)) {
    for (const slug of body.slugs) {
      if (typeof slug === "string" && /^[a-z0-9-]+$/.test(slug)) {
        paths.add(`/annonces/${slug}`);
      }
    }
  }
  // Chemins explicites (éditeur de prix, quartiers…)
  if (Array.isArray(body.paths)) {
    for (const path of body.paths) {
      if (
        typeof path === "string" &&
        SAFE_PATH.test(path) &&
        ALLOWED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
      ) {
        paths.add(path);
      }
    }
  }

  paths.forEach((path) => revalidatePath(path));
  return NextResponse.json({ ok: true, revalidated: [...paths] });
}
