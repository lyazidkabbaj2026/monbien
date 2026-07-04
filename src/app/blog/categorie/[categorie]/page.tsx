import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { site } from "../../../../../site.config";
import { getBlogCategories, getPublishedPosts } from "@/lib/data";
import { slugify } from "@/lib/format";
import { ogCard, pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BlogPostCard } from "@/components/BlogPostCard";

export const revalidate = 900;
export const dynamicParams = true;

async function resolveCategory(slug: string): Promise<string | null> {
  const categories = await getBlogCategories();
  return categories.find((cat) => slugify(cat) === slug) ?? null;
}

export async function generateStaticParams() {
  const categories = await getBlogCategories();
  return categories.map((cat) => ({ categorie: slugify(cat) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorie: string }>;
}): Promise<Metadata> {
  const { categorie } = await params;
  const category = await resolveCategory(categorie);
  if (!category) return { title: "Catégorie introuvable" };
  return pageMetadata({
    title: `${category} — blog immobilier ${site.defaultCity}`,
    description: `Tous nos articles « ${category} » : conseils d'expert et données du marché immobilier marocain.`,
    path: `/blog/categorie/${categorie}`,
    image: ogCard(`Blog — ${category}`, "Conseils d'expert et données du marché immobilier marocain.", "Blog"),
  });
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ categorie: string }>;
}) {
  const { categorie } = await params;
  const [category, categories] = await Promise.all([
    resolveCategory(categorie),
    getBlogCategories(),
  ]);
  if (!category) notFound();

  const posts = await getPublishedPosts(category);

  return (
    <div className="wrap py-8 sm:py-12">
      <Breadcrumbs
        items={[
          { name: "Accueil", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: category, path: `/blog/categorie/${categorie}` },
        ]}
      />
      <div className="mt-4 max-w-2xl">
        <p className="kicker">Catégorie</p>
        <h1 className="h-display !text-3xl sm:!text-4xl">{category}</h1>
        <p className="mt-3 text-[15.5px] text-ink/65">
          {posts.length} article{posts.length > 1 ? "s" : ""} pour décider avec des
          données, pas au feeling.
        </p>
      </div>

      <nav aria-label="Catégories" className="mt-7 flex flex-wrap gap-2">
        <Link
          href="/blog"
          className="rounded-full border border-line bg-white px-4 py-2 text-[13.5px] font-semibold text-ink/70 transition hover:border-primary hover:text-primary"
        >
          Tous
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/blog/categorie/${slugify(cat)}`}
            className={`rounded-full px-4 py-2 text-[13.5px] font-semibold transition ${
              cat === category
                ? "bg-primary text-white"
                : "border border-line bg-white text-ink/70 hover:border-primary hover:text-primary"
            }`}
          >
            {cat}
          </Link>
        ))}
      </nav>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
