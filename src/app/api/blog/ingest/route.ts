import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabasePublic } from "@/lib/supabase/public";
import { slugify } from "@/lib/format";

/**
 * POST /api/blog/ingest — publication automatisée d'articles (voir AUTOMATION.md).
 *
 * Auth   : Authorization: Bearer <BLOG_INGEST_TOKEN>
 * Body   : { title, body_md, meta_description?, category?, tags?, hero_image?, author?, slug? }
 * Effet  : upsert d'un blog_posts publié + revalidation ISR de /blog, /blog/[slug],
 *          / (dernier articles) et /sitemap.xml.
 */
export async function POST(request: Request) {
  const token = process.env.BLOG_INGEST_TOKEN;
  const auth = request.headers.get("authorization") ?? "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (!token || !provided || provided !== token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  const bodyMd = String(body.body_md ?? "").trim();
  if (!title || !bodyMd) {
    return NextResponse.json(
      { error: "title and body_md are required" },
      { status: 400 }
    );
  }

  const slug =
    typeof body.slug === "string" && body.slug.trim()
      ? slugify(body.slug)
      : slugify(title);

  const tags = Array.isArray(body.tags) ? body.tags.map(String) : [];

  const { data, error } = await supabasePublic().rpc("ingest_blog_post", {
    p_secret: provided,
    p_slug: slug,
    p_title: title,
    p_body_md: bodyMd,
    p_meta_description:
      typeof body.meta_description === "string" ? body.meta_description : null,
    p_category: typeof body.category === "string" ? body.category : null,
    p_tags: tags,
    p_hero_image: typeof body.hero_image === "string" ? body.hero_image : null,
    p_author: typeof body.author === "string" ? body.author : null,
  });

  if (error) {
    console.error("[api/blog/ingest]", error);
    const unauthorized = error.message.includes("invalid ingest token");
    return NextResponse.json(
      { error: unauthorized ? "unauthorized (db token mismatch)" : "insert failed" },
      { status: unauthorized ? 401 : 500 }
    );
  }

  // Publication instantanée sans redéploiement
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/");
  revalidatePath("/sitemap.xml");

  return NextResponse.json({
    ok: true,
    id: data,
    slug,
    url: `/blog/${slug}`,
    revalidated: ["/blog", `/blog/${slug}`, "/", "/sitemap.xml"],
  });
}
