import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { supabasePublic } from "@/lib/supabase/public";
import { computeEstimate, type PropertyCondition } from "@/lib/valuation";
import { notifyOwner } from "@/lib/leads";
import { waLink, waMessages } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/format";

const CONDITIONS: PropertyCondition[] = ["neuf", "bon", "a_renover"];

export async function POST(request: Request) {
  if (!rateLimit(`valuation:${clientIp(request)}`)) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  // Honeypot anti-spam
  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ low: 0, high: 0, whatsappUrl: "" });
  }

  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const cityId = String(body.cityId ?? "");
  const neighborhoodId =
    typeof body.neighborhoodId === "string" && body.neighborhoodId
      ? body.neighborhoodId
      : null;
  const propertyType = String(body.propertyType ?? "");
  const areaM2 = Number(body.areaM2);
  const rooms = body.rooms != null ? Number(body.rooms) : null;
  const condition = String(body.condition ?? "bon") as PropertyCondition;

  if (name.length < 2 || phone.length < 8) {
    return NextResponse.json({ error: "contact requis" }, { status: 400 });
  }
  if (!cityId || !propertyType || !Number.isFinite(areaM2) || areaM2 < 10 || areaM2 > 5000) {
    return NextResponse.json({ error: "bien invalide" }, { status: 400 });
  }
  if (!CONDITIONS.includes(condition)) {
    return NextResponse.json({ error: "état invalide" }, { status: 400 });
  }

  const estimate = await computeEstimate({
    cityId,
    neighborhoodId,
    propertyType,
    areaM2,
    rooms,
    condition,
  });

  if (!estimate) {
    return NextResponse.json(
      { error: "Pas encore de données de prix pour cette zone." },
      { status: 422 }
    );
  }

  // Lead + valuation en une RPC SECURITY DEFINER
  const { error } = await supabasePublic().rpc("submit_valuation", {
    p_name: name,
    p_phone: phone,
    p_email: email || null,
    p_city_id: cityId,
    p_neighborhood_id: neighborhoodId,
    p_property_type: propertyType,
    p_area_m2: areaM2,
    p_rooms: rooms,
    p_condition: condition,
    p_estimated_low: estimate.low,
    p_estimated_high: estimate.high,
    p_payload: {
      base_price_per_m2: estimate.basePricePerM2,
      scope: estimate.scope,
    },
  });
  if (error) {
    console.error("[api/valuation]", error);
    return NextResponse.json({ error: "insert failed" }, { status: 500 });
  }

  await notifyOwner(
    {
      name,
      phone,
      email: email || null,
      source: "valuation",
      city: null,
      payload: {},
    },
    {
      Bien: `${propertyType} · ${areaM2} m² · état ${condition}`,
      Estimation: `${formatPrice(estimate.low)} — ${formatPrice(estimate.high)}`,
    }
  );

  return NextResponse.json({
    low: estimate.low,
    high: estimate.high,
    basePricePerM2: estimate.basePricePerM2,
    sampleSize: estimate.sampleSize,
    scope: estimate.scope,
    whatsappUrl: waLink(waMessages.valuation),
  });
}
