"use client";

import { useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Search } from "lucide-react";
import { site, propertyTypes, transactions } from "../../site.config";
import type { City, Neighborhood } from "@/lib/types";
import { track } from "@/lib/gtag";
import { WhatsAppIcon } from "./WhatsAppIcon";

const PHONE_RE = /^\+?[0-9 ().-]{9,20}$/;

/**
 * Capture acheteur structurée (/avant-premiere) : les critères partent dans
 * le payload du lead et alimentent les rapprochements du copilote.
 */
export function BuyerSearchForm({
  cities,
  neighborhoods,
}: {
  cities: City[];
  neighborhoods: Record<string, Neighborhood[]>;
}) {
  const [transaction, setTransaction] = useState("vente");
  const [propertyType, setPropertyType] = useState("appartement");
  const [cityId, setCityId] = useState("");
  const [hoodSlugs, setHoodSlugs] = useState<string[]>([]);
  const [budgetMax, setBudgetMax] = useState("");
  const [roomsMin, setRoomsMin] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const cityHoods = useMemo(
    () => (cityId ? (neighborhoods[cityId] ?? []) : []),
    [cityId, neighborhoods]
  );
  const cityName = cities.find((c) => c.id === cityId)?.name ?? "";

  function toggleHood(slug: string) {
    setHoodSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!cityId) return setError("Choisissez une ville.");
    if (name.trim().length < 2) return setError("Indiquez votre nom.");
    if (!PHONE_RE.test(phone.trim()))
      return setError("Numéro de téléphone invalide (ex. 06 12 34 56 78).");

    setStatus("sending");
    const typeLabel = propertyTypes.find((t) => t.slug === propertyType)?.label;
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          source: "contact",
          sourceRef: "avant-premiere",
          city: cityName,
          message: `Recherche : ${typeLabel} en ${transaction} à ${cityName}${hoodSlugs.length ? ` (${hoodSlugs.join(", ")})` : ""}${budgetMax ? `, budget max ${budgetMax} MAD` : ""}`,
          payload: {
            recherche: {
              transaction,
              type: propertyType,
              ville: cityName,
              quartiers: hoodSlugs,
              budget_max: budgetMax ? Number(budgetMax) : null,
              pieces_min: roomsMin ? Number(roomsMin) : null,
            },
          },
          website,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { whatsappUrl: string };
      setWhatsappUrl(json.whatsappUrl);
      setStatus("success");
      track("generate_lead", { source: "contact", source_ref: "avant-premiere" });
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-2xl border border-primary/20 bg-primary-soft p-8 text-center">
        <CheckCircle2 className="mx-auto h-11 w-11 text-primary" aria-hidden />
        <p className="font-display mt-4 text-xl font-bold text-ink">
          Votre recherche est enregistrée
        </p>
        <p className="mx-auto mt-2 max-w-sm text-[14.5px] leading-relaxed text-ink/65">
          Dès qu&apos;un bien correspond — même avant sa publication — vous êtes
          prévenu(e) en priorité, {site.agent.responseTime.toLowerCase()}.
        </p>
        {whatsappUrl && (
          <a href={whatsappUrl} target="_blank" rel="noopener" className="btn-whatsapp mt-6">
            <WhatsAppIcon className="h-5 w-5" />
            Accélérer sur WhatsApp
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Critères */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="bsf-tx" className="label">
            Vous cherchez à *
          </label>
          <select
            id="bsf-tx"
            value={transaction}
            onChange={(e) => setTransaction(e.target.value)}
            className="field"
          >
            {transactions.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.action}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="bsf-type" className="label">
            Type de bien *
          </label>
          <select
            id="bsf-type"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="field"
          >
            {propertyTypes.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="bsf-city" className="label">
            Ville *
          </label>
          <select
            id="bsf-city"
            value={cityId}
            onChange={(e) => {
              setCityId(e.target.value);
              setHoodSlugs([]);
            }}
            className="field"
          >
            <option value="">Choisir…</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="bsf-budget" className="label">
            Budget max (MAD{transaction === "location" ? "/mois" : ""})
          </label>
          <input
            id="bsf-budget"
            type="number"
            inputMode="numeric"
            min={0}
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            className="field"
            placeholder={transaction === "location" ? "Ex. 10 000" : "Ex. 2 000 000"}
          />
        </div>
      </div>

      {cityHoods.length > 0 && (
        <fieldset>
          <legend className="label">
            Quartiers souhaités{" "}
            <span className="font-normal text-ink/40">(plusieurs choix possibles)</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {cityHoods.map((hood) => {
              const selected = hoodSlugs.includes(hood.slug);
              return (
                <button
                  key={hood.slug}
                  type="button"
                  onClick={() => toggleHood(hood.slug)}
                  aria-pressed={selected}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition ${
                    selected
                      ? "border-accent bg-accent/10 text-accent-deep"
                      : "border-line bg-white text-ink/65 hover:border-primary/50"
                  }`}
                >
                  {hood.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div>
        <label htmlFor="bsf-rooms" className="label">
          Pièces minimum
        </label>
        <select
          id="bsf-rooms"
          value={roomsMin}
          onChange={(e) => setRoomsMin(e.target.value)}
          className="field"
        >
          <option value="">Indifférent</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}+
            </option>
          ))}
        </select>
      </div>

      <hr className="border-line" />

      {/* Contact */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="bsf-name" className="label">
            Nom complet *
          </label>
          <input
            id="bsf-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field"
            placeholder="Votre nom"
          />
        </div>
        <div>
          <label htmlFor="bsf-phone" className="label">
            Téléphone (WhatsApp) *
          </label>
          <input
            id="bsf-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="field"
            placeholder="06 12 34 56 78"
          />
        </div>
      </div>
      <div>
        <label htmlFor="bsf-email" className="label">
          Email <span className="font-normal text-ink/40">(optionnel)</span>
        </label>
        <input
          id="bsf-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field"
          placeholder="vous@exemple.com"
        />
      </div>
      <div className="hidden" aria-hidden>
        <label htmlFor="bsf-web">Site web</label>
        <input
          id="bsf-web"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="text-[13.5px] font-medium text-red-600">
          {error}
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="text-[13.5px] font-medium text-red-600">
          Une erreur est survenue. Réessayez ou contactez-nous sur WhatsApp.
        </p>
      )}

      <button type="submit" disabled={status === "sending"} className="btn-accent w-full">
        {status === "sending" ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        ) : (
          <Search className="h-4.5 w-4.5" aria-hidden />
        )}
        {status === "sending" ? "Enregistrement…" : "Activer mon alerte prioritaire"}
      </button>
      <p className="text-center text-[12px] text-ink/45">
        Gratuit, sans engagement. Vos coordonnées restent confidentielles.
      </p>
    </form>
  );
}
