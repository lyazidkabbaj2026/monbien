import type { MetadataRoute } from "next";
import {
  getActiveListingSlugs,
  getAllNeighborhoodsWithCity,
  getBlogCategories,
  getCities,
  getPublishedPosts,
} from "@/lib/data";
import { allCombos } from "@/lib/programmatic";
import { allPairs } from "@/lib/compare";
import { absoluteUrl } from "@/lib/seo";
import { slugify } from "@/lib/format";
import { getCityPriceData } from "@/lib/data";

export const revalidate = 21600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cities, hoods, listingSlugs, posts, categories] = await Promise.all([
    getCities(),
    getAllNeighborhoodsWithCity(),
    getActiveListingSlugs(),
    getPublishedPosts(),
    getBlogCategories(),
  ]);

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/annonces"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/vendre"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/estimer-mon-bien"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/avant-premiere"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/expatries"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/professionnels"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/simulateur-credit"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/capacite-emprunt"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/prix-immobilier"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: absoluteUrl("/mentions-legales"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/politique-de-confidentialite"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  for (const slug of listingSlugs) {
    entries.push({
      url: absoluteUrl(`/annonces/${slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const city of cities) {
    entries.push({
      url: absoluteUrl(`/prix-immobilier/${city.slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
    for (const { combo } of allCombos()) {
      entries.push({
        url: absoluteUrl(`/immobilier/${city.slug}/${combo}`),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  for (const hood of hoods) {
    entries.push({
      url: absoluteUrl(`/quartiers/${hood.city.slug}/${hood.slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Comparateurs de quartiers (paires d'une même ville avec données de prix)
  for (const city of cities) {
    const rows = await getCityPriceData(city.id);
    const slugsWithData = [
      ...new Set(
        rows
          .filter((r) => r.transaction === "vente" && r.property_type === "appartement")
          .map((r) => r.neighborhood.slug)
      ),
    ];
    for (const [a, b] of allPairs(slugsWithData)) {
      entries.push({
        url: absoluteUrl(`/comparer/${city.slug}/${a}-vs-${b}`),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }

  for (const category of categories) {
    entries.push({
      url: absoluteUrl(`/blog/categorie/${slugify(category)}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  for (const post of posts) {
    entries.push({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.updated_at ? new Date(post.updated_at) : now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
