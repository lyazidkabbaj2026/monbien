import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Nouvel article",
  description: "Espace propriétaire.",
  path: "/admin/blog/nouveau",
  noindex: true,
});

export default async function NewBlogPostPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="wrap max-w-3xl py-8">
      <h1 className="font-display mb-6 text-2xl font-bold text-ink">Nouvel article</h1>
      <BlogPostForm />
    </div>
  );
}
