import type { Transaction } from "./types";

const nf = new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 });

/** 1850000 -> "1 850 000 MAD" */
export function formatPrice(value: number, currency = "MAD"): string {
  return `${nf.format(value)} ${currency}`;
}

/** Prix avec suffixe location. */
export function formatListingPrice(
  value: number,
  transaction: Transaction,
  currency = "MAD"
): string {
  return transaction === "location"
    ? `${nf.format(value)} ${currency}/mois`
    : `${nf.format(value)} ${currency}`;
}

export function formatPricePerM2(value: number, transaction: Transaction): string {
  return transaction === "location"
    ? `${nf.format(value)} MAD/m²/mois`
    : `${nf.format(value)} MAD/m²`;
}

export function formatNumber(value: number): string {
  return nf.format(value);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** "Appartements à vendre à Rabat" -> "appartements-a-vendre-a-rabat" */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

/** Temps de lecture d'un markdown, en minutes (≥1). */
export function readingTimeMinutes(markdown: string): number {
  const words = markdown.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
