"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Info } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { LeadForm } from "./LeadForm";
import { AgentCard } from "./AgentCard";

const NOTARY_FEES_RATE = 0.07; // frais d'acquisition ≈ 7 % au Maroc

function computeCapacity(
  monthlyIncome: number,
  monthlyCharges: number,
  dtiPct: number,
  annualRate: number,
  years: number,
  downPayment: number
) {
  const maxMonthly = Math.max(0, monthlyIncome * (dtiPct / 100) - monthlyCharges);
  const months = Math.max(1, Math.round(years * 12));
  const monthlyRate = annualRate / 100 / 12;
  const capital =
    monthlyRate === 0
      ? maxMonthly * months
      : (maxMonthly * (1 - Math.pow(1 + monthlyRate, -months))) / monthlyRate;
  const totalBudget = capital + downPayment;
  const propertyBudget = totalBudget / (1 + NOTARY_FEES_RATE);
  return {
    maxMonthly,
    capital,
    totalBudget,
    propertyBudget,
    fees: totalBudget - propertyBudget,
  };
}

function SliderField({
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
    </div>
  );
}

export function BorrowingCapacity() {
  const [income, setIncome] = useState(15_000);
  const [charges, setCharges] = useState(0);
  const [dti, setDti] = useState(40);
  const [rate, setRate] = useState(4.5);
  const [years, setYears] = useState(20);
  const [downPayment, setDownPayment] = useState(150_000);

  const result = useMemo(
    () => computeCapacity(income, charges, dti, rate, years, downPayment),
    [income, charges, dti, rate, years, downPayment]
  );

  const budgetRounded = Math.round(result.propertyBudget / 10_000) * 10_000;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Entrées */}
      <div className="card space-y-6 p-6 sm:p-8">
        <SliderField
          id="bc-income"
          label="Revenus nets mensuels du foyer"
          suffix="MAD"
          value={income}
          min={3_000}
          max={150_000}
          step={500}
          onChange={setIncome}
        />
        <SliderField
          id="bc-charges"
          label="Crédits en cours (mensualités)"
          suffix="MAD"
          value={charges}
          min={0}
          max={50_000}
          step={250}
          onChange={setCharges}
        />
        <SliderField
          id="bc-down"
          label="Apport disponible"
          suffix="MAD"
          value={downPayment}
          min={0}
          max={3_000_000}
          step={10_000}
          onChange={setDownPayment}
        />
        <div className="grid grid-cols-2 gap-5">
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="bc-rate" className="label !mb-0">
                Taux annuel
              </label>
              <span className="text-[13px] font-bold text-primary">{rate.toFixed(2)} %</span>
            </div>
            <input
              id="bc-rate"
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
              <label htmlFor="bc-years" className="label !mb-0">
                Durée
              </label>
              <span className="text-[13px] font-bold text-primary">{years} ans</span>
            </div>
            <input
              id="bc-years"
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
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="bc-dti" className="label !mb-0">
              Taux d&apos;endettement max
            </label>
            <span className="text-[13px] font-bold text-primary">{dti} %</span>
          </div>
          <input
            id="bc-dti"
            type="range"
            min={30}
            max={45}
            step={1}
            value={dti}
            onChange={(e) => setDti(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--brand-accent)]"
          />
          <p className="mt-1.5 flex items-start gap-1.5 text-[12px] leading-relaxed text-ink/50">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            Les banques marocaines acceptent généralement 40 à 45 % des revenus
            nets, selon le profil.
          </p>
        </div>
      </div>

      {/* Résultats */}
      <div>
        <div className="dark-surface rounded-2xl p-6 text-white sm:p-8">
          <p className="text-[13px] font-semibold tracking-wide text-white/70 uppercase">
            Votre budget d&apos;achat estimé
          </p>
          <p className="font-display mt-2 text-4xl font-bold" aria-live="polite">
            {formatNumber(budgetRounded)}{" "}
            <span className="text-lg font-semibold text-white/70">MAD</span>
          </p>
          <p className="mt-1.5 text-[13px] text-white/60">
            prix du bien, frais d&apos;acquisition (~7 %) déjà déduits
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-5 text-[14px] sm:grid-cols-3">
            <div>
              <dt className="text-white/60">Mensualité max</dt>
              <dd className="mt-1 font-bold">
                {formatNumber(Math.round(result.maxMonthly))} MAD
              </dd>
            </div>
            <div>
              <dt className="text-white/60">Capital empruntable</dt>
              <dd className="mt-1 font-bold">
                {formatNumber(Math.round(result.capital))} MAD
              </dd>
            </div>
            <div>
              <dt className="text-white/60">Frais estimés</dt>
              <dd className="mt-1 font-bold text-accent">
                {formatNumber(Math.round(result.fees))} MAD
              </dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {budgetRounded > 0 && (
              <Link
                href={`/annonces?transaction=vente&prix_max=${budgetRounded}`}
                className="btn-accent !px-5 text-[14px]"
              >
                Voir les biens dans mon budget
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            )}
            <Link
              href="/simulateur-credit"
              className="btn !px-5 border border-white/25 text-[14px] text-white hover:bg-white/10"
            >
              Détailler la mensualité
            </Link>
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-white/50">
            Simulation indicative hors assurance. Chaque banque applique ses
            propres critères (ancienneté, secteur, garanties).
          </p>
        </div>

        {/* CTA lead */}
        <div className="card mt-6 p-6">
          <h2 className="font-display text-lg font-bold text-ink">
            Faites valider ce budget par les banques
          </h2>
          <p className="mt-1 mb-5 text-[13.5px] leading-relaxed text-ink/60">
            Un accord de principe bancaire avant vos visites = un vrai pouvoir de
            négociation. Nous préparons votre dossier et comparons les banques,
            gratuitement.
          </p>
          <LeadForm
            source="simulator"
            sourceRef="capacite-emprunt"
            payload={{
              revenus: income,
              charges,
              endettement_pct: dti,
              taux: rate,
              duree_ans: years,
              apport: downPayment,
              budget_estime: budgetRounded,
            }}
            cta="Obtenir mon accord de principe"
          />
          <div className="mt-5">
            <AgentCard compact />
          </div>
        </div>
      </div>
    </div>
  );
}
