import { Resend } from "resend";
import { site } from "../../site.config";
import { supabasePublic } from "./supabase/public";
import type { LeadSource } from "./types";

export interface LeadInput {
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  source: LeadSource;
  sourceRef?: string | null;
  city?: string | null;
  payload?: Record<string, unknown>;
}

const SOURCE_LABELS: Record<LeadSource, string> = {
  valuation: "Estimation de bien",
  simulator: "Simulateur de crédit",
  price_map: "Carte des prix",
  listing: "Annonce",
  contact: "Contact",
  blog: "Blog",
};

/** Insère le lead via la RPC SECURITY DEFINER. Retourne l'id du lead. */
export async function insertLead(input: LeadInput): Promise<string> {
  const { data, error } = await supabasePublic().rpc("submit_lead", {
    p_name: input.name,
    p_phone: input.phone,
    p_email: input.email ?? null,
    p_source: input.source,
    p_source_ref: input.sourceRef ?? null,
    p_city: input.city ?? null,
    p_message: input.message ?? null,
    p_payload: input.payload ?? {},
  });
  if (error) throw new Error(error.message);
  return data as string;
}

/**
 * Envoie le rapport de marché au lead par email (silencieux si
 * RESEND_API_KEY absent — le lien reste affiché sur le site et
 * envoyable en un clic depuis /admin).
 */
export async function sendReportEmail(
  email: string,
  name: string,
  cityName: string,
  reportUrl: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.LEAD_NOTIFICATION_FROM || `${site.brandName} <onboarding@resend.dev>`,
      to: email,
      subject: `Votre rapport du marché immobilier — ${cityName}`,
      html: `<div style="font-family:system-ui,sans-serif;max-width:560px">
        <h2 style="color:#0F4C5C">Bonjour ${name},</h2>
        <p style="font-size:15px;line-height:1.6">Comme promis, voici votre rapport complet du marché immobilier de <strong>${cityName}</strong> : prix au m² par quartier, écarts, rendements et recommandations.</p>
        <p style="margin:24px 0"><a href="${reportUrl}" style="background:#E36414;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700">Consulter mon rapport</a></p>
        <p style="font-size:14px;line-height:1.6;color:#555">Une question sur un quartier ou un bien précis ? Répondez à cet email ou écrivez-nous sur WhatsApp : nous répondons ${site.agent.responseTime.toLowerCase()}.</p>
        <p style="font-size:13px;color:#889">${site.agent.name} · ${site.brandName} — ${site.tagline}</p>
      </div>`,
    });
  } catch (err) {
    console.error("[leads] report email failed:", err);
  }
}

/** Notifie le propriétaire par email (silencieux si RESEND_API_KEY absent). */
export async function notifyOwner(
  input: LeadInput,
  extra?: Record<string, string>
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const rows = Object.entries({
    Nom: input.name,
    Téléphone: input.phone,
    Email: input.email || "—",
    Ville: input.city || "—",
    Source: SOURCE_LABELS[input.source],
    Référence: input.sourceRef || "—",
    Message: input.message || "—",
    ...extra,
  })
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;color:#667;font-size:13px">${k}</td><td style="padding:6px 12px;font-size:14px"><strong>${v}</strong></td></tr>`
    )
    .join("");

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.LEAD_NOTIFICATION_FROM || `${site.brandName} <onboarding@resend.dev>`,
      to: site.contactEmail,
      subject: `🔥 Nouveau lead ${SOURCE_LABELS[input.source]} — ${input.name}`,
      html: `<div style="font-family:system-ui,sans-serif;max-width:560px">
        <h2 style="color:#0F4C5C">Nouveau lead ${SOURCE_LABELS[input.source]}</h2>
        <table style="border-collapse:collapse;background:#F6F4EF;border-radius:8px;width:100%">${rows}</table>
        <p style="margin-top:16px"><a href="https://wa.me/${input.phone.replace(/[^0-9]/g, "")}" style="background:#25D366;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Répondre sur WhatsApp</a></p>
      </div>`,
    });
  } catch (err) {
    // L'email ne doit jamais faire échouer la capture du lead.
    console.error("[leads] Resend notification failed:", err);
  }
}
