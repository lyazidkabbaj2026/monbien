"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Home,
  Landmark,
  Loader2,
  LockKeyhole,
  Map,
  Sparkles,
  Store,
  TreePine,
} from "lucide-react";
import { site } from "../../site.config";
import { track } from "@/lib/gtag";
import type { City, Neighborhood } from "@/lib/types";
import { formatPrice, formatNumber } from "@/lib/format";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { AgentCard } from "./AgentCard";

const TYPE_OPTIONS = [
  { slug: "appartement", label: "Appartement", icon: Building2 },
  { slug: "maison", label: "Maison", icon: Home },
  { slug: "villa", label: "Villa", icon: Landmark },
  { slug: "riad", label: "Riad", icon: Store },
  { slug: "bureau", label: "Bureau", icon: Sparkles },
  { slug: "terrain", label: "Terrain", icon: TreePine },
];

const CONDITION_OPTIONS = [
  { value: "neuf", label: "Neuf / récent", hint: "Moins de 5 ans ou rénové à neuf" },
  { value: "bon", label: "Bon état", hint: "Habitable immédiatement" },
  { value: "a_renover", label: "À rafraîchir", hint: "Travaux à prévoir" },
] as const;

interface Result {
  low: number;
  high: number;
  basePricePerM2: number;
  scope: "quartier" | "ville";
  whatsappUrl: string;
}

const PHONE_RE = /^\+?[0-9 ().-]{9,20}$/;

export function ValuationWizard({
  cities,
  neighborhoods,
}: {
  cities: City[];
  neighborhoods: Record<string, Neighborhood[]>;
}) {
  const [step, setStep] = useState(0);
  const [propertyType, setPropertyType] = useState("");
  const [cityId, setCityId] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [areaM2, setAreaM2] = useState("");
  const [rooms, setRooms] = useState("");
  const [condition, setCondition] = useState<string>("bon");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const cityHoods = useMemo(
    () => (cityId ? (neighborhoods[cityId] ?? []) : []),
    [cityId, neighborhoods]
  );
  const cityName = cities.find((c) => c.id === cityId)?.name ?? "";

  const stepValid =
    (step === 0 && !!propertyType) ||
    (step === 1 && !!cityId) ||
    (step === 2 && Number(areaM2) >= 10) ||
    step === 3;

  async function submit() {
    setError("");
    if (name.trim().length < 2) return setError("Indiquez votre nom.");
    if (!PHONE_RE.test(phone.trim()))
      return setError("Numéro de téléphone invalide (ex. 06 12 34 56 78).");
    setSending(true);
    try {
      const res = await fetch("/api/valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          cityId,
          neighborhoodId: neighborhoodId || undefined,
          propertyType,
          areaM2: Number(areaM2),
          rooms: rooms ? Number(rooms) : undefined,
          condition,
          website,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "erreur");
      setResult(json as Result);
      track("generate_lead", { source: "valuation", property_type: propertyType });
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes("zone")
          ? err.message
          : "Une erreur est survenue. Réessayez ou contactez-nous sur WhatsApp."
      );
    } finally {
      setSending(false);
    }
  }

  /* ------------------------------------------------------------ Résultat */
  if (result) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" aria-hidden />
        <h2 className="font-display mt-4 text-2xl font-bold text-ink">
          Votre estimation est prête
        </h2>
        <p className="mt-1 text-[14px] text-ink/60">
          {TYPE_OPTIONS.find((t) => t.slug === propertyType)?.label} · {areaM2} m² ·{" "}
          {cityName}
        </p>
        <div className="mt-6 rounded-2xl bg-primary p-6 text-white sm:p-8">
          <p className="text-[13px] font-semibold tracking-wide text-white/70 uppercase">
            Fourchette estimée
          </p>
          <p className="font-display mt-2 text-2xl font-bold sm:text-4xl">
            {formatPrice(result.low)}
            <span className="mx-2 text-white/50">—</span>
            {formatPrice(result.high)}
          </p>
          <p className="mt-3 text-[13px] text-white/65">
            Base : {formatNumber(result.basePricePerM2)} MAD/m² (moyenne{" "}
            {result.scope === "quartier" ? "du quartier" : "de la ville"}, état et
            surface pris en compte)
          </p>
        </div>
        <p className="mx-auto mt-5 max-w-md text-[14px] leading-relaxed text-ink/65">
          Cette fourchette est indicative. Pour un <strong>prix de vente précis</strong>{" "}
          (exposition, étage, prestations, travaux), l&apos;équipe {site.brandName} vous
          propose une contre-visite gratuite et sans engagement.
        </p>
        {result.whatsappUrl && (
          <a
            href={result.whatsappUrl}
            target="_blank"
            rel="noopener"
            className="btn-whatsapp mt-6 w-full sm:w-auto sm:!px-10"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Affiner mon estimation sur WhatsApp
          </a>
        )}
        <div className="mx-auto mt-6 max-w-sm">
          <AgentCard compact />
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------- Wizard */
  return (
    <div>
      {/* Barre de progression */}
      <div className="mb-8">
        <div className="flex justify-between text-[12px] font-semibold text-ink/50">
          <span className={step >= 0 ? "text-primary" : ""}>Type de bien</span>
          <span className={step >= 1 ? "text-primary" : ""}>Localisation</span>
          <span className={step >= 2 ? "text-primary" : ""}>Détails</span>
          <span className={step >= 3 ? "text-primary" : ""}>Estimation</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      {step === 0 && (
        <fieldset>
          <legend className="font-display text-xl font-bold text-ink">
            Quel type de bien souhaitez-vous estimer ?
          </legend>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {TYPE_OPTIONS.map((type) => (
              <button
                key={type.slug}
                type="button"
                onClick={() => {
                  setPropertyType(type.slug);
                  setStep(1);
                }}
                aria-pressed={propertyType === type.slug}
                className={`flex flex-col items-center gap-2.5 rounded-2xl border-2 p-5 text-[14.5px] font-semibold transition ${
                  propertyType === type.slug
                    ? "border-accent bg-accent/5 text-accent"
                    : "border-line bg-white text-ink/75 hover:border-primary/40"
                }`}
              >
                <type.icon className="h-7 w-7" aria-hidden />
                {type.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {step === 1 && (
        <fieldset>
          <legend className="font-display text-xl font-bold text-ink">
            Où se situe votre bien ?
          </legend>
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="vw-city" className="label">
                Ville *
              </label>
              <select
                id="vw-city"
                value={cityId}
                onChange={(e) => {
                  setCityId(e.target.value);
                  setNeighborhoodId("");
                }}
                className="field"
              >
                <option value="">Choisir une ville</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="vw-hood" className="label">
                Quartier{" "}
                <span className="font-normal text-ink/40">
                  (recommandé pour une estimation précise)
                </span>
              </label>
              <select
                id="vw-hood"
                value={neighborhoodId}
                onChange={(e) => setNeighborhoodId(e.target.value)}
                disabled={cityHoods.length === 0}
                className="field disabled:opacity-50"
              >
                <option value="">
                  {cityId
                    ? cityHoods.length
                      ? "Choisir un quartier"
                      : "Quartiers bientôt disponibles"
                    : "Choisir une ville d'abord"}
                </option>
                {cityHoods.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset>
          <legend className="font-display text-xl font-bold text-ink">
            Parlez-nous de votre bien
          </legend>
          <div className="mt-5 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="vw-area" className="label">
                  Surface habitable (m²) *
                </label>
                <input
                  id="vw-area"
                  type="number"
                  inputMode="numeric"
                  min={10}
                  max={5000}
                  value={areaM2}
                  onChange={(e) => setAreaM2(e.target.value)}
                  className="field"
                  placeholder="Ex. 95"
                />
              </div>
              <div>
                <label htmlFor="vw-rooms" className="label">
                  Nombre de pièces
                </label>
                <select
                  id="vw-rooms"
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  className="field"
                >
                  <option value="">—</option>
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <option key={n} value={n}>
                      {n}
                      {n === 7 ? "+" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <span className="label">État général *</span>
              <div className="grid gap-3 sm:grid-cols-3">
                {CONDITION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCondition(opt.value)}
                    aria-pressed={condition === opt.value}
                    className={`rounded-2xl border-2 p-4 text-left transition ${
                      condition === opt.value
                        ? "border-accent bg-accent/5"
                        : "border-line bg-white hover:border-primary/40"
                    }`}
                  >
                    <span className="block text-[14.5px] font-bold text-ink">
                      {opt.label}
                    </span>
                    <span className="mt-1 block text-[12.5px] text-ink/55">
                      {opt.hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </fieldset>
      )}

      {step === 3 && (
        <fieldset>
          <legend className="font-display text-xl font-bold text-ink">
            Où envoyer votre estimation ?
          </legend>
          <p className="mt-2 flex items-center gap-2 text-[13.5px] text-ink/60">
            <LockKeyhole className="h-4 w-4 text-primary" aria-hidden />
            Vos coordonnées restent confidentielles — jamais de spam.
          </p>
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="vw-name" className="label">
                Nom complet *
              </label>
              <input
                id="vw-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label htmlFor="vw-phone" className="label">
                Téléphone (WhatsApp) *
              </label>
              <input
                id="vw-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="field"
                placeholder="06 12 34 56 78"
              />
            </div>
            <div>
              <label htmlFor="vw-email" className="label">
                Email <span className="font-normal text-ink/40">(optionnel)</span>
              </label>
              <input
                id="vw-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field"
                placeholder="vous@exemple.com"
              />
            </div>
            <div className="hidden" aria-hidden>
              <label htmlFor="vw-web">Site web</label>
              <input
                id="vw-web"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>
        </fieldset>
      )}

      {error && (
        <p role="alert" className="mt-4 text-center text-[13.5px] font-medium text-red-600">
          {error}
        </p>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="btn-outline !px-5"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Retour
          </button>
        ) : (
          <span />
        )}
        {step < 3 ? (
          <button
            type="button"
            disabled={!stepValid}
            onClick={() => setStep(step + 1)}
            className="btn-accent !px-8 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continuer
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            disabled={sending}
            onClick={submit}
            className="btn-accent !px-8"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              <Map className="h-4.5 w-4.5" aria-hidden />
            )}
            {sending ? "Calcul en cours…" : "Voir mon estimation"}
          </button>
        )}
      </div>
    </div>
  );
}
