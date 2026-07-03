"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import type { LeadSource } from "@/lib/types";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { site } from "../../site.config";

interface LeadFormProps {
  source: LeadSource;
  sourceRef?: string;
  city?: string;
  payload?: Record<string, unknown>;
  cta?: string;
  withMessage?: boolean;
  successTitle?: string;
  successText?: string;
  /** Appelé après envoi réussi (ex. révéler l'estimation). */
  onSuccess?: (result: { leadId: string; whatsappUrl: string }) => void;
}

interface Errors {
  name?: string;
  phone?: string;
  email?: string;
}

const PHONE_RE = /^\+?[0-9 ().-]{9,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LeadForm({
  source,
  sourceRef,
  city,
  payload,
  cta = "Être rappelé rapidement",
  withMessage = false,
  successTitle = "Merci, c'est bien reçu !",
  successText = `Un conseiller vous recontacte très vite — ${site.agent.responseTime.toLowerCase()}.`,
  onSuccess,
}: LeadFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot anti-spam
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [whatsappUrl, setWhatsappUrl] = useState<string>("");

  function validate(): boolean {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Indiquez votre nom.";
    if (!PHONE_RE.test(phone.trim()))
      next.phone = "Numéro invalide (ex. 06 12 34 56 78).";
    if (email.trim() && !EMAIL_RE.test(email.trim()))
      next.email = "Adresse email invalide.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          message: message.trim() || undefined,
          source,
          sourceRef,
          city,
          payload,
          website,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { leadId: string; whatsappUrl: string };
      setWhatsappUrl(json.whatsappUrl);
      setStatus("success");
      onSuccess?.(json);
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-primary/20 bg-primary-soft p-6 text-center"
      >
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" aria-hidden />
        <p className="font-display mt-3 text-lg font-bold text-ink">{successTitle}</p>
        <p className="mt-1 text-[14px] text-ink/65">{successText}</p>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener"
            className="btn-whatsapp mt-5 w-full"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Continuer sur WhatsApp
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor={`lf-name-${source}`} className="label">
          Nom complet *
        </label>
        <input
          id={`lf-name-${source}`}
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
          className="field"
          placeholder="Votre nom"
        />
        {errors.name && (
          <p className="mt-1 text-[13px] font-medium text-red-600">{errors.name}</p>
        )}
      </div>
      <div>
        <label htmlFor={`lf-phone-${source}`} className="label">
          Téléphone (WhatsApp) *
        </label>
        <input
          id={`lf-phone-${source}`}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          aria-invalid={!!errors.phone}
          className="field"
          placeholder="06 12 34 56 78"
        />
        {errors.phone && (
          <p className="mt-1 text-[13px] font-medium text-red-600">{errors.phone}</p>
        )}
      </div>
      <div>
        <label htmlFor={`lf-email-${source}`} className="label">
          Email <span className="font-normal text-ink/40">(optionnel)</span>
        </label>
        <input
          id={`lf-email-${source}`}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!errors.email}
          className="field"
          placeholder="vous@exemple.com"
        />
        {errors.email && (
          <p className="mt-1 text-[13px] font-medium text-red-600">{errors.email}</p>
        )}
      </div>
      {withMessage && (
        <div>
          <label htmlFor={`lf-msg-${source}`} className="label">
            Votre message <span className="font-normal text-ink/40">(optionnel)</span>
          </label>
          <textarea
            id={`lf-msg-${source}`}
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="field resize-none"
            placeholder="Décrivez votre projet…"
          />
        </div>
      )}
      {/* Honeypot : invisible pour les humains */}
      <div className="hidden" aria-hidden>
        <label htmlFor={`lf-web-${source}`}>Site web</label>
        <input
          id={`lf-web-${source}`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <button type="submit" disabled={status === "sending"} className="btn-accent w-full">
        {status === "sending" ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        ) : (
          <Send className="h-4.5 w-4.5" aria-hidden />
        )}
        {status === "sending" ? "Envoi en cours…" : cta}
      </button>

      {status === "error" && (
        <p role="alert" className="text-center text-[13.5px] font-medium text-red-600">
          Une erreur est survenue. Réessayez ou contactez-nous sur WhatsApp.
        </p>
      )}

      <p className="text-center text-[12px] leading-relaxed text-ink/45">
        Vos coordonnées restent confidentielles et ne sont jamais partagées.
      </p>
    </form>
  );
}
