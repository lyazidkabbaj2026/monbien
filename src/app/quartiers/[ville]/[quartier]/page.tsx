import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { site, propertyTypes } from "../../../../../site.config";
import {
  getAllNeighborhoodsWithCity,
  getCityBySlug,
  getListings,
  getNeighborhoodBySlug,
  getNeighborhoodPriceData,
  getNeighborhoods,
} from "@/lib/data";
import { comboSlug } from "@/lib/programmatic";
import { duoSlug } from "@/lib/compare";
import { formatNumber } from "@/lib/format";
import { ogCard, pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqBlock, type Faq } from "@/components/FaqBlock";
import { LeadForm } from "@/components/LeadForm";
import { ListingCard } from "@/components/ListingCard";
import { ListingMap } from "@/components/map/ListingMap";
import { Reveal } from "@/components/Reveal";

export const revalidate = 21600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const hoods = await getAllNeighborhoodsWithCity();
  return hoods.map((hood) => ({ ville: hood.city.slug, quartier: hood.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ville: string; quartier: string }>;
}): Promise<Metadata> {
  const { ville, quartier } = await params;
  const city = await getCityBySlug(ville);
  const hood = city ? await getNeighborhoodBySlug(city.id, quartier) : null;
  if (!city || !hood) return { title: "Quartier introuvable" };
  return pageMetadata({
    title: `Immobilier ${hood.name} (${city.name}) — prix au m², vente & location`,
    description: `Acheter, vendre ou louer à ${hood.name}, ${city.name} : prix au m² actualisés, annonces du quartier et conseils d'un expert local. Estimation gratuite.`,
    path: `/quartiers/${city.slug}/${hood.slug}`,
    image: ogCard(
      `Immobilier à ${hood.name}`,
      `Prix au m², annonces et conseils d'expert local à ${hood.name}, ${city.name}.`,
      city.name
    ),
  });
}

export default async function NeighborhoodPage({
  params,
}: {
  params: Promise<{ ville: string; quartier: string }>;
}) {
  const { ville, quartier } = await params;
  const city = await getCityBySlug(ville);
  if (!city) notFound();
  const hood = await getNeighborhoodBySlug(city.id, quartier);
  if (!hood) notFound();

  const [priceRows, listingsResult, siblings] = await Promise.all([
    getNeighborhoodPriceData(hood.id),
    getListings({ citySlug: city.slug, neighborhoodSlug: hood.slug }, 1),
    getNeighborhoods(city.id),
  ]);

  const venteRows = priceRows
    .filter((r) => r.transaction === "vente")
    .sort((a, b) => Number(b.avg_price_per_m2) - Number(a.avg_price_per_m2));
  const locationRows = priceRows.filter((r) => r.transaction === "location");
  const apartVente = venteRows.find((r) => r.property_type === "appartement");

  const typeLabel = (slug: string) =>
    propertyTypes.find((t) => t.slug === slug)?.label ?? slug;

  const faqs: Faq[] = [
    apartVente && {
      question: `Quel est le prix au m² à ${hood.name} ?`,
      answer: `Un appartement se vend en moyenne ${formatNumber(Number(apartVente.avg_price_per_m2))} MAD/m² à ${hood.name} (${city.name}). ${venteRows.length > 1 ? `Pour les autres types de biens : ${venteRows.filter((r) => r.property_type !== "appartement").map((r) => `${typeLabel(r.property_type).toLowerCase()} ${formatNumber(Number(r.avg_price_per_m2))} MAD/m²`).join(", ")}.` : ""}`,
    },
    {
      question: `Fait-il bon vivre à ${hood.name} ?`,
      answer: `${hood.name} est l'un des quartiers ${apartVente && Number(apartVente.avg_price_per_m2) > 18000 ? "les plus recherchés" : "à surveiller"} de ${city.name}. Commerces, écoles, accès : chaque rue a ses spécificités — demandez-nous un avis personnalisé selon votre projet (famille, investissement, résidence secondaire).`,
    },
    {
      question: `Je vends un bien à ${hood.name} : par où commencer ?`,
      answer: `Commencez par une estimation objective basée sur les prix réels du quartier — c'est gratuit et immédiat sur notre site. ${site.agent.name} peut ensuite affiner sur place et vous proposer un plan de commercialisation. ${site.agent.responseTime} sur WhatsApp.`,
    },
  ].filter(Boolean) as Faq[];

  return (
    <>
      <section className="hero-surface">
        <div className="wrap py-10 sm:py-14">
          <Breadcrumbs
            items={[
              { name: "Accueil", path: "/" },
              { name: `Prix ${city.name}`, path: `/prix-immobilier/${city.slug}` },
              { name: hood.name, path: `/quartiers/${city.slug}/${hood.slug}` },
            ]}
          />
          <div className="mt-6 max-w-3xl">
            <p className="kicker">
              Quartier · {city.name}
            </p>
            <h1 className="h-display">Immobilier à {hood.name}</h1>
            <p className="mt-4 text-[16px] leading-relaxed text-ink/70">
              {apartVente ? (
                <>
                  Prix moyen constaté :{" "}
                  <strong>
                    {formatNumber(Number(apartVente.avg_price_per_m2))} MAD/m²
                  </strong>{" "}
                  pour un appartement à la vente à {hood.name}.{" "}
                </>
              ) : null}
              Annonces du quartier, prix actualisés et accompagnement local pour
              acheter, vendre ou louer en toute confiance.
            </p>
          </div>
        </div>
      </section>

      <div className="wrap grid gap-10 py-10 sm:py-14 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-12">
          {/* Présentation éditoriale */}
          {hood.description && (
            <section>
              <h2 className="h-section mb-4">Vivre à {hood.name}</h2>
              <p className="max-w-2xl text-[15.5px] leading-relaxed text-ink/75">
                {hood.description}
              </p>
            </section>
          )}

          {/* Prix du quartier */}
          {priceRows.length > 0 && (
            <section>
              <h2 className="h-section mb-5">Prix au m² à {hood.name}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {venteRows.map((row) => (
                  <div key={row.id} className="card px-5 py-4">
                    <p className="text-[13px] font-semibold tracking-wide text-ink/55 uppercase">
                      {typeLabel(row.property_type)} · Vente
                    </p>
                    <p className="font-display mt-1 text-xl font-bold text-primary">
                      {formatNumber(Number(row.avg_price_per_m2))}{" "}
                      <span className="text-[13px] font-semibold text-ink/50">MAD/m²</span>
                    </p>
                  </div>
                ))}
                {locationRows.map((row) => (
                  <div key={row.id} className="card px-5 py-4">
                    <p className="text-[13px] font-semibold tracking-wide text-ink/55 uppercase">
                      {typeLabel(row.property_type)} · Location
                    </p>
                    <p className="font-display mt-1 text-xl font-bold text-primary">
                      {formatNumber(Number(row.avg_price_per_m2))}{" "}
                      <span className="text-[13px] font-semibold text-ink/50">
                        MAD/m²/mois
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Annonces du quartier */}
          {listingsResult.listings.length > 0 && (
            <section>
              <h2 className="h-section mb-5">Nos biens à {hood.name}</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {listingsResult.listings.slice(0, 4).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>
          )}

          {/* Carte */}
          {hood.lat != null && hood.lng != null && (
            <section>
              <h2 className="h-section mb-5">Situer {hood.name}</h2>
              <ListingMap lat={hood.lat} lng={hood.lng} label={hood.name} />
            </section>
          )}

          <Reveal>
            <FaqBlock faqs={faqs} title={`${hood.name} en questions`} />
          </Reveal>
        </div>

        {/* Sidebar conversion */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink">
              Un projet à {hood.name} ?
            </h2>
            <p className="mt-1 mb-5 text-[13.5px] text-ink/60">
              Achat, vente ou location : décrivez votre projet, on vous rappelle{" "}
              {site.agent.responseTime.toLowerCase()}.
            </p>
            <LeadForm
              source="contact"
              sourceRef={`quartier/${city.slug}/${hood.slug}`}
              city={city.name}
              withMessage
              cta="Être conseillé sur ce quartier"
            />
          </div>
          <div className="card p-6">
            <h3 className="font-display text-[15px] font-bold text-ink">
              Explorer aussi
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href={`/immobilier/${city.slug}/${comboSlug("appartement", "vente")}`}
                  className="text-[14px] font-medium text-primary hover:underline"
                >
                  Appartements à vendre à {city.name}
                </Link>
              </li>
              <li>
                <Link
                  href={`/prix-immobilier/${city.slug}`}
                  className="text-[14px] font-medium text-primary hover:underline"
                >
                  Carte des prix de {city.name}
                </Link>
              </li>
              <li>
                <Link
                  href="/estimer-mon-bien"
                  className="text-[14px] font-medium text-primary hover:underline"
                >
                  Estimer mon bien à {hood.name}
                </Link>
              </li>
            </ul>
            <h3 className="font-display mt-5 text-[15px] font-bold text-ink">
              Quartiers voisins
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {siblings
                .filter((s) => s.slug !== hood.slug)
                .slice(0, 7)
                .map((s) => (
                  <Link
                    key={s.slug}
                    href={`/quartiers/${city.slug}/${s.slug}`}
                    className="rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] font-medium text-ink/70 transition hover:border-primary hover:text-primary"
                  >
                    {s.name}
                  </Link>
                ))}
            </div>
            {priceRows.length > 0 && (
              <>
                <h3 className="font-display mt-5 text-[15px] font-bold text-ink">
                  Comparer {hood.name}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {siblings
                    .filter((s) => s.slug !== hood.slug)
                    .slice(0, 4)
                    .map((s) => (
                      <Link
                        key={s.slug}
                        href={`/comparer/${city.slug}/${duoSlug(hood.slug, s.slug)}`}
                        className="rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] font-medium text-ink/70 transition hover:border-accent hover:text-accent-deep"
                      >
                        vs {s.name}
                      </Link>
                    ))}
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
