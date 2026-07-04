import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { insertLead, notifyOwner, sendReportEmail, type LeadInput } from "@/lib/leads";
import { getCityBySlug } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";
import { waLink, waMessages } from "@/lib/whatsapp";
import type { LeadSource } from "@/lib/types";

const VALID_SOURCES: LeadSource[] = [
  "valuation",
  "simulator",
  "price_map",
  "listing",
  "contact",
  "blog",
];

export async function POST(request: Request) {
  if (!rateLimit(`leads:${clientIp(request)}`)) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  // Honeypot : les bots remplissent le champ caché — on répond OK sans insérer.
  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ leadId: "ok", whatsappUrl: "" });
  }

  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const source = String(body.source ?? "contact") as LeadSource;

  if (name.length < 2 || phone.length < 8) {
    return NextResponse.json({ error: "name and phone required" }, { status: 400 });
  }
  if (!VALID_SOURCES.includes(source)) {
    return NextResponse.json({ error: "invalid source" }, { status: 400 });
  }

  const input: LeadInput = {
    name,
    phone,
    email: typeof body.email === "string" ? body.email.trim() : null,
    message: typeof body.message === "string" ? body.message.trim() : null,
    source,
    sourceRef: typeof body.sourceRef === "string" ? body.sourceRef : null,
    city: typeof body.city === "string" ? body.city : null,
    payload:
      body.payload && typeof body.payload === "object"
        ? (body.payload as Record<string, unknown>)
        : {},
  };

  // Lead « carte des prix » : le rapport de marché est le livrable promis.
  let reportPath: string | null = null;
  let reportCityName: string | null = null;
  if (source === "price_map" && input.sourceRef) {
    const reportCity = await getCityBySlug(input.sourceRef);
    if (reportCity) {
      reportPath = `/rapport/${reportCity.slug}`;
      reportCityName = reportCity.name;
      input.payload = { ...input.payload, report_path: reportPath };
    }
  }

  try {
    const leadId = await insertLead(input);
    await notifyOwner(input);
    if (reportPath && reportCityName && input.email) {
      await sendReportEmail(input.email, name, reportCityName, absoluteUrl(reportPath));
    }
    return NextResponse.json({
      leadId,
      whatsappUrl: waLink(waMessages.afterLead(name)),
      reportUrl: reportPath ?? undefined,
    });
  } catch (err) {
    console.error("[api/leads]", err);
    return NextResponse.json({ error: "insert failed" }, { status: 500 });
  }
}
