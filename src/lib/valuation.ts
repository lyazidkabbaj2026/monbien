import { supabasePublic } from "./supabase/public";

export type PropertyCondition = "neuf" | "bon" | "a_renover";

const CONDITION_FACTOR: Record<PropertyCondition, number> = {
  neuf: 1.08,
  bon: 1.0,
  a_renover: 0.85,
};

export interface EstimateInput {
  cityId: string;
  neighborhoodId: string | null;
  propertyType: string;
  areaM2: number;
  rooms: number | null;
  condition: PropertyCondition;
}

export interface EstimateResult {
  low: number;
  high: number;
  basePricePerM2: number;
  sampleSize: number;
  scope: "quartier" | "ville";
}

/**
 * Estime une fourchette de prix de vente à partir de price_data :
 * prix/m² du quartier (repli : moyenne de la ville) × surface, ajusté
 * par l'état du bien, ± 7 %.
 */
export async function computeEstimate(
  input: EstimateInput
): Promise<EstimateResult | null> {
  const db = supabasePublic();

  let basePricePerM2: number | null = null;
  let sampleSize = 0;
  let scope: "quartier" | "ville" = "quartier";

  // 1. Prix du quartier pour ce type de bien
  if (input.neighborhoodId) {
    const { data } = await db
      .from("price_data")
      .select("avg_price_per_m2, sample_size")
      .eq("neighborhood_id", input.neighborhoodId)
      .eq("transaction", "vente")
      .eq("property_type", input.propertyType)
      .maybeSingle();
    if (data) {
      basePricePerM2 = Number(data.avg_price_per_m2);
      sampleSize = data.sample_size ?? 0;
    }
  }

  // 2. Repli : moyenne de la ville pour ce type, puis pour un appartement
  if (basePricePerM2 == null) {
    scope = "ville";
    for (const type of [input.propertyType, "appartement"]) {
      const { data } = await db
        .from("price_data")
        .select("avg_price_per_m2, sample_size, neighborhood:neighborhoods!inner(city_id)")
        .eq("neighborhood.city_id", input.cityId)
        .eq("transaction", "vente")
        .eq("property_type", type);
      if (data && data.length > 0) {
        basePricePerM2 =
          data.reduce((sum, r) => sum + Number(r.avg_price_per_m2), 0) / data.length;
        sampleSize = data.reduce((sum, r) => sum + (r.sample_size ?? 0), 0);
        break;
      }
    }
  }

  if (basePricePerM2 == null) return null;

  let adjusted = basePricePerM2 * CONDITION_FACTOR[input.condition];
  // Les très petites surfaces se vendent légèrement mieux au m².
  if (input.areaM2 > 0 && input.areaM2 < 45) adjusted *= 1.04;
  if (input.areaM2 > 250) adjusted *= 0.96;

  const mid = adjusted * input.areaM2;
  const round = (v: number) => Math.round(v / 10000) * 10000 || Math.round(v / 1000) * 1000;

  return {
    low: round(mid * 0.93),
    high: round(mid * 1.07),
    basePricePerM2: Math.round(basePricePerM2),
    sampleSize,
    scope,
  };
}
