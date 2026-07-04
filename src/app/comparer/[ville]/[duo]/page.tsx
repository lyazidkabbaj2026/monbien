import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Scale } from "lucide-react";
import { site } from "../../../../../site.config";
import {
  getCities,
  getCityBySlug,
  getCityPriceData,
  getNeighborhoodBySlug,
} from "@/lib/data";
import { allPairs, duoSlug, parseDuo } from "@/lib/compare";
import { formatNumber } from "@/lib/format";
import { ogCard, pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqBlock, type Faq } from "@/components/FaqBlock";
import { Reveal } from "@/components/Reveal";

export const revalidate = 21600;
export const dynamicParams = true;

interface HoodStats {
  name: string;
  slug: string;
  description: string | null;
  vente: number | null;
  location: number | null;
  yieldPct: number | null;
  vsCityPct: number | null;
}

export async function generateStaticParams() {
  const cities = await getCities();
  const params: { ville: string; duo: string }[] = [];
  for (const city of cities) {
    const rows = await getCityPriceData(city.id);
    const slugs = [
      ...new Set(
        rows
          .filter((r) => r.transaction === "vente" && r.property_type === "appartement")
          .map((r) => r.neighborhood.slug)
      ),
    ];
    for (const [a, b] of allPairs(slugs)) {
      params.push({ ville: city.slug, duo: `${a}-vs-${b}` });
    }
  }
  return params;
}

async function getStats(
  cityId: string,
  slugs: [string, string]
): Promise<[HoodStats, HoodStats] | null> {
  const rows = await getCityPriceData(cityId);
  const cityVente = rows.filter(
    (r) => r.transaction === "vente" && r.property_type === "appartement"
  );
  const cityAvg =
    cityVente.length > 0
      ? cityVente.reduce((s, r) => s + Number(r.avg_price_per_m2), 0) / cityVente.length
      : null;

  const stats = await Promise.all(
    slugs.map(async (slug): Promise<HoodStats | null> => {
      const hood = await getNeighborhoodBySlug(cityId, slug);
      if (!hood) return null;
      const vente = rows.find(
        (r) =>
          r.neighborhood_id === hood.id &&
          r.transaction === "vente" &&
          r.property_type === "appartement"
      );
      const location = rows.find(
        (r) =>
          r.neighborhood_id === hood.id &&
          r.transaction === "location" &&
          r.property_type === "appartement"
      );
      if (!vente) return null;
      const venteVal = Number(vente.avg_price_per_m2);
      const locationVal = location ? Number(location.avg_price_per_m2) : null;
      return {
        name: hood.name,
        slug: hood.slug,
        description: hood.description ?? null,
        vente: venteVal,
        location: locationVal,
        yieldPct: locationVal ? ((locationVal * 12) / venteVal) * 100 : null,
        vsCityPct: cityAvg ? Math.round((venteVal / cityAvg - 1) * 100) : null,
      };
    })
  );

  if (!stats[0] || !stats[1]) return null;
  return [stats[0], stats[1]];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ville: string; duo: string }>;
}): Promise<Metadata> {
  const { ville, duo } = await params;
  const slugs = parseDuo(duo);
  const city = await getCityBySlug(ville);
  if (!slugs || !city) return { title: "Comparaison introuvable" };
  const stats = await getStats(city.id, slugs);
  if (!stats) return { title: "Comparaison introuvable" };
  const [a, b] = stats;
  return pageMetadata({
    title: `${a.name} ou ${b.name} : où acheter à ${city.name} ?`,
    description: `Comparatif ${a.name} vs ${b.name} (${city.name}) : prix au m², loyers, rendement locatif et profils — pour choisir le bon quartier avec des données.`,
    path: `/comparer/${city.slug}/${duo}`,
    image: ogCard(
      `${a.name} ou ${b.name} ?`,
      `Prix, loyers et rendement comparés à ${city.name}.`,
      city.name
    ),
  });
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ ville: string; duo: string }>;
}) {
  const { ville, duo } = await params;
  const slugs = parseDuo(duo);
  const city = await getCityBySlug(ville);
  if (!slugs || !city) notFound();

  // URL canonique : slugs triés alphabétiquement
  const canonical = duoSlug(slugs[0], slugs[1]);
  if (duo !== canonical) redirect(`/comparer/${city.slug}/${canonical}`);

  const stats = await getStats(city.id, slugs);
  if (!stats) notFound();
  const [a, b] = stats;

  const cheaper = a.vente! <= b.vente! ? a : b;
  const pricier = a.vente! <= b.vente! ? b : a;
  const diffPct = Math.round((pricier.vente! / cheaper.vente! - 1) * 100);
  const betterYield =
    a.yieldPct != null && b.yieldPct != null
      ? a.yieldPct >= b.yieldPct
        ? a
        : b
      : null;
  const closeCall = diffPct < 8;

  const rows: { label: string; a: string; b: string }[] = [
    {
      label: "Prix de vente (appartement)",
      a: `${formatNumber(a.vente!)} MAD/m²`,
      b: `${formatNumber(b.vente!)} MAD/m²`,
    },
    {
      label: "Loyer mensuel",
      a: a.location ? `${formatNumber(a.location)} MAD/m²` : "—",
      b: b.location ? `${formatNumber(b.location)} MAD/m²` : "—",
    },
    {
      label: "Rendement locatif brut",
      a: a.yieldPct != null ? `${a.yieldPct.toFixed(1)} %` : "—",
      b: b.yieldPct != null ? `${b.yieldPct.toFixed(1)} %` : "—",
    },
    {
      label: `Position vs moyenne ${city.name}`,
      a: a.vsCityPct != null ? `${a.vsCityPct > 0 ? "+" : ""}${a.vsCityPct} %` : "—",
      b: b.vsCityPct != null ? `${b.vsCityPct > 0 ? "+" : ""}${b.vsCityPct} %` : "—",
    },
  ];

  const faqs: Faq[] = [
    {
      question: `Quel quartier est le moins cher : ${a.name} ou ${b.name} ?`,
      answer: `${cheaper.name} est le plus abordable des deux : ${formatNumber(cheaper.vente!)} MAD/m² en moyenne pour un appartement, contre ${formatNumber(pricier.vente!)} MAD/m² à ${pricier.name}, soit un écart d'environ ${diffPct} %.`,
    },
    betterYield && {
      question: `Où le rendement locatif est-il meilleur ?`,
      answer: `Sur la base des loyers et prix moyens constatés, ${betterYield.name} offre le meilleur rendement locatif brut estimé (${betterYield.yieldPct!.toFixed(1)} %). Le rendement net dépendra des charges, de la vacance et de la fiscalité de votre situation.`,
    },
    {
      question: `${a.name} ou ${b.name} : lequel choisir pour y vivre ?`,
      answer: `Au-delà des chiffres, tout dépend de votre mode de vie${a.description && b.description ? ` — les deux quartiers ont des personnalités différentes (voir profils ci-dessus)` : ""}. Décrivez-nous votre projet (famille, trajets, budget) : nous connaissons les deux secteurs rue par rue et vous dirons honnêtement lequel correspond.`,
    },
  ].filter(Boolean) as Faq[];

  const cityRows = await getCityPriceData(city.id);
  const otherSlugs = [
    ...new Set(
      cityRows
        .filter((r) => r.transaction === "vente" && r.property_type === "appartement")
        .map((r) => r.neighborhood.slug)
    ),
  ].filter((s) => s !== a.slug && s !== b.slug);
  const relatedPairs = [
    ...otherSlugs.slice(0, 3).map((s) => duoSlug(a.slug, s)),
    ...otherSlugs.slice(0, 3).map((s) => duoSlug(b.slug, s)),
  ];

  return (
    <>
      <section className="hero-surface">
        <div className="wrap py-10 sm:py-14">
          <Breadcrumbs
            items={[
              { name: "Accueil", path: "/" },
              { name: `Prix ${city.name}`, path: `/prix-immobilier/${city.slug}` },
              { name: `${a.name} vs ${b.name}`, path: `/comparer/${city.slug}/${canonical}` },
            ]}
          />
          <div className="mt-6 max-w-3xl">
            <p className="kicker">
              <Scale className="h-4 w-4" aria-hidden />
              Comparatif · {city.name}
            </p>
            <h1 className="h-display">
              {a.name} ou {b.name} : où acheter ?
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-ink/70">
              {closeCall ? (
                <>
                  Deux quartiers aux prix proches ({diffPct} % d&apos;écart) : le
                  choix se jouera sur le style de vie plus que sur le budget.
                </>
              ) : (
                <>
                  <strong>{formatNumber(cheaper.vente!)} MAD/m²</strong> à{" "}
                  {cheaper.name} contre{" "}
                  <strong>{formatNumber(pricier.vente!)} MAD/m²</strong> à{" "}
                  {pricier.name} : {diffPct} % d&apos;écart qui traduisent deux
                  réalités différentes. Voici les chiffres pour trancher.
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Tableau comparatif */}
      <section className="wrap py-10 sm:py-14">
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[560px] text-[14.5px]">
            <thead>
              <tr className="bg-primary-soft text-left">
                <th className="px-5 py-4 text-[12px] font-bold tracking-wide text-ink/55 uppercase">
                  Indicateur
                </th>
                <th className="font-display px-5 py-4 text-[16px] font-bold text-primary">
                  {a.name}
                </th>
                <th className="font-display px-5 py-4 text-[16px] font-bold text-primary">
                  {b.name}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-line/70">
                  <td className="px-5 py-3.5 font-semibold text-ink/70">{row.label}</td>
                  <td className="px-5 py-3.5 font-bold text-ink">{row.a}</td>
                  <td className="px-5 py-3.5 font-bold text-ink">{row.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12.5px] text-ink/45">
          Moyennes constatées pour un appartement — chaque bien mérite une analyse
          individuelle.
        </p>
      </section>

      {/* Profils */}
      {(a.description || b.description) && (
        <section className="wrap pb-6">
          <h2 className="h-section mb-6">Deux personnalités</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {[a, b].map(
              (hood) =>
                hood.description && (
                  <Reveal key={hood.slug}>
                    <div className="card h-full p-6">
                      <h3 className="font-display text-[17px] font-bold text-ink">
                        {hood.name}
                      </h3>
                      <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink/70">
                        {hood.description}
                      </p>
                      <Link
                        href={`/quartiers/${city.slug}/${hood.slug}`}
                        className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-primary hover:underline"
                      >
                        Tout sur {hood.name}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </div>
                  </Reveal>
                )
            )}
          </div>
        </section>
      )}

      {/* Verdict */}
      <section className="wrap py-10">
        <Reveal>
          <div className="dark-surface rounded-3xl p-8 text-white sm:p-10">
            <h2 className="font-display text-xl font-bold sm:text-2xl">
              Notre lecture
            </h2>
            <div className="mt-4 max-w-3xl space-y-3 text-[15px] leading-relaxed text-white/80">
              {closeCall ? (
                <p>
                  À prix comparables, la vraie question est votre quotidien :
                  ambiance, trajets, écoles, commerces. {a.name} et {b.name} se
                  départagent sur le terrain, pas sur le tableur — une visite des
                  deux en une après-midi suffit souvent à trancher.
                </p>
              ) : (
                <>
                  <p>
                    <strong>Budget maîtrisé ou investissement locatif :</strong>{" "}
                    {cheaper.name} offre le meilleur ticket d&apos;entrée
                    {betterYield?.slug === cheaper.slug && betterYield.yieldPct
                      ? ` et le meilleur rendement brut estimé (${betterYield.yieldPct.toFixed(1)} %)`
                      : ""}
                    . À surface égale, l&apos;économie représente environ{" "}
                    {formatNumber(Math.round(((pricier.vente! - cheaper.vente!) * 90) / 10_000) * 10_000)}{" "}
                    MAD sur un 90 m².
                  </p>
                  <p>
                    <strong>Patrimoine et revente :</strong> {pricier.name} paie son
                    standing — une demande plus profonde, souvent une meilleure
                    liquidité à la revente. Les {diffPct} % d&apos;écart sont le prix
                    de cette sécurité.
                  </p>
                </>
              )}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/avant-premiere" className="btn-accent">
                Être alerté sur ces quartiers
                <ArrowRight className="h-4.5 w-4.5" aria-hidden />
              </Link>
              <Link
                href="/estimer-mon-bien"
                className="btn border border-white/25 text-white hover:bg-white/10"
              >
                J&apos;y possède un bien : l&apos;estimer
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="wrap py-8">
        <Reveal>
          <FaqBlock faqs={faqs} title={`${a.name} vs ${b.name} : vos questions`} />
        </Reveal>
      </section>

      {/* Autres comparaisons */}
      {relatedPairs.length > 0 && (
        <section className="wrap pb-16">
          <h2 className="font-display mb-4 text-lg font-bold text-ink">
            Poursuivre la comparaison
          </h2>
          <div className="flex flex-wrap gap-2">
            {[...new Set(relatedPairs)].map((pair) => {
              const [pa, pb] = parseDuo(pair)!;
              return (
                <Link
                  key={pair}
                  href={`/comparer/${city.slug}/${pair}`}
                  className="rounded-full border border-line bg-white px-4 py-2 text-[13.5px] font-medium text-ink/75 capitalize transition hover:border-primary hover:text-primary"
                >
                  {pa.replace(/-/g, " ")} vs {pb.replace(/-/g, " ")}
                </Link>
              );
            })}
            <Link
              href={`/prix-immobilier/${city.slug}`}
              className="rounded-full border border-line bg-white px-4 py-2 text-[13.5px] font-medium text-primary transition hover:border-primary"
            >
              Tous les prix à {city.name} →
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
