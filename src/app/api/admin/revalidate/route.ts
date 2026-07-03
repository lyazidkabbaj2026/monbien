import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

/** Revalidation ISR après création/édition d'annonce depuis /admin. */
export async function POST(request: Request) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { slugs?: unknown };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const paths = ["/", "/annonces", "/sitemap.xml"];
  if (Array.isArray(body.slugs)) {
    for (const slug of body.slugs) {
      if (typeof slug === "string" && /^[a-z0-9-]+$/.test(slug)) {
        paths.push(`/annonces/${slug}`);
      }
    }
  }
  paths.forEach((path) => revalidatePath(path));

  return NextResponse.json({ ok: true, revalidated: paths });
}
