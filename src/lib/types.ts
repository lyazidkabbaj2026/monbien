// Types miroirs du schéma Supabase (voir supabase/migrations)

export type Transaction = "vente" | "location";
export type ListingStatus = "active" | "sold" | "draft";
export type LeadStatus = "new" | "contacted" | "won" | "lost";
export type LeadSource =
  | "valuation"
  | "simulator"
  | "price_map"
  | "listing"
  | "contact"
  | "blog";

export interface City {
  id: string;
  name: string;
  slug: string;
  region: string | null;
  lat: number | null;
  lng: number | null;
  is_active: boolean;
}

export interface Neighborhood {
  id: string;
  city_id: string;
  name: string;
  slug: string;
  lat: number | null;
  lng: number | null;
}

export interface PriceData {
  id: string;
  neighborhood_id: string;
  property_type: string;
  transaction: Transaction;
  avg_price_per_m2: number;
  currency: string;
  sample_size: number;
  updated_at: string;
}

export interface PriceDataWithHood extends PriceData {
  neighborhood: Pick<Neighborhood, "id" | "name" | "slug" | "lat" | "lng"> & {
    city_id: string;
  };
}

export interface ListingImage {
  url: string;
  alt?: string;
}

export interface Listing {
  id: string;
  ref: string;
  title: string;
  slug: string;
  description: string | null;
  transaction: Transaction;
  property_type: string;
  city_id: string;
  neighborhood_id: string | null;
  price: number;
  currency: string;
  area_m2: number | null;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  features: string[];
  images: ListingImage[];
  status: ListingStatus;
  is_featured: boolean;
  created_at: string;
  city?: Pick<City, "name" | "slug"> | null;
  neighborhood?: Pick<Neighborhood, "name" | "slug"> | null;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  source: LeadSource;
  source_ref: string | null;
  city: string | null;
  message: string | null;
  payload: Record<string, unknown>;
  status: LeadStatus;
  created_at: string;
}

export interface Valuation {
  id: string;
  lead_id: string | null;
  city_id: string | null;
  neighborhood_id: string | null;
  property_type: string;
  area_m2: number;
  rooms: number | null;
  condition: string | null;
  estimated_low: number;
  estimated_high: number;
  created_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  body_md: string;
  category: string | null;
  tags: string[];
  hero_image: string | null;
  status: "draft" | "published";
  author: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
