// Source de vérité unique pour tout ce que le propriétaire ajuste.
// Rebrander le site = changer brandName (et le logo dans src/components/Logo.tsx).

export const site = {
  brandName: "MonBien",
  tagline: "L'immobilier à Rabat, en toute confiance",
  domain: "", // ex. "www.monbien.ma" — laisser vide tant que le domaine n'est pas acheté
  whatsappNumber: "2126XXXXXXXX", // format international, sans +
  contactEmail: "leads@example.ma",
  defaultCity: "Rabat",
  defaultCitySlug: "rabat",
  locale: "fr",

  // Palette (reflétée dans src/app/globals.css via les variables --color-*)
  colors: {
    primary: "#0F4C5C",
    accent: "#E36414",
    ink: "#14181B",
    sand: "#F6F4EF",
  },

  // Signaux de confiance affichés près des formulaires / sections preuve sociale
  agent: {
    name: "Yazid K.",
    role: "Fondateur & conseiller immobilier",
    photo: "/agent.jpg", // remplacer par une vraie photo dans /public
    responseTime: "Réponse sous 15 min",
    phoneDisplay: "+212 6XX XX XX XX",
  },
  proof: {
    yearsExperience: 8,
    propertiesSold: 120,
    cityFocus: "Rabat",
  },
  testimonials: [
    {
      name: "Salma B.",
      city: "Agdal, Rabat",
      text: "Estimation reçue en quelques minutes, appartement vendu en 3 semaines au prix estimé. Un accompagnement sérieux du début à la fin.",
    },
    {
      name: "Karim E.",
      city: "Hay Riad, Rabat",
      text: "Enfin une agence qui répond sur WhatsApp en quelques minutes. Visites bien préparées, négociation efficace.",
    },
    {
      name: "Nadia T.",
      city: "Hassan, Rabat",
      text: "La carte des prix m'a évité de surpayer. Conseils honnêtes, même quand ça ne les arrangeait pas.",
    },
  ],
} as const;

// Types de biens gérés par le moteur SEO programmatique et les formulaires.
export const propertyTypes = [
  { slug: "appartement", label: "Appartement", plural: "Appartements" },
  { slug: "maison", label: "Maison", plural: "Maisons" },
  { slug: "villa", label: "Villa", plural: "Villas" },
  { slug: "riad", label: "Riad", plural: "Riads" },
  { slug: "bureau", label: "Bureau", plural: "Bureaux" },
  { slug: "terrain", label: "Terrain", plural: "Terrains" },
] as const;

export const transactions = [
  { slug: "vente", label: "Vente", verb: "à vendre", action: "Acheter" },
  { slug: "location", label: "Location", verb: "à louer", action: "Louer" },
] as const;

export type PropertyTypeSlug = (typeof propertyTypes)[number]["slug"];
export type TransactionSlug = (typeof transactions)[number]["slug"];
