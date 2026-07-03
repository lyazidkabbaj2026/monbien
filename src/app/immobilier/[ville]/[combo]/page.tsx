import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { site, propertyTypes, transactions } from "../../../../../site.config";
import {
  averagePricePerM2,
  getCities,
  getCityBySlug,
  getCityPriceData,
  getListings,
  getNeighborhoods,
} from "@/lib/data";
import { allCombos, comboSlug, parseCombo } from "@/lib/programmatic";
import { formatNumber, formatPricePerM2 } from "@/lib/format";
import { ogCard, pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqBlock, type Faq } from "@/components/FaqBlock";
import { LeadForm } from "@/components/LeadForm";
import { ListingCard } from "@/components/ListingCard";
import { Reveal } from "@/components/Reveal";

export const revalidate = 21600; // 6 h — les pages se régénèrent avec les données
export const dynamicParams = true;

export async function generateStaticParams() {
  const cities = await getCities();
  return cities.flatMap((city) =>
    allCombos().map(({ combo }) => ({ ville: city.slug, combo }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ville: string; combo: string }>;
}): Promise<Metadata> {
  const { ville, combo } = await params;
  const parts = parseCombo(combo);
  const city = await getCityBySlug(ville);
  if (!parts || !city) return { title: "Page introuvable" };
  return pageMetadata({
    title: `${parts.typePlural} ${parts.transactionVerb} à ${city.name} — annonces & prix 2026`,
    description: `${parts.typePlural} ${parts.transactionVerb} à ${city.name} : annonces vérifiées, prix au m² par quartier et accompagnement local. ${site.agent.responseTime} sur WhatsApp.`,
    path: `/immobilier/${city.slug}/${combo}`,
    image: ogCard(
      `${parts.typePlural} ${parts.transactionVerb} à ${city.name}`,
      `Annonces vérifiées, prix au m² par quartier et accompagnement local.`,
      city.name
    ),
  });
}

export default async function ComboPage({
  params,
}: {
  params: Promise<{ ville: string; combo: string }>;
}) {
  const { ville, combo } = await params;
  const parts = parseCombo(combo);
  const city = await getCityBySlug(ville);
  if (!parts || !city) notFound();

  const [result, priceRows, neighborhoods, cities] = await Promise.all([
    getListings(
      { citySlug: city.slug, transaction: parts.transaction, propertyType: parts.typeSlug },
      1
    ),
    getCityPriceData(city.id),
    getNeighborhoods(city.id),
    getCities(),
  ]);

  const avgPrice = averagePricePerM2(priceRows, parts.typeSlug, parts.transaction);
  const fallbackAvg =
    avgPrice ?? averagePricePerM2(priceRows, "appartement", parts.transaction);

  // Quartiers les plus chers pour ce type (ou appartement en repli)
  const hoodPrices = priceRows
    .filter(
      (r) =>
        r.transaction === parts.transaction &&
        (r.property_type === parts.typeSlug ||
          (avgPrice == null && r.property_type === "appartement"))
    )
    .sort((a, b) => Number(b.avg_price_per_m2) - Number(a.avg_price_per_m2));
  const topHoods = hoodPrices.slice(0, 3).map((r) => r.neighborhood.name);

  const h1 = `${parts.typePlural} ${parts.transactionVerb} à ${city.name}`;
  const count = result.count;

  const faqs: Faq[] = [
    fallbackAvg != null && {
      question: `Quel est le prix ${parts.transaction === "vente" ? "au m²" : "de location au m²"} d'un ${parts.typeLabel.toLowerCase()} à ${city.name} ?`,
      answer: `Comptez en moyenne ${formatNumber(fallbackAvg)} MAD/m²${parts.transaction === "location" ? "/mois" : ""} à ${city.name}${topHoods.length ? `, avec des écarts marqués entre quartiers — ${topHoods.join(", ")} étant les plus valorisés` : ""}. Consultez notre carte des prix pour le détail quartier par quartier.`,
    },
    {
      question: `Comment ${parts.transaction === "vente" ? "acheter" : "louer"} un ${parts.typeLabel.toLowerCase()} à ${city.name} en toute sécurité ?`,
      answer:
        parts.transaction === "vente"
          ? `Vérifiez le titre foncier, l'état de la copropriété et le prix au m² du quartier, puis sécurisez la transaction chez un notaire (compromis, acompte séquestré). Nous vous accompagnons à chaque étape, de la visite à la signature.`
          : `Exigez un contrat de bail écrit et enregistré, un état des lieux détaillé et des quittances de loyer. Nous vérifions chaque bien et chaque propriétaire avant de vous faire visiter.`,
    },
    {
      question: `Quels quartiers de ${city.name} privilégier ?`,
      answer: topHoods.length
        ? `Tout dépend de votre budget et de votre mode de vie : ${topHoods.join(", ")} figurent parmi les secteurs les plus recherchés. ${neighborhoods.length > 3 ? `Nous couvrons aussi ${neighborhoods.slice(0, 6).map((n) => n.name).join(", ")}…` : ""} Parlez-nous de votre projet pour des recommandations sur mesure.`
        : `Chaque quartier de ${city.name} a ses atouts. Décrivez-nous votre projet (budget, surface, proximité écoles/transports) et nous vous orientons vers les meilleures options du moment.`,
    },
    {
      question: `Pourquoi passer par ${site.brandName} ?`,
      answer: `Un seul interlocuteur local qui connaît ${city.name} rue par rue : annonces vérifiées sur place, négociation sur données réelles de prix, et ${site.agent.responseTime.toLowerCase()} sur WhatsApp. ${site.proof.propertiesSold}+ biens vendus.`,
    },
  ].filter(Boolean) as Faq[];

  const siblingTypes = propertyTypes.filter((t) => t.slug !== parts.typeSlug);
  const otherTransaction = transactions.find((t) => t.slug !== parts.transaction)!;
  const otherCities = cities.filter((c) => c.slug !== city.slug).slice(0, 6);

  return (
    <>
      <section className="hero-surface">
        <div className="wrap py-10 sm:py-14">
          <Breadcrumbs
            items={[
              { name: "Accueil", path: "/" },
              { name: `Immobilier ${city.name}`, path: `/prix-immobilier/${city.slug}` },
              { name: h1, path: `/immobilier/${city.slug}/${combo}` },
            ]}
          />
          <div className="mt-6 max-w-3xl">
            <p className="kicker">
              {city.name} · {parts.transaction === "vente" ? "Vente" : "Location"}
            </p>
            <h1 className="h-display">{h1}</h1>
            <p className="mt-4 text-[16px] leading-relaxed text-ink/70">
              {count > 0 ? (
                <>
                  <strong>
                    {count} {count > 1 ? parts.typePlural.toLowerCase() : parts.typeLabel.toLowerCase()}
                  </strong>{" "}
                  {parts.transactionVerb} actuellement à {city.name}
                  {city.region ? ` (${city.region})` : ""}.{" "}
                </>
              ) : (
                <>
                  Vous cherchez un {parts.typeLabel.toLowerCase()}{" "}
                  {parts.transactionVerb} à {city.name} ? Nous recevons des biens en
                  avant-première : décrivez-nous votre recherche.{" "}
                </>
              )}
              {fallbackAvg != null && (
                <>
                  Prix moyen constaté :{" "}
                  <strong>{formatPricePerM2(fallbackAvg, parts.transaction)}</strong>
                  {topHoods.length > 0 && (
                    <> — quartiers les plus prisés : {topHoods.join(", ")}.</>
                  )}
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Annonces correspondantes */}
      <section className="wrap py-10 sm:py-14">
        {result.listings.length > 0 ? (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="h-section">Annonces disponibles</h2>
              <Link
                href={`/annonces?transaction=${parts.transaction}&type=${parts.typeSlug}&ville=${city.slug}`}
                className="text-[14.5px] font-semibold text-primary hover:underline"
              >
                Voir tout avec filtres →
              </Link>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.listings.slice(0, 6).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </>
        ) : (
          <Reveal>
            <div className="card grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <div>
                <h2 className="h-section">Recevez les {parts.typePlural.toLowerCase()} en avant-première</h2>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink/70">
                  Les meilleurs biens partent avant d&apos;être publiés. Laissez vos
                  critères : nous vous alertons dès qu&apos;un {parts.typeLabel.toLowerCase()}{" "}
                  {parts.transactionVerb} correspond à {city.name}.
                </p>
              </div>
              <LeadForm
                source="contact"
                sourceRef={`${combo}/${city.slug}`}
                city={city.name}
                withMessage
                cta="Recevoir les biens en avant-première"
              />
            </div>
          </Reveal>
        )}
      </section>

      {/* Prix locaux */}
      {hoodPrices.length > 0 && (
        <section className="border-y border-line bg-white/50">
          <div className="wrap py-12">
            <h2 className="h-section mb-6">
              Prix {parts.transaction === "vente" ? "de vente" : "de location"} par quartier
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {hoodPrices.slice(0, 8).map((row) => (
                <Link
                  key={row.id}
                  href={`/quartiers/${city.slug}/${row.neighborhood.slug}`}
                  className="card group px-4 py-3.5 transition hover:border-primary/40"
                >
                  <p className="text-[13.5px] font-semibold text-ink group-hover:text-primary">
                    {row.neighborhood.name}
                  </p>
                  <p className="font-display mt-1 text-[15px] font-bold text-primary">
                    {formatNumber(Number(row.avg_price_per_m2))}{" "}
                    <span className="text-[11px] font-semibold text-ink/50">
                      MAD/m²{parts.transaction === "location" ? "/mois" : ""}
                    </span>
                  </p>
                </Link>
              ))}
            </div>
            <p className="mt-4 text-[13.5px] text-ink/60">
              <Link href={`/prix-immobilier/${city.slug}`} className="font-semibold text-primary hover:underline">
                Voir la carte complète des prix à {city.name} →
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="wrap py-14">
        <Reveal>
          <FaqBlock faqs={faqs} title={`${h1} : vos questions`} />
        </Reveal>
      </section>

      {/* Maillage interne */}
      <section className="wrap pb-16">
        <h2 className="font-display mb-4 text-lg font-bold text-ink">
          Poursuivre votre recherche
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/immobilier/${city.slug}/${comboSlug(parts.typeSlug, otherTransaction.slug)}`}
            className="rounded-full border border-line bg-white px-4 py-2 text-[13.5px] font-medium text-ink/75 transition hover:border-primary hover:text-primary"
          >
            {parts.typePlural} {otherTransaction.slug === "vente" ? "à vendre" : "à louer"} à {city.name}
          </Link>
          {siblingTypes.map((type) => (
            <Link
              key={type.slug}
              href={`/immobilier/${city.slug}/${comboSlug(type.slug, parts.transaction)}`}
              className="rounded-full border border-line bg-white px-4 py-2 text-[13.5px] font-medium text-ink/75 transition hover:border-primary hover:text-primary"
            >
              {type.plural} {parts.transactionVerb} à {city.name}
            </Link>
          ))}
          {neighborhoods.slice(0, 8).map((hood) => (
            <Link
              key={hood.slug}
              href={`/quartiers/${city.slug}/${hood.slug}`}
              className="rounded-full border border-line bg-white px-4 py-2 text-[13.5px] font-medium text-ink/75 transition hover:border-primary hover:text-primary"
            >
              Immobilier {hood.name}
            </Link>
          ))}
          {otherCities.map((c) => (
            <Link
              key={c.slug}
              href={`/immobilier/${c.slug}/${combo}`}
              className="rounded-full border border-line bg-white px-4 py-2 text-[13.5px] font-medium text-ink/75 transition hover:border-primary hover:text-primary"
            >
              {parts.typePlural} {parts.transactionVerb} à {c.name}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
