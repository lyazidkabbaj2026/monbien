import Link from "next/link";
import { SlidersHorizontal, SearchX } from "lucide-react";
import { site, propertyTypes, transactions } from "../../../site.config";
import {
  getCities,
  getListings,
  getNeighborhoods,
  getCityBySlug,
  type ListingFilters,
} from "@/lib/data";
import type { Transaction } from "@/lib/types";
import { pageMetadata } from "@/lib/seo";
import { ListingCard } from "@/components/ListingCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata = pageMetadata({
  title: `Annonces immobilières à ${site.defaultCity} et au Maroc — vente & location`,
  description: `Appartements, villas, maisons à vendre ou à louer à ${site.defaultCity} et dans tout le Maroc. Annonces vérifiées, photos réelles, visite rapide.`,
  path: "/annonces",
});

interface SearchParams {
  transaction?: string;
  type?: string;
  ville?: string;
  quartier?: string;
  prix_min?: string;
  prix_max?: string;
  pieces?: string;
  page?: string;
}

function buildQuery(params: SearchParams, overrides: Record<string, string | undefined>) {
  const merged: Record<string, string> = {};
  for (const [k, v] of Object.entries({ ...params, ...overrides })) {
    if (v) merged[k] = v;
  }
  const qs = new URLSearchParams(merged).toString();
  return qs ? `/annonces?${qs}` : "/annonces";
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const filters: ListingFilters = {
    transaction: transactions.some((t) => t.slug === params.transaction)
      ? (params.transaction as Transaction)
      : undefined,
    propertyType: propertyTypes.some((t) => t.slug === params.type)
      ? params.type
      : undefined,
    citySlug: params.ville || undefined,
    neighborhoodSlug: params.quartier || undefined,
    priceMin: params.prix_min ? Number(params.prix_min) || undefined : undefined,
    priceMax: params.prix_max ? Number(params.prix_max) || undefined : undefined,
    roomsMin: params.pieces ? Number(params.pieces) || undefined : undefined,
  };

  const [cities, result] = await Promise.all([getCities(), getListings(filters, page)]);
  const selectedCity = filters.citySlug ? await getCityBySlug(filters.citySlug) : null;
  const neighborhoods = selectedCity ? await getNeighborhoods(selectedCity.id) : [];

  const totalPages = Math.max(1, Math.ceil(result.count / result.pageSize));

  return (
    <div className="wrap py-8 sm:py-12">
      <Breadcrumbs
        items={[
          { name: "Accueil", path: "/" },
          { name: "Annonces", path: "/annonces" },
        ]}
      />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h-display !text-3xl sm:!text-4xl">Nos annonces immobilières</h1>
          <p className="mt-2 text-[15px] text-ink/60">
            {result.count} bien{result.count > 1 ? "s" : ""} disponible
            {result.count > 1 ? "s" : ""} — chaque annonce est vérifiée sur place.
          </p>
        </div>
      </div>

      {/* Filtres — formulaire GET sans JavaScript */}
      <form
        method="get"
        action="/annonces"
        className="card mt-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-7 lg:items-end"
      >
        <div>
          <label htmlFor="f-transaction" className="label">
            Transaction
          </label>
          <select
            id="f-transaction"
            name="transaction"
            defaultValue={params.transaction ?? ""}
            className="field !py-3"
          >
            <option value="">Toutes</option>
            {transactions.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-type" className="label">
            Type de bien
          </label>
          <select id="f-type" name="type" defaultValue={params.type ?? ""} className="field !py-3">
            <option value="">Tous</option>
            {propertyTypes.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-ville" className="label">
            Ville
          </label>
          <select id="f-ville" name="ville" defaultValue={params.ville ?? ""} className="field !py-3">
            <option value="">Toutes</option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-quartier" className="label">
            Quartier
          </label>
          <select
            id="f-quartier"
            name="quartier"
            defaultValue={params.quartier ?? ""}
            className="field !py-3"
            disabled={neighborhoods.length === 0}
          >
            <option value="">
              {selectedCity ? "Tous" : "Choisir une ville d'abord"}
            </option>
            {neighborhoods.map((n) => (
              <option key={n.slug} value={n.slug}>
                {n.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-prix-max" className="label">
            Budget max (MAD)
          </label>
          <input
            id="f-prix-max"
            type="number"
            name="prix_max"
            min={0}
            step={50000}
            defaultValue={params.prix_max ?? ""}
            placeholder="Ex. 2 000 000"
            className="field !py-3"
          />
        </div>
        <div>
          <label htmlFor="f-pieces" className="label">
            Pièces min
          </label>
          <select id="f-pieces" name="pieces" defaultValue={params.pieces ?? ""} className="field !py-3">
            <option value="">Indifférent</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary !py-3">
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Filtrer
        </button>
      </form>

      {/* Résultats */}
      {result.listings.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.listings.map((listing, i) => (
            <ListingCard key={listing.id} listing={listing} priority={i < 3} />
          ))}
        </div>
      ) : (
        <div className="card mt-8 flex flex-col items-center gap-4 px-6 py-16 text-center">
          <SearchX className="h-10 w-10 text-ink/30" aria-hidden />
          <div>
            <p className="font-display text-lg font-bold text-ink">
              Aucun bien ne correspond à ces critères
            </p>
            <p className="mt-1 text-[14.5px] text-ink/60">
              Élargissez votre recherche, ou dites-nous ce que vous cherchez : nous
              recevons des biens en avant-première.
            </p>
          </div>
          <Link href="/annonces" className="btn-outline">
            Réinitialiser les filtres
          </Link>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildQuery(params, { page: p === 1 ? undefined : String(p) })}
              aria-current={p === page ? "page" : undefined}
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-[14.5px] font-semibold transition ${
                p === page
                  ? "bg-primary text-white"
                  : "border border-line bg-white text-ink/70 hover:border-primary hover:text-primary"
              }`}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}

      {/* CTA vendeur */}
      <aside className="dark-surface mt-14 flex flex-col items-start justify-between gap-6 rounded-3xl p-8 text-white sm:flex-row sm:items-center sm:p-10">
        <div>
          <h2 className="font-display text-xl font-bold sm:text-2xl">
            Vous avez un bien à vendre à {site.defaultCity} ?
          </h2>
          <p className="mt-2 max-w-lg text-[14.5px] text-white/70">
            Nous avons des acheteurs qualifiés en attente. Estimez votre bien
            gratuitement — {site.agent.responseTime.toLowerCase()}.
          </p>
        </div>
        <Link href="/estimer-mon-bien" className="btn-accent shrink-0">
          Estimer mon bien
        </Link>
      </aside>
    </div>
  );
}
