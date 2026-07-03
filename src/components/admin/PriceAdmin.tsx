"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { City, Neighborhood, PriceData } from "@/lib/types";
import { propertyTypes, transactions } from "../../../site.config";

interface RowDraft {
  price: string;
  sampleSize: string;
  dirty: boolean;
  saving: boolean;
}

const typeLabel = (slug: string) =>
  propertyTypes.find((t) => t.slug === slug)?.label ?? slug;

export function PriceAdmin({ cities }: { cities: City[] }) {
  const [cityId, setCityId] = useState(cities[0]?.id ?? "");
  const [hoods, setHoods] = useState<Neighborhood[]>([]);
  const [rows, setRows] = useState<PriceData[]>([]);
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>({});
  const [descDrafts, setDescDrafts] = useState<Record<string, { text: string; saving: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Nouvelle ligne
  const [newHood, setNewHood] = useState("");
  const [newType, setNewType] = useState("appartement");
  const [newTransaction, setNewTransaction] = useState("vente");
  const [newPrice, setNewPrice] = useState("");
  const [adding, setAdding] = useState(false);

  const citySlug = cities.find((c) => c.id === cityId)?.slug ?? "";

  const load = useCallback(async () => {
    if (!cityId) return;
    setLoading(true);
    setError("");
    const supabase = supabaseBrowser();
    const { data: hoodData, error: hoodErr } = await supabase
      .from("neighborhoods")
      .select("*")
      .eq("city_id", cityId)
      .order("name");
    if (hoodErr) {
      setError(hoodErr.message);
      setLoading(false);
      return;
    }
    const hoodList = (hoodData as Neighborhood[]) ?? [];
    setHoods(hoodList);
    setDescDrafts(
      Object.fromEntries(
        hoodList.map((h) => [h.id, { text: h.description ?? "", saving: false }])
      )
    );
    const { data: priceData } = await supabase
      .from("price_data")
      .select("*")
      .in("neighborhood_id", hoodList.map((h) => h.id));
    const priceRows = (priceData as PriceData[]) ?? [];
    setRows(priceRows);
    setDrafts(
      Object.fromEntries(
        priceRows.map((r) => [
          r.id,
          {
            price: String(r.avg_price_per_m2),
            sampleSize: String(r.sample_size),
            dirty: false,
            saving: false,
          },
        ])
      )
    );
    setLoading(false);
  }, [cityId]);

  useEffect(() => {
    load();
  }, [load]);

  async function revalidateCity() {
    const paths = [
      "/prix-immobilier",
      `/prix-immobilier/${citySlug}`,
      ...hoods.map((h) => `/quartiers/${citySlug}/${h.slug}`),
      ...propertyTypes.flatMap((t) => [
        `/immobilier/${citySlug}/${t.slug}-a-vendre`,
        `/immobilier/${citySlug}/${t.slug}-a-louer`,
      ]),
    ];
    await fetch("/api/admin/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths }),
    }).catch(() => {});
  }

  async function saveRow(row: PriceData) {
    const draft = drafts[row.id];
    if (!draft) return;
    const price = Number(draft.price);
    if (!Number.isFinite(price) || price <= 0) {
      setError("Prix invalide.");
      return;
    }
    setDrafts((d) => ({ ...d, [row.id]: { ...draft, saving: true } }));
    const { error: dbErr } = await supabaseBrowser()
      .from("price_data")
      .update({
        avg_price_per_m2: price,
        sample_size: Number(draft.sampleSize) || 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    if (dbErr) {
      setError(dbErr.message);
      setDrafts((d) => ({ ...d, [row.id]: { ...draft, saving: false } }));
      return;
    }
    setDrafts((d) => ({
      ...d,
      [row.id]: { ...draft, dirty: false, saving: false },
    }));
    revalidateCity();
  }

  async function deleteRow(row: PriceData) {
    if (!window.confirm("Supprimer cette ligne de prix ?")) return;
    const { error: dbErr } = await supabaseBrowser()
      .from("price_data")
      .delete()
      .eq("id", row.id);
    if (dbErr) {
      setError(dbErr.message);
      return;
    }
    setRows((r) => r.filter((x) => x.id !== row.id));
    revalidateCity();
  }

  async function addRow() {
    const price = Number(newPrice);
    if (!newHood || !Number.isFinite(price) || price <= 0) {
      setError("Complétez quartier et prix pour ajouter une ligne.");
      return;
    }
    setAdding(true);
    setError("");
    const { data, error: dbErr } = await supabaseBrowser()
      .from("price_data")
      .insert({
        neighborhood_id: newHood,
        property_type: newType,
        transaction: newTransaction,
        avg_price_per_m2: price,
        sample_size: 0,
      })
      .select("*")
      .single();
    setAdding(false);
    if (dbErr) {
      setError(
        dbErr.message.includes("duplicate")
          ? "Cette combinaison quartier/type/transaction existe déjà."
          : dbErr.message
      );
      return;
    }
    const row = data as PriceData;
    setRows((r) => [...r, row]);
    setDrafts((d) => ({
      ...d,
      [row.id]: {
        price: String(row.avg_price_per_m2),
        sampleSize: String(row.sample_size),
        dirty: false,
        saving: false,
      },
    }));
    setNewPrice("");
    revalidateCity();
  }

  async function saveDescription(hood: Neighborhood) {
    const draft = descDrafts[hood.id];
    if (!draft) return;
    setDescDrafts((d) => ({ ...d, [hood.id]: { ...draft, saving: true } }));
    const { error: dbErr } = await supabaseBrowser()
      .from("neighborhoods")
      .update({ description: draft.text.trim() || null })
      .eq("id", hood.id);
    setDescDrafts((d) => ({ ...d, [hood.id]: { ...draft, saving: false } }));
    if (dbErr) {
      setError(dbErr.message);
      return;
    }
    revalidateCity();
  }

  return (
    <div>
      {/* Sélecteur de ville */}
      <div className="flex flex-wrap gap-2">
        {cities.map((city) => (
          <button
            key={city.id}
            type="button"
            onClick={() => setCityId(city.id)}
            className={`rounded-full px-4 py-2 text-[13.5px] font-bold transition ${
              city.id === cityId
                ? "bg-primary text-white"
                : "border border-line bg-white text-ink/60 hover:border-primary hover:text-primary"
            }`}
          >
            {city.name}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-[13.5px] font-medium text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-8 flex items-center gap-2 text-[14px] text-ink/50">
          <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden />
          Chargement…
        </p>
      ) : (
        <>
          {/* Ajout de ligne */}
          <div className="card mt-6 flex flex-wrap items-end gap-3 p-4">
            <div>
              <label htmlFor="pa-hood" className="label">
                Quartier
              </label>
              <select
                id="pa-hood"
                value={newHood}
                onChange={(e) => setNewHood(e.target.value)}
                className="field !py-2.5"
              >
                <option value="">Choisir…</option>
                {hoods.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pa-type" className="label">
                Type
              </label>
              <select
                id="pa-type"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="field !py-2.5"
              >
                {propertyTypes.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pa-tx" className="label">
                Transaction
              </label>
              <select
                id="pa-tx"
                value={newTransaction}
                onChange={(e) => setNewTransaction(e.target.value)}
                className="field !py-2.5"
              >
                {transactions.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pa-price" className="label">
                MAD/m²{newTransaction === "location" ? "/mois" : ""}
              </label>
              <input
                id="pa-price"
                type="number"
                min={0}
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="field w-32 !py-2.5"
              />
            </div>
            <button
              type="button"
              onClick={addRow}
              disabled={adding}
              className="btn-primary !px-4 !py-2.5 text-[13.5px]"
            >
              {adding ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Plus className="h-4 w-4" aria-hidden />
              )}
              Ajouter
            </button>
          </div>

          {/* Par quartier : description + lignes de prix */}
          <div className="mt-6 space-y-5">
            {hoods.map((hood) => {
              const hoodRows = rows.filter((r) => r.neighborhood_id === hood.id);
              const desc = descDrafts[hood.id];
              return (
                <section key={hood.id} className="card p-5">
                  <h2 className="font-display text-[16px] font-bold text-ink">
                    {hood.name}
                  </h2>

                  {hoodRows.length > 0 && (
                    <table className="mt-3 w-full text-[13.5px]">
                      <thead className="text-left text-[11.5px] tracking-wide text-ink/50 uppercase">
                        <tr>
                          <th className="py-1.5 pr-3 font-bold">Type</th>
                          <th className="py-1.5 pr-3 font-bold">Transaction</th>
                          <th className="py-1.5 pr-3 font-bold">MAD/m²</th>
                          <th className="py-1.5 pr-3 font-bold">Échantillon</th>
                          <th className="py-1.5 font-bold" />
                        </tr>
                      </thead>
                      <tbody>
                        {hoodRows.map((row) => {
                          const draft = drafts[row.id];
                          if (!draft) return null;
                          return (
                            <tr key={row.id} className="border-t border-line/60">
                              <td className="py-2 pr-3 font-semibold text-ink/80">
                                {typeLabel(row.property_type)}
                              </td>
                              <td className="py-2 pr-3 text-ink/60 capitalize">
                                {row.transaction}
                              </td>
                              <td className="py-2 pr-3">
                                <input
                                  type="number"
                                  aria-label={`Prix ${typeLabel(row.property_type)} ${row.transaction} à ${hood.name}`}
                                  value={draft.price}
                                  onChange={(e) =>
                                    setDrafts((d) => ({
                                      ...d,
                                      [row.id]: { ...draft, price: e.target.value, dirty: true },
                                    }))
                                  }
                                  className="field w-28 !px-2.5 !py-1.5 text-[13px]"
                                />
                              </td>
                              <td className="py-2 pr-3">
                                <input
                                  type="number"
                                  aria-label="Taille de l'échantillon"
                                  value={draft.sampleSize}
                                  onChange={(e) =>
                                    setDrafts((d) => ({
                                      ...d,
                                      [row.id]: { ...draft, sampleSize: e.target.value, dirty: true },
                                    }))
                                  }
                                  className="field w-20 !px-2.5 !py-1.5 text-[13px]"
                                />
                              </td>
                              <td className="py-2 text-right whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => saveRow(row)}
                                  disabled={!draft.dirty || draft.saving}
                                  className="mr-2 inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-[12px] font-bold text-white disabled:opacity-30"
                                >
                                  {draft.saving ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                                  ) : (
                                    <Save className="h-3.5 w-3.5" aria-hidden />
                                  )}
                                  OK
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteRow(row)}
                                  aria-label="Supprimer la ligne"
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" aria-hidden />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                  {/* Description éditoriale */}
                  {desc && (
                    <div className="mt-4">
                      <label htmlFor={`desc-${hood.id}`} className="label">
                        Description du quartier (page /quartiers/{citySlug}/{hood.slug})
                      </label>
                      <textarea
                        id={`desc-${hood.id}`}
                        rows={3}
                        value={desc.text}
                        onChange={(e) =>
                          setDescDrafts((d) => ({
                            ...d,
                            [hood.id]: { ...desc, text: e.target.value },
                          }))
                        }
                        className="field resize-y text-[13.5px]"
                      />
                      <button
                        type="button"
                        onClick={() => saveDescription(hood)}
                        disabled={desc.saving}
                        className="btn-outline mt-2 !px-4 !py-2 text-[12.5px]"
                      >
                        {desc.saving && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                        )}
                        Enregistrer la description
                      </button>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
