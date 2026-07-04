import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import type { BlogPost } from "@/lib/types";
import { formatDate, readingTimeMinutes } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Gestion du blog",
  description: "Espace propriétaire.",
  path: "/admin/blog",
  noindex: true,
});

export default async function AdminBlogPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: true });
  const posts = (data as BlogPost[]) ?? [];

  return (
    <div className="wrap py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Blog</h1>
          <p className="mt-1 text-[13.5px] text-ink/55">
            {posts.length} article{posts.length > 1 ? "s" : ""} ·{" "}
            {posts.filter((p) => p.status === "published").length} publié
            {posts.filter((p) => p.status === "published").length > 1 ? "s" : ""} — la
            routine quotidienne publie à 07:30, vous gardez la main ici.
          </p>
        </div>
        <Link href="/admin/blog/nouveau" className="btn-accent !px-5 !py-2.5 text-[14px]">
          <Plus className="h-4.5 w-4.5" aria-hidden />
          Nouvel article
        </Link>
      </div>

      <div className="card mt-6 divide-y divide-line/70">
        {posts.length === 0 && (
          <p className="px-5 py-10 text-center text-[14px] text-ink/50">
            Aucun article pour le moment.
          </p>
        )}
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/admin/blog/${post.id}`}
            className="flex items-center gap-4 px-4 py-3.5 transition hover:bg-sand"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14.5px] font-bold text-ink">{post.title}</p>
              <p className="mt-0.5 text-[12.5px] text-ink/55">
                {post.category ?? "—"} ·{" "}
                {post.published_at ? formatDate(post.published_at) : "non publié"} ·{" "}
                {readingTimeMinutes(post.body_md)} min · /blog/{post.slug}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-bold ${
                post.status === "published"
                  ? "bg-green-600/10 text-green-700"
                  : "bg-ink/8 text-ink/55"
              }`}
            >
              {post.status === "published" ? "Publié" : "Brouillon"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
