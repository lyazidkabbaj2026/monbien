import Image from "next/image";
import Link from "next/link";
import { site } from "../../../site.config";
import { getBlogCategories, getPublishedPosts } from "@/lib/data";
import { formatDate, readingTimeMinutes, slugify } from "@/lib/format";
import { IMG_BLUR } from "@/lib/image";
import { ogCard, pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BlogPostCard } from "@/components/BlogPostCard";

export const revalidate = 900;

export const metadata = pageMetadata({
  title: `Blog immobilier — conseils, prix et actualités du marché à ${site.defaultCity}`,
  description: `Guides pratiques, analyses de prix et conseils d'expert pour acheter, vendre ou louer à ${site.defaultCity} et au Maroc.`,
  path: "/blog",
  image: ogCard(
    "Le blog de l'immobilier marocain",
    "Prix, quartiers, financement, démarches : décidez avec des données.",
    "Blog"
  ),
});

export default async function BlogIndexPage() {
  const [posts, categories] = await Promise.all([
    getPublishedPosts(),
    getBlogCategories(),
  ]);
  const [featured, ...rest] = posts;

  return (
    <div className="wrap py-8 sm:py-12">
      <Breadcrumbs
        items={[
          { name: "Accueil", path: "/" },
          { name: "Blog", path: "/blog" },
        ]}
      />
      <div className="mt-4 max-w-2xl">
        <p className="kicker">Guides &amp; analyses</p>
        <h1 className="h-display !text-3xl sm:!text-4xl">
          Le blog de l&apos;immobilier marocain
        </h1>
        <p className="mt-3 text-[15.5px] text-ink/65">
          Prix, quartiers, financement, démarches : tout pour décider avec des
          données, pas au feeling.
        </p>
      </div>

      {/* Catégories (pages statiques dédiées) */}
      {categories.length > 0 && (
        <nav aria-label="Catégories" className="mt-7 flex flex-wrap gap-2">
          <span className="rounded-full bg-primary px-4 py-2 text-[13.5px] font-semibold text-white">
            Tous
          </span>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/blog/categorie/${slugify(cat)}`}
              className="rounded-full border border-line bg-white px-4 py-2 text-[13.5px] font-semibold text-ink/70 transition hover:border-primary hover:text-primary"
            >
              {cat}
            </Link>
          ))}
        </nav>
      )}

      {posts.length === 0 && (
        <p className="card mt-8 p-8 text-center text-[15px] text-ink/60">
          Les premiers articles arrivent très vite.
        </p>
      )}

      {/* Article à la une */}
      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="card group mt-8 grid overflow-hidden lg:grid-cols-[1.2fr_1fr]"
        >
          {featured.hero_image && (
            <div className="relative aspect-[16/9] overflow-hidden bg-sand-deep lg:aspect-auto lg:min-h-[320px]">
              <Image
                src={featured.hero_image}
                alt={featured.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                placeholder="blur"
                blurDataURL={IMG_BLUR}
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            </div>
          )}
          <div className="flex flex-col justify-center p-6 sm:p-9">
            <p className="text-[12.5px] font-bold tracking-wide text-accent uppercase">
              {featured.category ?? "Conseils"} · À la une
            </p>
            <h2 className="font-display mt-3 text-xl leading-snug font-bold text-ink group-hover:text-primary sm:text-2xl">
              {featured.title}
            </h2>
            {featured.meta_description && (
              <p className="mt-3 line-clamp-3 text-[14.5px] leading-relaxed text-ink/65">
                {featured.meta_description}
              </p>
            )}
            <p className="mt-4 text-[13px] text-ink/50">
              {featured.published_at ? formatDate(featured.published_at) : ""} ·{" "}
              {readingTimeMinutes(featured.body_md)} min de lecture
            </p>
          </div>
        </Link>
      )}

      {/* Grille */}
      {rest.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
