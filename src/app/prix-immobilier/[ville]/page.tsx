import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { site } from "../../../../site.config";
import { getCities, getCityBySlug, getCityPriceData } from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CityPriceBlock, buildPricePoints } from "@/components/CityPriceBlock";
import { FaqBlock } from "@/components/FaqBlock";
import { LeadForm } from "@/components/LeadForm";
import { Reveal } from "@/components/Reveal";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const cities = await getCities();
  return cities.map((city) => ({ ville: city.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ville: string }>;
}): Promise<Metadata> {
  const { ville } = await params;
  const city = await getCityBySlug(ville);
  if (!city) return { title: "Ville introuvable" };
  return pageMetadata({
    title: `Prix de l'immobilier à ${city.name} 2026 — prix au m² par quartier`,
    description: `Quel est le prix au m² à ${city.name} ? Carte interactive et tableau des prix de vente et de location, quartier par quartier. Données actualisées.`,
    path: `/prix-immobilier/${city.slug}`,
  });
}

export default async function CityPricePage({
  params,
}: {
  params: Promise<{ ville: string }>;
}) {
  const { ville } = await params;
  const city = await getCityBySlug(ville);
  if (!city) notFound();

  const rows = await getCityPriceData(city.id);
  const points = buildPricePoints(city, rows);
  const venteValues = points.map((p) => p.vente).filter((v): v is number => v != null);
  const avgVente = venteValues.length
    ? Math.round(venteValues.reduce((a, b) => a + b, 0) / venteValues.length)
    : null;
  const cheapest = points.filter((p) => p.vente != null).at(-1);
  const priciest = points.find((p) => p.vente != null);

  const faqs = [
    avgVente != null && {
      question: `Quel est le prix moyen au m² à ${city.name} ?`,
      answer: `Le prix moyen constaté pour un appartement à ${city.name} est d'environ ${formatNumber(avgVente)} MAD/m² à la vente, avec de fortes variations selon les quartiers${priciest && cheapest ? ` : de ${formatNumber(cheapest.vente!)} MAD/m² (${cheapest.name}) à ${formatNumber(priciest.vente!)} MAD/m² (${priciest.name})` : ""}.`,
    },
    priciest && {
      question: `Quel est le quartier le plus cher de ${city.name} ?`,
      answer: `${priciest.name} affiche les prix les plus élevés de ${city.name}, autour de ${formatNumber(priciest.vente!)} MAD/m² pour un appartement à la vente.`,
    },
    cheapest && {
      question: `Où acheter au meilleur prix à ${city.name} ?`,
      answer: `${cheapest.name} reste la zone la plus abordable de notre échantillon, autour de ${formatNumber(cheapest.vente!)} MAD/m². Un bon point d'entrée pour un premier achat ou un investissement locatif.`,
    },
    {
      question: "D'où viennent ces données de prix ?",
      answer:
        "Nos prix au m² sont issus des transactions et annonces comparables observées quartier par quartier, recoupées avec notre connaissance du terrain. Ils sont indicatifs : chaque bien mérite une estimation individuelle (gratuite chez nous).",
    },
  ].filter(Boolean) as { question: string; answer: string }[];

  return (
    <>
      <section className="hero-surface">
        <div className="wrap py-10 sm:py-14">
          <Breadcrumbs
            items={[
              { name: "Accueil", path: "/" },
              { name: "Prix immobilier", path: "/prix-immobilier" },
              { name: city.name, path: `/prix-immobilier/${city.slug}` },
            ]}
          />
          <div className="mt-6 max-w-2xl">
            <p className="kicker">Carte des prix — {city.name}</p>
            <h1 className="h-display">Prix de l&apos;immobilier à {city.name}</h1>
            <p className="mt-4 text-[16px] leading-relaxed text-ink/70">
              {avgVente != null ? (
                <>
                  En moyenne, un appartement se vend{" "}
                  <strong>{formatNumber(avgVente)} MAD/m²</strong> à {city.name}.
                  Explorez la carte pour comparer les quartiers en vente comme en
                  location.
                </>
              ) : (
                <>
                  Les données détaillées pour {city.name} arrivent bientôt. Demandez
                  une estimation personnalisée en attendant.
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="wrap py-10 sm:py-14">
        <CityPriceBlock city={city} points={points} />
      </section>

      <section className="wrap grid gap-10 pb-16 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <FaqBlock faqs={faqs} title={`Le marché de ${city.name} en questions`} />
        </Reveal>
        <Reveal delay={100}>
          <div className="card h-fit p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-bold text-ink">
              Recevez le rapport {city.name} complet
            </h2>
            <p className="mt-1 mb-5 text-[13.5px] text-ink/60">
              Analyse par quartier + alertes lorsque les prix bougent.
            </p>
            <LeadForm
              source="price_map"
              sourceRef={city.slug}
              city={city.name}
              cta="Recevoir le rapport gratuit"
              successText="Votre rapport arrive très vite sur WhatsApp ou par email."
            />
          </div>
        </Reveal>
      </section>

      <section className="wrap pb-16">
        <p className="text-[14px] text-ink/60">
          Voir aussi :{" "}
          <Link href={`/immobilier/${city.slug}/appartement-a-vendre`} className="font-semibold text-primary hover:underline">
            Appartements à vendre à {city.name}
          </Link>{" "}
          ·{" "}
          <Link href={`/immobilier/${city.slug}/appartement-a-louer`} className="font-semibold text-primary hover:underline">
            Appartements à louer à {city.name}
          </Link>{" "}
          ·{" "}
          <Link href="/estimer-mon-bien" className="font-semibold text-primary hover:underline">
            Estimer mon bien à {city.name}
          </Link>
        </p>
      </section>
    </>
  );
}
