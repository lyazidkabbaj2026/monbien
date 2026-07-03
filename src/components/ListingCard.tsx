import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, Maximize } from "lucide-react";
import type { Listing } from "@/lib/types";
import { formatListingPrice } from "@/lib/format";

export function ListingCard({
  listing,
  priority = false,
}: {
  listing: Listing;
  priority?: boolean;
}) {
  const image = listing.images?.[0];
  const location = [listing.neighborhood?.name, listing.city?.name]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="card group overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-16px_rgba(20,24,27,0.25)]">
      <Link href={`/annonces/${listing.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-sand-deep">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt ?? listing.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ink/30">
              Photo à venir
            </div>
          )}
          <span className="absolute top-3 left-3 rounded-full bg-ink/75 px-3 py-1 text-[12px] font-semibold text-white backdrop-blur">
            {listing.transaction === "vente" ? "À vendre" : "À louer"}
          </span>
        </div>
        <div className="p-5">
          <p className="font-display text-[19px] font-bold text-primary">
            {formatListingPrice(listing.price, listing.transaction, listing.currency)}
          </p>
          <h3 className="mt-1.5 line-clamp-2 text-[15.5px] leading-snug font-semibold text-ink">
            {listing.title}
          </h3>
          {location && <p className="mt-1 text-[13.5px] text-ink/55">{location}</p>}
          <ul className="mt-4 flex items-center gap-4 border-t border-line pt-3.5 text-[13px] text-ink/65">
            {listing.area_m2 != null && (
              <li className="flex items-center gap-1.5">
                <Maximize className="h-4 w-4 text-primary/70" aria-hidden />
                {listing.area_m2} m²
              </li>
            )}
            {listing.rooms != null && (
              <li className="flex items-center gap-1.5">
                <BedDouble className="h-4 w-4 text-primary/70" aria-hidden />
                {listing.rooms} pièces
              </li>
            )}
            {listing.bathrooms != null && (
              <li className="flex items-center gap-1.5">
                <Bath className="h-4 w-4 text-primary/70" aria-hidden />
                {listing.bathrooms} sdb
              </li>
            )}
          </ul>
        </div>
      </Link>
    </article>
  );
}
