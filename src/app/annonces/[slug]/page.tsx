import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Bath,
  BedDouble,
  Check,
  DoorOpen,
  Maximize,
  TrendingUp,
} from "lucide-react";
import { site } from "../../../../site.config";
import {
  getActiveListingSlugs,
  getListingBySlug,
  getNeighborhoodPriceData,
  getSimilarListings,
} from "@/lib/data";
import {
  formatListingPrice,
  formatNumber,
  formatPricePerM2,
} from "@/lib/format";
import { listingJsonLd, pageMetadata } from "@/lib/seo";
import { waLink, waMessages } from "@/lib/whatsapp";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { LeadForm } from "@/components/LeadForm";
import { ListingGallery } from "@/components/ListingGallery";
import { AgentCard } from "@/components/AgentCard";
import { ListingCard } from "@/components/ListingCard";
import { ListingMap } from "@/components/map/ListingMap";
import { WaButton } from "@/components/WaButton";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export const revalidate = 1800;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getActiveListingSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return { title: "Annonce introuvable" };
  const location = [listing.neighborhood?.name, listing.city?.name]
    .filter(Boolean)
    .join(", ");
  return pageMetadata({
    title: `${listing.title} — ${formatListingPrice(listing.price, listing.transaction)}`,
    description: `${listing.property_type} ${listing.transaction === "vente" ? "à vendre" : "à louer"} à ${location} : ${listing.area_m2 ?? "—"} m², ${listing.rooms ?? "—"} pièces. Réf. ${listing.ref}. Visite rapide, réponse WhatsApp ${site.agent.responseTime.toLowerCase()}.`,
    path: `/annonces/${listing.slug}`,
    image: listing.images?.[0]?.url,
  });
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const [similar, hoodPrices] = await Promise.all([
    getSimilarListings(listing),
    listing.neighborhood_id
      ? getNeighborhoodPriceData(listing.neighborhood_id)
      : Promise.resolve([]),
  ]);

  const marketRow = hoodPrices.find(
    (r) =>
      r.property_type === listing.property_type &&
      r.transaction === listing.transaction
  );
  const pricePerM2 =
    listing.area_m2 && listing.area_m2 > 0
      ? Math.round(listing.price / listing.area_m2)
      : null;

  const mapLat = marketRow?.neighborhood?.lat ?? null;
  const mapLng = marketRow?.neighborhood?.lng ?? null;
  const location = [listing.neighborhood?.name, listing.city?.name]
    .filter(Boolean)
    .join(", ");

  const specs = [
    listing.area_m2 != null && {
      icon: Maximize,
      label: "Surface",
      value: `${listing.area_m2} m²`,
    },
    listing.rooms != null && {
      icon: DoorOpen,
      label: "Pièces",
      value: String(listing.rooms),
    },
    listing.bedrooms != null && {
      icon: BedDouble,
      label: "Chambres",
      value: String(listing.bedrooms),
    },
    listing.bathrooms != null && {
      icon: Bath,
      label: "Salles de bains",
      value: String(listing.bathrooms),
    },
  ].filter(Boolean) as { icon: typeof Maximize; label: string; value: string }[];

  return (
    <div className="wrap py-8 sm:py-12">
      <JsonLd data={listingJsonLd(listing)} />
      <Breadcrumbs
        items={[
          { name: "Accueil", path: "/" },
          { name: "Annonces", path: "/annonces" },
          { name: listing.title, path: `/annonces/${listing.slug}` },
        ]}
      />

      {/* Galerie */}
      <div className="mt-5">
        <ListingGallery
          images={listing.images ?? []}
          title={listing.title}
          badge={`${listing.transaction === "vente" ? "À vendre" : "À louer"} · Réf. ${listing.ref}`}
        />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        {/* Colonne contenu */}
        <div>
          <h1 className="h-display !text-[26px] sm:!text-3xl lg:!text-4xl">
            {listing.title}
          </h1>
          {location && <p className="mt-2 text-[15px] text-ink/60">{location}</p>}
          <p className="font-display mt-4 text-3xl font-bold text-primary">
            {formatListingPrice(listing.price, listing.transaction, listing.currency)}
            {pricePerM2 && (
              <span className="ml-3 align-middle text-[14px] font-semibold text-ink/50">
                soit {formatNumber(pricePerM2)} MAD/m²
              </span>
            )}
          </p>

          {/* Specs */}
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {specs.map((spec) => (
              <div key={spec.label} className="card px-4 py-3.5">
                <dt className="flex items-center gap-1.5 text-[12px] font-semibold tracking-wide text-ink/55 uppercase">
                  <spec.icon className="h-4 w-4 text-primary/70" aria-hidden />
                  {spec.label}
                </dt>
                <dd className="font-display mt-1 text-lg font-bold text-ink">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Contexte marché */}
          {marketRow && pricePerM2 && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary-soft p-5">
              <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <p className="text-[14.5px] leading-relaxed text-ink/80">
                Prix moyen constaté pour un {listing.property_type} en{" "}
                {listing.transaction} à {listing.neighborhood?.name} :{" "}
                <strong>
                  {formatPricePerM2(
                    Number(marketRow.avg_price_per_m2),
                    listing.transaction
                  )}
                </strong>
                . Ce bien est affiché à {formatNumber(pricePerM2)} MAD/m² —{" "}
                {pricePerM2 <= Number(marketRow.avg_price_per_m2)
                  ? "sous la moyenne du quartier."
                  : "au-dessus de la moyenne du quartier, justifié par ses prestations."}{" "}
                <a href="/prix-immobilier" className="font-semibold text-primary underline underline-offset-2">
                  Voir la carte des prix
                </a>
              </p>
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <div className="mt-8">
              <h2 className="h-section !text-xl">Description</h2>
              <div className="mt-3 space-y-4 text-[15.5px] leading-relaxed text-ink/80">
                {listing.description.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          )}

          {/* Prestations */}
          {listing.features.length > 0 && (
            <div className="mt-8">
              <h2 className="h-section !text-xl">Prestations</h2>
              <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {listing.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2.5 text-[14.5px] text-ink/80"
                  >
                    <Check className="h-4.5 w-4.5 shrink-0 text-accent" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Carte */}
          {mapLat != null && mapLng != null && (
            <div className="mt-8">
              <h2 className="h-section !text-xl">Localisation</h2>
              <p className="mt-2 mb-4 text-[14px] text-ink/60">
                {location} — position indicative au niveau du quartier.
              </p>
              <ListingMap
                lat={mapLat}
                lng={mapLng}
                label={listing.neighborhood?.name ?? location}
              />
            </div>
          )}
        </div>

        {/* Colonne conversion */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink">
              Visiter ce bien
            </h2>
            <p className="mt-1 mb-5 text-[13.5px] text-ink/60">
              Laissez vos coordonnées — nous organisons la visite sous 24 h.
            </p>
            <LeadForm
              source="listing"
              sourceRef={listing.ref}
              city={listing.city?.name ?? site.defaultCity}
              payload={{ listing_slug: listing.slug, listing_title: listing.title }}
              cta="Demander une visite"
            />
            <div className="my-5 flex items-center gap-3 text-[12px] font-semibold tracking-wide text-ink/40 uppercase">
              <span className="h-px flex-1 bg-line" />
              ou
              <span className="h-px flex-1 bg-line" />
            </div>
            <WaButton
              href={waLink(waMessages.listing(listing.title, listing.ref))}
              placement="listing_sidebar"
            >
              <WhatsAppIcon className="h-5 w-5" />
              WhatsApp direct
            </WaButton>
            <div className="mt-5">
              <AgentCard compact />
            </div>
          </div>
        </aside>
      </div>

      {/* Biens similaires */}
      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="h-section">Biens similaires</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
