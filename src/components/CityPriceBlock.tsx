import Link from "next/link";
import type { City, PriceDataWithHood } from "@/lib/types";
import { formatNumber } from "@/lib/format";
import { PriceMap, type PricePoint } from "./map/PriceMap";

/** Agrège price_data par quartier (appartement en priorité) pour la carte + le tableau. */
export function buildPricePoints(
  city: City,
  rows: PriceDataWithHood[]
): PricePoint[] {
  const byHood = new Map<string, { name: string; slug: string; lat: number | null; lng: number | null; vente: number | null; location: number | null }>();

  for (const row of rows) {
    const hood = row.neighborhood;
    if (!hood) continue;
    const entry = byHood.get(hood.slug) ?? {
      name: hood.name,
      slug: hood.slug,
      lat: hood.lat,
      lng: hood.lng,
      vente: null,
      location: null,
    };
    const value = Number(row.avg_price_per_m2);
    // priorité aux appartements ; sinon on garde la première valeur du quartier
    if (row.transaction === "vente") {
      if (row.property_type === "appartement" || entry.vente == null) entry.vente = value;
    } else {
      if (row.property_type === "appartement" || entry.location == null)
        entry.location = value;
    }
    byHood.set(hood.slug, entry);
  }

  return [...byHood.values()]
    .filter((e) => e.lat != null && e.lng != null)
    .sort((a, b) => (b.vente ?? 0) - (a.vente ?? 0))
    .map((e) => ({
      name: e.name,
      slug: e.slug,
      lat: e.lat!,
      lng: e.lng!,
      vente: e.vente,
      location: e.location,
      href: `/quartiers/${city.slug}/${e.slug}`,
    }));
}

export function CityPriceBlock({ city, points }: { city: City; points: PricePoint[] }) {
  if (points.length === 0) {
    return (
      <p className="card p-6 text-[14.5px] text-ink/60">
        Les données de prix pour {city.name} arrivent bientôt. Contactez-nous pour
        une estimation personnalisée.
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      {city.lat != null && city.lng != null && (
        <PriceMap center={[city.lat, city.lng]} points={points} />
      )}
      <div className="card overflow-hidden">
        <table className="w-full text-[13.5px]">
          <caption className="sr-only">
            Prix moyen au m² par quartier à {city.name}
          </caption>
          <thead className="bg-primary-soft text-left text-[12.5px] tracking-wide text-ink/60 uppercase">
            <tr>
              <th className="px-4 py-3 font-bold">Quartier</th>
              <th className="px-4 py-3 font-bold">Vente</th>
              <th className="px-4 py-3 font-bold">Location</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.slug} className="border-t border-line/70 transition hover:bg-sand">
                <td className="px-4 py-3">
                  <Link
                    href={point.href}
                    className="font-semibold text-primary hover:underline"
                  >
                    {point.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink/80">
                  {point.vente ? (
                    <>
                      <strong>{formatNumber(point.vente)}</strong>{" "}
                      <span className="text-ink/50">MAD/m²</span>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-ink/80">
                  {point.location ? (
                    <>
                      <strong>{formatNumber(point.location)}</strong>{" "}
                      <span className="text-ink/50">MAD/m²/mois</span>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
