import Link from "next/link";
import { ArrowRight, MapPinned } from "lucide-react";
import { site } from "../../../site.config";
import { getCities, getCityBySlug, getCityPriceData } from "@/lib/data";
import { ogCard, pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CityPriceBlock, buildPricePoints } from "@/components/CityPriceBlock";
import { LeadForm } from "@/components/LeadForm";
import { AgentCard } from "@/components/AgentCard";
import { Reveal } from "@/components/Reveal";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: `Prix de l'immobilier au m² à ${site.defaultCity} et au Maroc — carte interactive`,
  description: `Carte interactive des prix immobiliers au m², quartier par quartier : vente et location à ${site.defaultCity}, Casablanca, Marrakech, Tanger. Données mises à jour en continu.`,
  path: "/prix-immobilier",
  image: ogCard(
    "Prix de l'immobilier au m²",
    `Carte interactive des prix par quartier à ${site.defaultCity} et dans tout le Maroc.`,
    "Carte des prix"
  ),
});

export default async function PriceIndexPage() {
  const cities = await getCities();
  const defaultCity = await getCityBySlug(site.defaultCitySlug);
  const rows = defaultCity ? await getCityPriceData(defaultCity.id) : [];
  const points = defaultCity ? buildPricePoints(defaultCity, rows) : [];
  const otherCities = cities.filter((c) => c.slug !== site.defaultCitySlug);

  return (
    <>
      <section className="hero-surface">
        <div className="wrap py-10 sm:py-14">
          <Breadcrumbs
            items={[
              { name: "Accueil", path: "/" },
              { name: "Prix immobilier", path: "/prix-immobilier" },
            ]}
          />
          <div className="mt-6 max-w-2xl">
            <p className="kicker">
              <MapPinned className="h-4 w-4" aria-hidden />
              Carte des prix
            </p>
            <h1 className="h-display">Prix de l&apos;immobilier au m², quartier par quartier</h1>
            <p className="mt-4 text-[16px] leading-relaxed text-ink/70">
              Comparez les prix de vente et de location dans chaque quartier avant
              d&apos;acheter, de vendre ou de louer. Cliquez sur un quartier pour le
              détail.
            </p>
          </div>
        </div>
      </section>

      {defaultCity && (
        <section className="wrap py-10 sm:py-14">
          <h2 className="h-section mb-6">Prix au m² à {defaultCity.name}</h2>
          <CityPriceBlock city={defaultCity} points={points} />
        </section>
      )}

      {/* Autres villes */}
      <section className="wrap pb-6">
        <h2 className="h-section mb-6">Explorer d&apos;autres villes</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {otherCities.map((city) => (
            <Link
              key={city.slug}
              href={`/prix-immobilier/${city.slug}`}
              className="card group flex items-center justify-between px-5 py-4 transition hover:border-primary/40"
            >
              <span className="text-[14.5px] font-semibold text-ink group-hover:text-primary">
                {city.name}
              </span>
              <ArrowRight
                className="h-4 w-4 text-ink/30 transition group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </section>

      {/* CTA rapport */}
      <section className="wrap py-14">
        <Reveal>
          <div className="card grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <p className="kicker">Rapport gratuit</p>
              <h2 className="h-section">
                Recevez le rapport complet du marché + les alertes de prix
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink/70">
                Analyse détaillée par quartier, évolution des prix et opportunités du
                moment à {site.defaultCity} — directement sur WhatsApp ou par email.
              </p>
              <div className="mt-6 max-w-sm">
                <AgentCard compact />
              </div>
            </div>
            <LeadForm
              source="price_map"
              sourceRef={site.defaultCitySlug}
              city={site.defaultCity}
              cta="Recevoir le rapport complet"
              successText="Votre rapport arrive très vite sur WhatsApp ou par email."
            />
          </div>
        </Reveal>
      </section>
    </>
  );
}
