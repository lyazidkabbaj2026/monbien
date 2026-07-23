import { BadgeCheck, Clock3, Database, HandCoins } from "lucide-react";
import { site } from "../../../site.config";
import { getCities, getNeighborhoods } from "@/lib/data";
import type { Neighborhood } from "@/lib/types";
import { ogCard, pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ValuationWizard } from "@/components/ValuationWizard";
import { FaqBlock } from "@/components/FaqBlock";
import { Reveal } from "@/components/Reveal";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: `Estimation immobilière gratuite à ${site.defaultCity} — résultat en 2 minutes`,
  description: `Combien vaut votre appartement, villa ou maison à ${site.defaultCity} ? Estimation gratuite et immédiate basée sur les prix réels au m² de votre quartier.`,
  path: "/estimer-mon-bien",
  image: ogCard(
    `Combien vaut votre bien à ${site.defaultCity} ?`,
    "Estimation gratuite en 2 minutes, basée sur les prix réels de votre quartier.",
    "Gratuit"
  ),
});

const REASSURANCE = [
  {
    icon: Database,
    title: "Données réelles",
    text: "Prix au m² observés quartier par quartier, mis à jour en continu.",
  },
  {
    icon: Clock3,
    title: "2 minutes chrono",
    text: "Quatre questions suffisent — le résultat s'affiche immédiatement.",
  },
  {
    icon: HandCoins,
    title: "100 % gratuit",
    text: "Sans engagement. Vous restez libre de vendre quand vous voulez.",
  },
  {
    icon: BadgeCheck,
    title: "Affinage par un expert",
    text: "Un conseiller affine l'estimation sur place, gratuitement.",
  },
];

const FAQS = [
  {
    question: "Comment l'estimation est-elle calculée ?",
    answer:
      "Nous croisons la surface, le type de bien et son état avec les prix au m² observés dans votre quartier (transactions récentes et annonces comparables). Vous obtenez une fourchette basse–haute réaliste, pas un chiffre marketing.",
  },
  {
    question: "L'estimation en ligne est-elle fiable ?",
    answer:
      "Elle donne un ordre de grandeur fidèle au marché de votre quartier. Pour fixer un prix de mise en vente précis, une visite reste indispensable : exposition, étage, travaux et prestations peuvent faire varier le prix de 10 à 15 %. Cette contre-visite est gratuite.",
  },
  {
    question: "Est-ce vraiment gratuit et sans engagement ?",
    answer:
      "Oui. L'estimation en ligne comme la contre-visite sur place sont gratuites. Vous restez entièrement libre de confier — ou non — la vente de votre bien.",
  },
  {
    question: "Que deviennent mes coordonnées ?",
    answer:
      "Elles servent uniquement à vous transmettre l'estimation et à vous recontacter au sujet de votre projet. Elles ne sont jamais revendues ni partagées avec des tiers.",
  },
];

export default async function ValuationPage() {
  const cities = await getCities();
  const hoodEntries = await Promise.all(
    cities.map(async (city) => [city.id, await getNeighborhoods(city.id)] as const)
  );
  const neighborhoods: Record<string, Neighborhood[]> =
    Object.fromEntries(hoodEntries);

  return (
    <>
      <section className="hero-surface">
        <div className="wrap py-10 sm:py-14">
          <Breadcrumbs
            items={[
              { name: "Accueil", path: "/" },
              { name: "Estimer mon bien", path: "/estimer-mon-bien" },
            ]}
          />
          <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div className="lg:sticky lg:top-24">
              <p className="kicker">Estimation gratuite</p>
              <h1 className="h-display">
                Combien vaut votre bien à {site.defaultCity} ?
              </h1>
              <p className="mt-4 max-w-md text-[16px] leading-relaxed text-ink/70">
                Répondez à 4 questions et obtenez immédiatement une fourchette de
                prix basée sur les prix réels au m² de votre quartier.
              </p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {REASSURANCE.map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
                    <div>
                      <p className="text-[14.5px] font-bold text-ink">{item.title}</p>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-ink/60">
                        {item.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6 sm:p-8">
              <ValuationWizard cities={cities} neighborhoods={neighborhoods} />
            </div>
          </div>
        </div>
      </section>

      <section className="wrap py-16">
        <Reveal>
          <FaqBlock faqs={FAQS} title="Questions fréquentes sur l'estimation" />
        </Reveal>
      </section>
    </>
  );
}
