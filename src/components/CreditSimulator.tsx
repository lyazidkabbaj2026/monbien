"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { LeadForm } from "./LeadForm";
import { AgentCard } from "./AgentCard";

interface YearRow {
  year: number;
  interest: number;
  principal: number;
  remaining: number;
}

function computeLoan(price: number, downPayment: number, annualRate: number, years: number) {
  const principal = Math.max(0, price - downPayment);
  const months = Math.max(1, Math.round(years * 12));
  const monthlyRate = annualRate / 100 / 12;

  const monthly =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));

  const totalPaid = monthly * months;
  const totalInterest = totalPaid - principal;

  // Tableau d'amortissement agrégé par année (DOM léger)
  const rows: YearRow[] = [];
  let remaining = principal;
  for (let y = 1; y <= Math.ceil(months / 12); y++) {
    let yearInterest = 0;
    let yearPrincipal = 0;
    for (let m = 0; m < 12 && (y - 1) * 12 + m < months; m++) {
      const interest = remaining * monthlyRate;
      const paid = Math.min(monthly - interest, remaining);
      yearInterest += interest;
      yearPrincipal += paid;
      remaining = Math.max(0, remaining - paid);
    }
    rows.push({ year: y, interest: yearInterest, principal: yearPrincipal, remaining });
  }

  return { principal, monthly, totalPaid, totalInterest, rows, months };
}

function Field({
  id,
  label,
  suffix,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  suffix: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="label !mb-0">
          {label}
        </label>
        <span className="text-[13px] font-bold text-primary">
          {formatNumber(value)} {suffix}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--brand-accent)]"
      />
      <input
        type="number"
        aria-label={`${label} (saisie directe)`}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="field mt-2 !py-2.5 text-[14px]"
      />
    </div>
  );
}

export function CreditSimulator() {
  const [price, setPrice] = useState(1_500_000);
  const [downPayment, setDownPayment] = useState(300_000);
  const [rate, setRate] = useState(4.5);
  const [years, setYears] = useState(20);

  const loan = useMemo(
    () => computeLoan(price, downPayment, rate, years),
    [price, downPayment, rate, years]
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      {/* Entrées */}
      <div className="card space-y-6 p-6 sm:p-8">
        <Field
          id="sim-price"
          label="Prix du bien"
          suffix="MAD"
          value={price}
          min={200_000}
          max={20_000_000}
          step={50_000}
          onChange={setPrice}
        />
        <Field
          id="sim-down"
          label="Apport personnel"
          suffix="MAD"
          value={downPayment}
          min={0}
          max={price}
          step={25_000}
          onChange={(v) => setDownPayment(Math.min(v, price))}
        />
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="sim-rate" className="label !mb-0">
              Taux annuel
            </label>
            <span className="text-[13px] font-bold text-primary">{rate.toFixed(2)} %</span>
          </div>
          <input
            id="sim-rate"
            type="range"
            min={1}
            max={8}
            step={0.05}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--brand-accent)]"
          />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="sim-years" className="label !mb-0">
              Durée
            </label>
            <span className="text-[13px] font-bold text-primary">{years} ans</span>
          </div>
          <input
            id="sim-years"
            type="range"
            min={5}
            max={30}
            step={1}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--brand-accent)]"
          />
        </div>
      </div>

      {/* Résultats */}
      <div>
        <div className="dark-surface rounded-2xl p-6 text-white sm:p-8">
          <p className="text-[13px] font-semibold tracking-wide text-white/70 uppercase">
            Votre mensualité estimée
          </p>
          <p className="font-display mt-2 text-4xl font-bold" aria-live="polite">
            {formatNumber(Math.round(loan.monthly))}{" "}
            <span className="text-lg font-semibold text-white/70">MAD/mois</span>
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-5 text-[14px] sm:grid-cols-3">
            <div>
              <dt className="text-white/60">Montant emprunté</dt>
              <dd className="mt-1 font-bold">{formatNumber(loan.principal)} MAD</dd>
            </div>
            <div>
              <dt className="text-white/60">Coût des intérêts</dt>
              <dd className="mt-1 font-bold text-accent">
                {formatNumber(Math.round(loan.totalInterest))} MAD
              </dd>
            </div>
            <div>
              <dt className="text-white/60">Coût total du crédit</dt>
              <dd className="mt-1 font-bold">
                {formatNumber(Math.round(loan.totalPaid))} MAD
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-[12px] leading-relaxed text-white/50">
            Simulation indicative hors assurance et frais de dossier. Le taux réel
            dépend de votre profil et se négocie banque par banque.
          </p>
        </div>

        {/* Tableau d'amortissement */}
        <details className="card group mt-4 overflow-hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-[14.5px] font-bold text-ink [&::-webkit-details-marker]:hidden">
            Tableau d&apos;amortissement (par année)
            <ChevronDown
              className="h-4.5 w-4.5 text-ink/50 transition group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <div className="max-h-80 overflow-auto border-t border-line">
            <table className="w-full text-[13px]">
              <thead className="sticky top-0 bg-sand text-left text-ink/60">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Année</th>
                  <th className="px-4 py-2.5 font-semibold">Intérêts</th>
                  <th className="px-4 py-2.5 font-semibold">Capital remboursé</th>
                  <th className="px-4 py-2.5 font-semibold">Restant dû</th>
                </tr>
              </thead>
              <tbody>
                {loan.rows.map((row) => (
                  <tr key={row.year} className="border-t border-line/60">
                    <td className="px-4 py-2 font-semibold text-ink">{row.year}</td>
                    <td className="px-4 py-2 text-ink/70">
                      {formatNumber(Math.round(row.interest))}
                    </td>
                    <td className="px-4 py-2 text-ink/70">
                      {formatNumber(Math.round(row.principal))}
                    </td>
                    <td className="px-4 py-2 text-ink/70">
                      {formatNumber(Math.round(row.remaining))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        {/* CTA lead douce */}
        <div className="card mt-6 p-6">
          <h2 className="font-display text-lg font-bold text-ink">
            Recevez des offres de financement personnalisées
          </h2>
          <p className="mt-1 mb-5 text-[13.5px] leading-relaxed text-ink/60">
            Nous comparons les banques pour vous et négocions le taux, les frais de
            dossier et l&apos;assurance. Gratuit, sans engagement.
          </p>
          <LeadForm
            source="simulator"
            sourceRef={`${formatNumber(price)} MAD / ${years} ans`}
            payload={{
              prix: price,
              apport: downPayment,
              taux: rate,
              duree_ans: years,
              mensualite: Math.round(loan.monthly),
            }}
            cta="Parler à un conseiller financement"
          />
          <div className="mt-5">
            <AgentCard compact />
          </div>
        </div>
      </div>
    </div>
  );
}
