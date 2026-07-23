import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, BarChart3, MapPinned, TrendingUp } from "lucide-react";
import { site } from "../../../../site.config";
import { getCities, getCityBySlug, getCityPriceData } from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { waLink } from "@/lib/whatsapp";
import { buildPricePoints } from "@/components/CityPriceBlock";
import { WaButton } from "@/components/WaButton";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { AgentCard } from "@/components/AgentCard";

export const revalidate = 21600;
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
  if (!city) return { title: "Rapport introuvable" };
  return pageMetadata({
    title: `Rapport du marché immobilier — ${city.name}`,
    description: `Rapport complet du marché de ${city.name} : prix au m² par quartier, écarts, tendances et recommandations.`,
    path: `/rapport/${city.slug}`,
    noindex: true, // livrable réservé aux leads : accessible par lien uniquement
  });
}

export default async function CityReportPage({
  params,
}: {
  params: Promise<{ ville: string }>;
}) {
  const { ville } = await params;
  const city = await getCityBySlug(ville);
  if (!city) notFound();

  const rows = await getCityPriceData(city.id);
  const points = buildPricePoints(city, rows);
  if (points.length === 0) notFound();

  const venteValues = points
    .map((p) => p.vente)
    .filter((v): v is number => v != null);
  const avg = Math.round(venteValues.reduce((a, b) => a + b, 0) / venteValues.length);
  const priciest = points.find((p) => p.vente != null);
  const cheapest = [...points].reverse().find((p) => p.vente != null);
  const spreadPct =
    priciest?.vente && cheapest?.vente
      ? Math.round((priciest.vente / cheapest.vente - 1) * 100)
      : null;

  return (
    <div className="pb-16">
      <header className="dark-surface text-white">
        <div className="wrap py-12 sm:py-16">
          <p className="kicker !text-accent">Rapport du marché immobilier</p>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {city.name}
            {city.region && <span className="text-white/60"> · {city.region}</span>}
          </h1>
          <p className="mt-3 max-w-xl text-[15px] text-white/70">
            Préparé par {site.brandName} — {points.length} quartiers analysés,
            données actualisées en continu.
          </p>
        </div>
      </header>

      <div className="wrap">
        {/* Indicateurs */}
        <section className="-mt-8 grid gap-4 sm:grid-cols-3 print:mt-6">
          <div className="card p-6">
            <p className="flex items-center gap-2 text-[12.5px] font-bold tracking-wide text-ink/55 uppercase">
              <BarChart3 className="h-4 w-4 text-primary" aria-hidden />
              Prix moyen (appartement)
            </p>
            <p className="font-display mt-2 text-3xl font-bold text-primary">
              {formatNumber(avg)}
              <span className="ml-1 text-[14px] font-semibold text-ink/50">MAD/m²</span>
            </p>
          </div>
          {priciest?.vente && (
            <div className="card p-6">
              <p className="flex items-center gap-2 text-[12.5px] font-bold tracking-wide text-ink/55 uppercase">
                <TrendingUp className="h-4 w-4 text-primary" aria-hidden />
                Quartier le plus valorisé
              </p>
              <p className="font-display mt-2 text-xl font-bold text-ink">
                {priciest.name}
              </p>
              <p className="mt-1 text-[13px] font-bold text-primary">
                {formatNumber(priciest.vente)} MAD/m²
              </p>
            </div>
          )}
          {cheapest?.vente && spreadPct != null && (
            <div className="card p-6">
              <p className="flex items-center gap-2 text-[12.5px] font-bold tracking-wide text-ink/55 uppercase">
                <MapPinned className="h-4 w-4 text-primary" aria-hidden />
                Meilleur point d&apos;entrée
              </p>
              <p className="font-display mt-2 text-xl font-bold text-ink">
                {cheapest.name}
              </p>
              <p className="mt-1 text-[13px] text-ink/55">
                {formatNumber(cheapest.vente)} MAD/m² — écart de {spreadPct} % entre
                quartiers
              </p>
            </div>
          )}
        </section>

        {/* Tableau complet */}
        <section className="mt-12">
          <h2 className="h-section !text-xl">
            Prix par quartier à {city.name}
          </h2>
          <div className="card mt-4 overflow-hidden">
            <table className="w-full text-[12.5px] sm:text-[14px]">
              <thead className="bg-primary-soft text-left text-[11px] tracking-wide text-ink/55 uppercase sm:text-[12px]">
                <tr>
                  <th className="px-3 py-3 font-bold sm:px-5">Quartier</th>
                  <th className="px-3 py-3 font-bold sm:px-5">Vente</th>
                  <th className="px-3 py-3 font-bold sm:px-5">Location</th>
                  <th className="hidden px-5 py-3 font-bold md:table-cell">vs moyenne</th>
                  <th className="px-3 py-3 font-bold sm:px-5 print:hidden">Détail</th>
                </tr>
              </thead>
              <tbody>
                {points.map((point) => {
                  const diff =
                    point.vente != null
                      ? Math.round((point.vente / avg - 1) * 100)
                      : null;
                  return (
                    <tr key={point.slug} className="border-t border-line/70">
                      <td className="px-3 py-3 font-semibold text-ink sm:px-5">
                        {point.name}
                      </td>
                      <td className="px-3 py-3 font-bold text-primary sm:px-5">
                        {point.vente ? `${formatNumber(point.vente)} MAD/m²` : "—"}
                      </td>
                      <td className="px-3 py-3 text-ink/70 sm:px-5">
                        {point.location
                          ? `${formatNumber(point.location)} MAD/m²/mois`
                          : "—"}
                      </td>
                      <td className="hidden px-5 py-3 md:table-cell">
                        {diff != null ? (
                          <span
                            className={`font-bold ${diff >= 0 ? "text-accent-deep" : "text-primary"}`}
                          >
                            {diff > 0 ? "+" : ""}
                            {diff} %
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-3 sm:px-5 print:hidden">
                        <Link
                          href={`/rapport/${city.slug}/${point.slug}`}
                          className="inline-flex items-center gap-1 py-1 text-[13px] font-semibold text-primary hover:underline"
                        >
                          Voir
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-14 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="dark-surface rounded-3xl p-8 text-white sm:p-10">
            <h2 className="font-display text-xl font-bold sm:text-2xl">
              Un projet à {city.name} ?
            </h2>
            <p className="mt-3 max-w-lg text-[14.5px] leading-relaxed text-white/80">
              Ces moyennes cachent de forts écarts d&apos;une rue à l&apos;autre.
              Pour un prix précis — à l&apos;achat comme à la vente — parlons de
              votre bien : c&apos;est gratuit et sans engagement.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row print:hidden">
              <Link href="/estimer-mon-bien" className="btn-accent">
                Estimer mon bien
                <ArrowRight className="h-4.5 w-4.5" aria-hidden />
              </Link>
              <WaButton
                href={waLink(
                  `Bonjour ${site.brandName}, j'ai consulté votre rapport sur ${city.name} et j'aimerais en discuter.`
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
              expertise immobilière.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
