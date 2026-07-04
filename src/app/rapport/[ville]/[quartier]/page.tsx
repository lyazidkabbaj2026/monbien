import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Percent,
  Printer,
  TrendingUp,
} from "lucide-react";
import { site, propertyTypes } from "../../../../../site.config";
import {
  getAllNeighborhoodsWithCity,
  getCityBySlug,
  getCityPriceData,
  getListings,
  getNeighborhoodBySlug,
} from "@/lib/data";
import { formatDate, formatNumber } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { waLink } from "@/lib/whatsapp";
import { ListingCard } from "@/components/ListingCard";
import { WaButton } from "@/components/WaButton";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { AgentCard } from "@/components/AgentCard";

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
  if (!city || !hood) return { title: "Rapport introuvable" };
  return pageMetadata({
    title: `Rapport du marché — ${hood.name}, ${city.name}`,
    description: `Rapport détaillé du marché immobilier de ${hood.name} : prix au m², rendement locatif, quartiers comparables et biens disponibles.`,
    path: `/rapport/${city.slug}/${hood.slug}`,
    noindex: true, // livrable réservé aux leads : accessible par lien uniquement
  });
}

const typeLabel = (slug: string) =>
  propertyTypes.find((t) => t.slug === slug)?.label ?? slug;

export default async function NeighborhoodReportPage({
  params,
}: {
  params: Promise<{ ville: string; quartier: string }>;
}) {
  const { ville, quartier } = await params;
  const city = await getCityBySlug(ville);
  if (!city) notFound();
  const hood = await getNeighborhoodBySlug(city.id, quartier);
  if (!hood) notFound();

  const [cityRows, listingsResult] = await Promise.all([
    getCityPriceData(city.id),
    getListings({ citySlug: city.slug, neighborhoodSlug: hood.slug }, 1),
  ]);

  const hoodRows = cityRows.filter((r) => r.neighborhood_id === hood.id);
  if (hoodRows.length === 0) notFound();

  const venteAppart = hoodRows.find(
    (r) => r.transaction === "vente" && r.property_type === "appartement"
  );
  const locationAppart = hoodRows.find(
    (r) => r.transaction === "location" && r.property_type === "appartement"
  );

  // Position vs moyenne de la ville (appartement vente)
  const cityVenteRows = cityRows.filter(
    (r) => r.transaction === "vente" && r.property_type === "appartement"
  );
  const cityAvg =
    cityVenteRows.length > 0
      ? cityVenteRows.reduce((s, r) => s + Number(r.avg_price_per_m2), 0) /
        cityVenteRows.length
      : null;
  const positionPct =
    venteAppart && cityAvg
      ? Math.round((Number(venteAppart.avg_price_per_m2) / cityAvg - 1) * 100)
      : null;

  // Rendement locatif brut estimé (appartement)
  const grossYield =
    venteAppart && locationAppart
      ? (Number(locationAppart.avg_price_per_m2) * 12) /
        Number(venteAppart.avg_price_per_m2)
      : null;

  // Quartiers comparables (prix vente appartement le plus proche)
  const comparables = venteAppart
    ? cityVenteRows
        .filter((r) => r.neighborhood_id !== hood.id)
        .sort(
          (a, b) =>
            Math.abs(Number(a.avg_price_per_m2) - Number(venteAppart.avg_price_per_m2)) -
            Math.abs(Number(b.avg_price_per_m2) - Number(venteAppart.avg_price_per_m2))
        )
        .slice(0, 3)
    : [];

  const updatedAt = hoodRows
    .map((r) => r.updated_at)
    .sort()
    .at(-1);

  return (
    <div className="pb-16">
      {/* En-tête rapport */}
      <header className="dark-surface text-white">
        <div className="wrap py-12 sm:py-16">
          <p className="kicker !text-accent">Rapport du marché immobilier</p>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {hood.name}
            <span className="text-white/60"> · {city.name}</span>
          </h1>
          <p className="mt-3 max-w-xl text-[15px] text-white/70">
            Préparé par {site.brandName} — données actualisées
            {updatedAt ? ` le ${formatDate(updatedAt)}` : " en continu"}.
          </p>
        </div>
      </header>

      <div className="wrap">
        {/* Indicateurs clés */}
        <section className="-mt-8 grid gap-4 sm:grid-cols-3 print:mt-6">
          {venteAppart && (
            <div className="card p-6">
              <p className="flex items-center gap-2 text-[12.5px] font-bold tracking-wide text-ink/55 uppercase">
                <Building2 className="h-4 w-4 text-primary" aria-hidden />
                Prix de vente moyen
              </p>
              <p className="font-display mt-2 text-3xl font-bold text-primary">
                {formatNumber(Number(venteAppart.avg_price_per_m2))}
                <span className="ml-1 text-[14px] font-semibold text-ink/50">MAD/m²</span>
              </p>
              <p className="mt-1 text-[12.5px] text-ink/50">
                Appartement · échantillon {venteAppart.sample_size} biens
              </p>
            </div>
          )}
          {positionPct != null && (
            <div className="card p-6">
              <p className="flex items-center gap-2 text-[12.5px] font-bold tracking-wide text-ink/55 uppercase">
                <BarChart3 className="h-4 w-4 text-primary" aria-hidden />
                Position dans {city.name}
              </p>
              <p className="font-display mt-2 text-3xl font-bold text-primary">
                {positionPct > 0 ? "+" : ""}
                {positionPct} %
              </p>
              <p className="mt-1 text-[12.5px] text-ink/50">
                vs prix moyen de la ville ({formatNumber(Math.round(cityAvg!))} MAD/m²)
              </p>
            </div>
          )}
          {grossYield != null && (
            <div className="card p-6">
              <p className="flex items-center gap-2 text-[12.5px] font-bold tracking-wide text-ink/55 uppercase">
                <Percent className="h-4 w-4 text-primary" aria-hidden />
                Rendement locatif brut
              </p>
              <p className="font-display mt-2 text-3xl font-bold text-primary">
                {(grossYield * 100).toFixed(1)} %
              </p>
              <p className="mt-1 text-[12.5px] text-ink/50">
                estimation appartement, loyer annuel / prix d&apos;achat
              </p>
            </div>
          )}
        </section>

        {/* Analyse */}
        {hood.description && (
          <section className="mt-12">
            <h2 className="h-section !text-xl">Le quartier en bref</h2>
            <p className="mt-3 max-w-3xl text-[15.5px] leading-relaxed text-ink/75">
              {hood.description}
            </p>
          </section>
        )}

        {/* Détail des prix */}
        <section className="mt-12">
          <h2 className="h-section !text-xl">Prix détaillés à {hood.name}</h2>
          <div className="card mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] text-[14px]">
              <thead className="bg-primary-soft text-left text-[12px] tracking-wide text-ink/55 uppercase">
                <tr>
                  <th className="px-5 py-3 font-bold">Type de bien</th>
                  <th className="px-5 py-3 font-bold">Transaction</th>
                  <th className="px-5 py-3 font-bold">Prix moyen</th>
                  <th className="px-5 py-3 font-bold">Échantillon</th>
                </tr>
              </thead>
              <tbody>
                {hoodRows.map((row) => (
                  <tr key={row.id} className="border-t border-line/70">
                    <td className="px-5 py-3 font-semibold text-ink">
                      {typeLabel(row.property_type)}
                    </td>
                    <td className="px-5 py-3 text-ink/65 capitalize">{row.transaction}</td>
                    <td className="px-5 py-3 font-bold text-primary">
                      {formatNumber(Number(row.avg_price_per_m2))} MAD/m²
                      {row.transaction === "location" ? "/mois" : ""}
                    </td>
                    <td className="px-5 py-3 text-ink/55">{row.sample_size} biens</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Comparables */}
        {comparables.length > 0 && (
          <section className="mt-12">
            <h2 className="h-section !text-xl">Quartiers comparables</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {comparables.map((row) => (
                <Link
                  key={row.id}
                  href={`/rapport/${city.slug}/${row.neighborhood.slug}`}
                  className="card group p-5 transition hover:border-primary/40"
                >
                  <p className="flex items-center justify-between text-[14.5px] font-bold text-ink group-hover:text-primary">
                    {row.neighborhood.name}
                    <ArrowRight className="h-4 w-4 text-ink/30" aria-hidden />
                  </p>
                  <p className="font-display mt-2 text-lg font-bold text-primary">
                    {formatNumber(Number(row.avg_price_per_m2))}{" "}
                    <span className="text-[12px] font-semibold text-ink/50">MAD/m²</span>
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Biens disponibles */}
        {listingsResult.listings.length > 0 && (
          <section className="mt-12 print:hidden">
            <h2 className="h-section !text-xl">
              Nos biens à {hood.name} en ce moment
            </h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listingsResult.listings.slice(0, 3).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </section>
        )}

        {/* Et maintenant ? */}
        <section className="mt-14 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="dark-surface rounded-3xl p-8 text-white sm:p-10">
            <TrendingUp className="h-7 w-7 text-accent" aria-hidden />
            <h2 className="font-display mt-4 text-xl font-bold sm:text-2xl">
              Que faire de ces chiffres ?
            </h2>
            <ul className="mt-4 space-y-2.5 text-[14.5px] leading-relaxed text-white/80">
              <li>
                <strong>Vous vendez :</strong> comparez votre bien au prix moyen du
                quartier, puis affinez avec une estimation individuelle — gratuite.
              </li>
              <li>
                <strong>Vous achetez :</strong> tout prix supérieur de 10 % à la
                moyenne doit être justifié (étage, état, prestations). Négociez sur
                données.
              </li>
              <li>
                <strong>Vous investissez :</strong> rapprochez le rendement brut
                ci-dessus des quartiers comparables avant de choisir.
              </li>
            </ul>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row print:hidden">
              <Link href="/estimer-mon-bien" className="btn-accent">
                Estimer mon bien
                <ArrowRight className="h-4.5 w-4.5" aria-hidden />
              </Link>
              <WaButton
                href={waLink(
                  `Bonjour ${site.brandName}, j'ai consulté votre rapport sur ${hood.name} (${city.name}) et j'aimerais en discuter.`
                )}
                placement="report"
                className="btn-whatsapp"
              >
                <WhatsAppIcon className="h-5 w-5" />
                En discuter sur WhatsApp
              </WaButton>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-6">
            <AgentCard />
            <p className="text-[12px] leading-relaxed text-ink/45">
              Prix indicatifs issus des transactions et annonces comparables
              observées par {site.brandName}. Ce rapport ne constitue pas une
              expertise ; chaque bien mérite une évaluation individuelle.{" "}
              <span className="print:hidden">
                <Printer className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                Astuce : imprimez cette page (Ctrl/Cmd+P) pour la conserver en PDF.
              </span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
