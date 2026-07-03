import { propertyTypes, transactions } from "../../site.config";
import type { TransactionSlug } from "../../site.config";

export interface ComboParts {
  typeSlug: string;
  typeLabel: string;
  typePlural: string;
  transaction: TransactionSlug;
  transactionVerb: string; // "à vendre" | "à louer"
}

/** "appartement-a-vendre" -> { type, transaction } — null si combo inconnu. */
export function parseCombo(combo: string): ComboParts | null {
  const match = combo.match(/^(.+)-a-(vendre|louer)$/);
  if (!match) return null;
  const type = propertyTypes.find((t) => t.slug === match[1]);
  if (!type) return null;
  const transaction: TransactionSlug = match[2] === "vendre" ? "vente" : "location";
  const t = transactions.find((tr) => tr.slug === transaction)!;
  return {
    typeSlug: type.slug,
    typeLabel: type.label,
    typePlural: type.plural,
    transaction,
    transactionVerb: t.verb,
  };
}

export function comboSlug(typeSlug: string, transaction: TransactionSlug): string {
  return `${typeSlug}-a-${transaction === "vente" ? "vendre" : "louer"}`;
}

/** Toutes les combinaisons type × transaction (pour generateStaticParams et le sitemap). */
export function allCombos(): { combo: string; parts: ComboParts }[] {
  const result: { combo: string; parts: ComboParts }[] = [];
  for (const type of propertyTypes) {
    for (const t of transactions) {
      const combo = comboSlug(type.slug, t.slug);
      result.push({ combo, parts: parseCombo(combo)! });
    }
  }
  return result;
}
