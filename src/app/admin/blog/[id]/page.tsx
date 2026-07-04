import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import type { BlogPost } from "@/lib/types";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Modifier un article",
  description: "Espace propriétaire.",
  path: "/admin/blog",
  noindex: true,
});

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!post) notFound();

  return (
    <div className="wrap max-w-3xl py-8">
      <h1 className="font-display mb-6 text-2xl font-bold text-ink">
        Modifier l&apos;article
      </h1>
      <BlogPostForm initial={post as BlogPost} />
    </div>
  );
}
