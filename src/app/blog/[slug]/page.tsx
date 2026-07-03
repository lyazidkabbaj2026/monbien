import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { marked } from "marked";
import { ArrowRight } from "lucide-react";
import { site } from "../../../../site.config";
import { getPostBySlug, getPublishedPosts } from "@/lib/data";
import { formatDate, readingTimeMinutes } from "@/lib/format";
import { articleJsonLd, pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 900;
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article introuvable" };
  return pageMetadata({
    title: post.title,
    description: post.meta_description ?? post.title,
    path: `/blog/${post.slug}`,
    image: post.hero_image ?? undefined,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const html = await marked.parse(post.body_md);
  const related = (await getPublishedPosts(post.category ?? undefined))
    .filter((p) => p.id !== post.id)
    .slice(0, 3);

  return (
    <article className="wrap py-8 sm:py-12">
      <JsonLd data={articleJsonLd(post)} />
      <div className="mx-auto max-w-3xl">
        <Breadcrumbs
          items={[
            { name: "Accueil", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]}
        />
        <header className="mt-6">
          <p className="text-[13px] font-bold tracking-wide text-accent uppercase">
            {post.category ?? "Conseils"}
          </p>
          <h1 className="h-display mt-3 !text-[28px] sm:!text-4xl">{post.title}</h1>
          <p className="mt-4 text-[13.5px] text-ink/55">
            Par {post.author ?? site.brandName}
            {post.published_at ? ` · ${formatDate(post.published_at)}` : ""} ·{" "}
            {readingTimeMinutes(post.body_md)} min de lecture
          </p>
        </header>

        {post.hero_image && (
          <div className="relative mt-7 aspect-[16/9] overflow-hidden rounded-3xl bg-sand-deep">
            <Image
              src={post.hero_image}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        <div
          className="prose-blog mt-8"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* CTA contextuelle */}
        <aside className="dark-surface mt-12 rounded-3xl p-7 text-white sm:p-9">
          <h2 className="font-display text-xl font-bold sm:text-2xl">
            Et votre bien, combien vaut-il ?
          </h2>
          <p className="mt-2 max-w-lg text-[14.5px] text-white/75">
            Estimation gratuite en 2 minutes, basée sur les prix réels de votre
            quartier à {site.defaultCity}.
          </p>
          <Link href="/estimer-mon-bien" className="btn-accent mt-5">
            Estimer mon bien
            <ArrowRight className="h-4.5 w-4.5" aria-hidden />
          </Link>
        </aside>

        {/* Articles liés */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="h-section !text-xl">À lire ensuite</h2>
            <ul className="mt-5 space-y-4">
              {related.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="group flex items-baseline justify-between gap-4 border-b border-line pb-4"
                  >
                    <span className="text-[15.5px] font-semibold text-ink group-hover:text-primary">
                      {p.title}
                    </span>
                    <span className="shrink-0 text-[12.5px] text-ink/45">
                      {readingTimeMinutes(p.body_md)} min
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
