import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { getCities, getNeighborhoods } from "@/lib/data";
import type { Listing, Neighborhood } from "@/lib/types";
import { ListingForm } from "@/components/admin/ListingForm";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Modifier une annonce",
  description: "Espace propriétaire.",
  path: "/admin/annonces",
  noindex: true,
});

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!listing) notFound();

  const cities = await getCities();
  const hoodEntries = await Promise.all(
    cities.map(async (city) => [city.id, await getNeighborhoods(city.id)] as const)
  );
  const neighborhoods: Record<string, Neighborhood[]> = Object.fromEntries(hoodEntries);

  return (
    <div className="wrap max-w-3xl py-8">
      <h1 className="font-display mb-6 text-2xl font-bold text-ink">
        Modifier l&apos;annonce
      </h1>
      <ListingForm
        initial={listing as Listing}
        cities={cities}
        neighborhoods={neighborhoods}
      />
    </div>
  );
}
