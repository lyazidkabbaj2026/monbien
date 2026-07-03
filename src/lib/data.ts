import { supabasePublic } from "./supabase/public";
import type {
  BlogPost,
  City,
  Listing,
  Neighborhood,
  PriceDataWithHood,
  Transaction,
} from "./types";

const LISTING_SELECT =
  "*, city:cities(name,slug), neighborhood:neighborhoods(name,slug)";

// ------------------------------------------------------------------ villes

export async function getCities(): Promise<City[]> {
  const { data } = await supabasePublic()
    .from("cities")
    .select("*")
    .eq("is_active", true)
    .order("name");
  return (data as City[]) ?? [];
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  const { data } = await supabasePublic()
    .from("cities")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (data as City) ?? null;
}

export async function getNeighborhoods(cityId: string): Promise<Neighborhood[]> {
  const { data } = await supabasePublic()
    .from("neighborhoods")
    .select("*")
    .eq("city_id", cityId)
    .order("name");
  return (data as Neighborhood[]) ?? [];
}

export async function getNeighborhoodBySlug(
  cityId: string,
  slug: string
): Promise<Neighborhood | null> {
  const { data } = await supabasePublic()
    .from("neighborhoods")
    .select("*")
    .eq("city_id", cityId)
    .eq("slug", slug)
    .maybeSingle();
  return (data as Neighborhood) ?? null;
}

export async function getAllNeighborhoodsWithCity(): Promise<
  (Neighborhood & { city: Pick<City, "name" | "slug"> })[]
> {
  const { data } = await supabasePublic()
    .from("neighborhoods")
    .select("*, city:cities(name,slug)")
    .order("name");
  return (data as (Neighborhood & { city: Pick<City, "name" | "slug"> })[]) ?? [];
}

// ------------------------------------------------------------------- prix

/** Toutes les lignes price_data des quartiers d'une ville. */
export async function getCityPriceData(cityId: string): Promise<PriceDataWithHood[]> {
  const { data } = await supabasePublic()
    .from("price_data")
    .select("*, neighborhood:neighborhoods!inner(id,name,slug,lat,lng,city_id)")
    .eq("neighborhood.city_id", cityId);
  return (data as PriceDataWithHood[]) ?? [];
}

export async function getNeighborhoodPriceData(
  neighborhoodId: string
): Promise<PriceDataWithHood[]> {
  const { data } = await supabasePublic()
    .from("price_data")
    .select("*, neighborhood:neighborhoods(id,name,slug,lat,lng,city_id)")
    .eq("neighborhood_id", neighborhoodId);
  return (data as PriceDataWithHood[]) ?? [];
}

/** Moyenne du prix/m² pour une ville + type + transaction (sur ses quartiers). */
export function averagePricePerM2(
  rows: PriceDataWithHood[],
  propertyType: string,
  transaction: Transaction
): number | null {
  const subset = rows.filter(
    (r) => r.property_type === propertyType && r.transaction === transaction
  );
  if (subset.length === 0) return null;
  const total = subset.reduce((sum, r) => sum + Number(r.avg_price_per_m2), 0);
  return Math.round(total / subset.length);
}

// --------------------------------------------------------------- annonces

export interface ListingFilters {
  transaction?: Transaction;
  propertyType?: string;
  citySlug?: string;
  neighborhoodSlug?: string;
  priceMin?: number;
  priceMax?: number;
  roomsMin?: number;
}

const PAGE_SIZE = 12;

export async function getListings(
  filters: ListingFilters = {},
  page = 1
): Promise<{ listings: Listing[]; count: number; pageSize: number }> {
  let query = supabasePublic()
    .from("listings")
    .select(LISTING_SELECT, { count: "exact" })
    .eq("status", "active");

  if (filters.transaction) query = query.eq("transaction", filters.transaction);
  if (filters.propertyType) query = query.eq("property_type", filters.propertyType);
  if (filters.priceMin) query = query.gte("price", filters.priceMin);
  if (filters.priceMax) query = query.lte("price", filters.priceMax);
  if (filters.roomsMin) query = query.gte("rooms", filters.roomsMin);
  if (filters.citySlug) {
    const city = await getCityBySlug(filters.citySlug);
    if (!city) return { listings: [], count: 0, pageSize: PAGE_SIZE };
    query = query.eq("city_id", city.id);
    if (filters.neighborhoodSlug) {
      const hood = await getNeighborhoodBySlug(city.id, filters.neighborhoodSlug);
      if (!hood) return { listings: [], count: 0, pageSize: PAGE_SIZE };
      query = query.eq("neighborhood_id", hood.id);
    }
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await query
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  return {
    listings: (data as Listing[]) ?? [],
    count: count ?? 0,
    pageSize: PAGE_SIZE,
  };
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const { data } = await supabasePublic()
    .from("listings")
    .select(LISTING_SELECT)
    .eq("slug", slug)
    .neq("status", "draft")
    .maybeSingle();
  return (data as Listing) ?? null;
}

export async function getFeaturedListings(limit = 3): Promise<Listing[]> {
  const { data } = await supabasePublic()
    .from("listings")
    .select(LISTING_SELECT)
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as Listing[]) ?? [];
}

export async function getSimilarListings(
  listing: Listing,
  limit = 3
): Promise<Listing[]> {
  const { data } = await supabasePublic()
    .from("listings")
    .select(LISTING_SELECT)
    .eq("status", "active")
    .eq("transaction", listing.transaction)
    .eq("city_id", listing.city_id)
    .neq("id", listing.id)
    .limit(limit);
  return (data as Listing[]) ?? [];
}

export async function getActiveListingSlugs(): Promise<string[]> {
  const { data } = await supabasePublic()
    .from("listings")
    .select("slug")
    .eq("status", "active");
  return (data ?? []).map((r) => r.slug as string);
}

export async function countListings(filters: ListingFilters = {}): Promise<number> {
  const result = await getListings(filters, 1);
  return result.count;
}

// ------------------------------------------------------------------- blog

export async function getPublishedPosts(category?: string): Promise<BlogPost[]> {
  let query = supabasePublic()
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (category) query = query.eq("category", category);
  const { data } = await query;
  return (data as BlogPost[]) ?? [];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data } = await supabasePublic()
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return (data as BlogPost) ?? null;
}

export async function getBlogCategories(): Promise<string[]> {
  const { data } = await supabasePublic()
    .from("blog_posts")
    .select("category")
    .eq("status", "published");
  const set = new Set(
    (data ?? []).map((r) => r.category as string | null).filter(Boolean) as string[]
  );
  return [...set].sort();
}
