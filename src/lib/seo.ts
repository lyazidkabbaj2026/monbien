import type { Metadata } from "next";
import { site } from "../../site.config";
import type { BlogPost, Listing } from "./types";
import { formatListingPrice } from "./format";

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (site.domain && `https://${site.domain}`) ||
    // Repli : domaine de production fourni par Vercel au build (ex. monbien.vercel.app)
    (process.env.VERCEL_PROJECT_PRODUCTION_URL &&
      `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/** URL d'une carte OG générée (/api/og) pour les pages sans photo. */
export function ogCard(title: string, subtitle?: string, badge?: string): string {
  const params = new URLSearchParams({ title });
  if (subtitle) params.set("subtitle", subtitle);
  if (badge) params.set("badge", badge);
  return `/api/og?${params.toString()}`;
}

/** Metadata de base : title/description/canonical/OG/Twitter en une ligne. */
export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
}): Metadata {
  const url = absoluteUrl(opts.path);
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    robots: opts.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: site.brandName,
      locale: "fr_MA",
      type: "website",
      images: opts.image ? [{ url: opts.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: opts.image ? [opts.image] : undefined,
    },
  };
}

// ------------------------------------------------------------------ JSON-LD

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: site.brandName,
    description: site.tagline,
    url: siteUrl(),
    email: site.contactEmail,
    telephone: `+${site.whatsappNumber}`,
    areaServed: { "@type": "City", name: site.defaultCity },
    address: {
      "@type": "PostalAddress",
      addressLocality: site.defaultCity,
      addressCountry: "MA",
    },
  };
}

export function listingJsonLd(listing: Listing) {
  const image = listing.images?.[0]?.url;
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    url: absoluteUrl(`/annonces/${listing.slug}`),
    description: listing.description?.slice(0, 300),
    image: image ? [image] : undefined,
    datePosted: listing.created_at,
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: listing.currency,
      availability: "https://schema.org/InStock",
      description: formatListingPrice(listing.price, listing.transaction),
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.city?.name ?? site.defaultCity,
      addressRegion: listing.neighborhood?.name,
      addressCountry: "MA",
    },
    floorSize: listing.area_m2
      ? { "@type": "QuantitativeValue", value: listing.area_m2, unitCode: "MTK" }
      : undefined,
    numberOfRooms: listing.rooms ?? undefined,
  };
}

export function articleJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description,
    image: post.hero_image ? [post.hero_image] : undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    inLanguage: "fr",
    author: { "@type": "Organization", name: post.author || site.brandName },
    publisher: { "@type": "Organization", name: site.brandName, url: siteUrl() },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
