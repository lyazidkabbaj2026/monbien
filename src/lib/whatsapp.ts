import { site } from "../../site.config";

/** Lien wa.me avec message français pré-rempli. */
export function waLink(text: string): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export const waMessages = {
  generic: `Bonjour ${site.brandName}, je souhaite être accompagné(e) pour un projet immobilier.`,
  listing: (title: string, ref: string) =>
    `Bonjour ${site.brandName}, je suis intéressé(e) par l'annonce « ${title} » (réf. ${ref}). Est-elle toujours disponible ?`,
  valuation: `Bonjour ${site.brandName}, je viens d'estimer mon bien sur votre site et j'aimerais en discuter avec un conseiller.`,
  simulator: `Bonjour ${site.brandName}, je viens d'utiliser votre simulateur de crédit et j'aimerais recevoir des offres de financement personnalisées.`,
  priceMap: (city: string) =>
    `Bonjour ${site.brandName}, je consulte la carte des prix de ${city} et j'aimerais recevoir le rapport complet du marché.`,
  afterLead: (name: string) =>
    `Bonjour ${site.brandName}, je suis ${name}, je viens de laisser mes coordonnées sur votre site.`,
};
