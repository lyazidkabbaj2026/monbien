import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Star } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import type { Listing } from "@/lib/types";
import { formatListingPrice } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Gestion des annonces",
  description: "Espace propriétaire.",
  path: "/admin/annonces",
  noindex: true,
});

const STATUS_BADGES: Record<Listing["status"], { label: string; cls: string }> = {
  active: { label: "En ligne", cls: "bg-green-600/10 text-green-700" },
  draft: { label: "Brouillon", cls: "bg-ink/8 text-ink/55" },
  sold: { label: "Vendu", cls: "bg-accent/10 text-accent-deep" },
};

export default async function AdminListingsPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data } = await supabase
    .from("listings")
    .select("*, city:cities(name,slug), neighborhood:neighborhoods(name,slug)")
    .order("created_at", { ascending: false });
  const listings = (data as Listing[]) ?? [];

  return (
    <div className="wrap py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Annonces</h1>
          <p className="mt-1 text-[13.5px] text-ink/55">
            {listings.length} bien{listings.length > 1 ? "s" : ""} ·{" "}
            {listings.filter((l) => l.status === "active").length} en ligne
          </p>
        </div>
        <Link href="/admin/annonces/nouvelle" className="btn-accent !px-5 !py-2.5 text-[14px]">
          <Plus className="h-4.5 w-4.5" aria-hidden />
          Nouvelle annonce
        </Link>
      </div>

      <div className="card mt-6 divide-y divide-line/70">
        {listings.length === 0 && (
          <p className="px-5 py-10 text-center text-[14px] text-ink/50">
            Aucune annonce. Créez la première !
          </p>
        )}
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/admin/annonces/${listing.id}`}
            className="flex items-center gap-4 px-4 py-3.5 transition hover:bg-sand"
          >
            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-sand-deep">
              {listing.images?.[0] && (
                <Image
                  src={listing.images[0].url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-[14.5px] font-bold text-ink">
                {listing.is_featured && (
                  <Star className="h-3.5 w-3.5 shrink-0 fill-accent text-accent" aria-hidden />
                )}
                {listing.title}
              </p>
              <p className="mt-0.5 text-[12.5px] text-ink/55">
                {listing.ref} · {listing.neighborhood?.name ?? listing.city?.name} ·{" "}
                {formatListingPrice(listing.price, listing.transaction, listing.currency)}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-bold ${STATUS_BADGES[listing.status].cls}`}
            >
              {STATUS_BADGES[listing.status].label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
