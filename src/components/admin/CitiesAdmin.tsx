"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, MapPin, Plus, Save, Trash2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { slugify } from "@/lib/format";
import type { City, Neighborhood } from "@/lib/types";

interface CityDraft {
  name: string;
  region: string;
  lat: string;
  lng: string;
  is_active: boolean;
  dirty: boolean;
  saving: boolean;
}

interface HoodDraft {
  name: string;
  lat: string;
  lng: string;
  dirty: boolean;
  saving: boolean;
}

const num = (v: string): number | null => {
  const n = Number(v.replace(",", "."));
  return v.trim() !== "" && Number.isFinite(n) ? n : null;
};

export function CitiesAdmin() {
  const [cities, setCities] = useState<City[]>([]);
  const [cityDrafts, setCityDrafts] = useState<Record<string, CityDraft>>({});
  const [selectedId, setSelectedId] = useState("");
  const [hoods, setHoods] = useState<Neighborhood[]>([]);
  const [hoodDrafts, setHoodDrafts] = useState<Record<string, HoodDraft>>({});
  const [loading, setLoading] = useState(true);
  const [hoodsLoading, setHoodsLoading] = useState(false);
  const [error, setError] = useState("");
  // Formulaires d'ajout
  const [newCity, setNewCity] = useState({ name: "", region: "", lat: "", lng: "" });
  const [addingCity, setAddingCity] = useState(false);
  const [newHood, setNewHood] = useState({ name: "", lat: "", lng: "" });
  const [addingHood, setAddingHood] = useState(false);

  const selected = cities.find((c) => c.id === selectedId);

  const loadCities = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data, error: dbErr } = await supabaseBrowser()
      .from("cities")
      .select("*")
      .order("name");
    if (dbErr) {
      setError(dbErr.message);
      setLoading(false);
      return;
    }
    const list = (data as City[]) ?? [];
    setCities(list);
    setCityDrafts(
      Object.fromEntries(
        list.map((c) => [
          c.id,
          {
            name: c.name,
            region: c.region ?? "",
            lat: c.lat != null ? String(c.lat) : "",
            lng: c.lng != null ? String(c.lng) : "",
            is_active: c.is_active,
            dirty: false,
            saving: false,
          },
        ])
      )
    );
    setSelectedId((prev) => prev || list[0]?.id || "");
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCities();
  }, [loadCities]);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    (async () => {
      setHoodsLoading(true);
      const { data, error: dbErr } = await supabaseBrowser()
        .from("neighborhoods")
        .select("*")
        .eq("city_id", selectedId)
        .order("name");
      if (cancelled) return;
      if (dbErr) {
        setError(dbErr.message);
      } else {
        const list = (data as Neighborhood[]) ?? [];
        setHoods(list);
        setHoodDrafts(
          Object.fromEntries(
            list.map((h) => [
              h.id,
              {
                name: h.name,
                lat: h.lat != null ? String(h.lat) : "",
                lng: h.lng != null ? String(h.lng) : "",
                dirty: false,
                saving: false,
              },
            ])
          )
        );
      }
      setHoodsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  async function revalidate(citySlug: string, hoodSlugs: string[] = []) {
    const paths = [
      "/prix-immobilier",
      `/prix-immobilier/${citySlug}`,
      `/rapport/${citySlug}`,
      ...hoodSlugs.flatMap((h) => [
        `/quartiers/${citySlug}/${h}`,
        `/rapport/${citySlug}/${h}`,
      ]),
    ];
    await fetch("/api/admin/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths }),
    }).catch(() => {});
  }

  // ------------------------------------------------------------- villes
  async function addCity() {
    const name = newCity.name.trim();
    if (!name) {
      setError("Le nom de la ville est obligatoire.");
      return;
    }
    setAddingCity(true);
    setError("");
    const { data, error: dbErr } = await supabaseBrowser()
      .from("cities")
      .insert({
        name,
        slug: slugify(name),
        region: newCity.region.trim() || null,
        lat: num(newCity.lat),
        lng: num(newCity.lng),
        is_active: true,
      })
      .select("*")
      .single();
    setAddingCity(false);
    if (dbErr) {
      setError(
        dbErr.message.includes("duplicate")
          ? "Une ville avec ce nom (slug) existe déjà."
          : dbErr.message
      );
      return;
    }
    const city = data as City;
    setNewCity({ name: "", region: "", lat: "", lng: "" });
    await loadCities();
    setSelectedId(city.id);
    revalidate(city.slug);
  }

  async function saveCity(city: City) {
    const draft = cityDrafts[city.id];
    if (!draft) return;
    const name = draft.name.trim();
    if (!name) {
      setError("Le nom de la ville est obligatoire.");
      return;
    }
    setCityDrafts((d) => ({ ...d, [city.id]: { ...draft, saving: true } }));
    const { error: dbErr } = await supabaseBrowser()
      .from("cities")
      .update({
        name,
        region: draft.region.trim() || null,
        lat: num(draft.lat),
        lng: num(draft.lng),
        is_active: draft.is_active,
      })
      .eq("id", city.id);
    if (dbErr) {
      setError(dbErr.message);
      setCityDrafts((d) => ({ ...d, [city.id]: { ...draft, saving: false } }));
      return;
    }
    setCities((list) =>
      list.map((c) =>
        c.id === city.id
          ? {
              ...c,
              name,
              region: draft.region.trim() || null,
              lat: num(draft.lat),
              lng: num(draft.lng),
              is_active: draft.is_active,
            }
          : c
      )
    );
    setCityDrafts((d) => ({
      ...d,
      [city.id]: { ...draft, dirty: false, saving: false },
    }));
    revalidate(
      city.slug,
      city.id === selectedId ? hoods.map((h) => h.slug) : []
    );
  }

  async function deleteCity(city: City) {
    if (
      !window.confirm(
        `Supprimer la ville « ${city.name} » ?\n\nTous ses quartiers et leurs prix au m² seront supprimés définitivement, et les pages publiques associées disparaîtront. (Impossible si des annonces y sont rattachées.)`
      )
    )
      return;
    const { error: dbErr } = await supabaseBrowser()
      .from("cities")
      .delete()
      .eq("id", city.id);
    if (dbErr) {
      setError(
        dbErr.message.includes("violates foreign key")
          ? `Impossible : des annonces sont rattachées à ${city.name}. Supprimez ou déplacez-les d'abord.`
          : dbErr.message
      );
      return;
    }
    setCities((list) => list.filter((c) => c.id !== city.id));
    if (selectedId === city.id) setSelectedId("");
    revalidate(city.slug);
  }

  // ----------------------------------------------------------- quartiers
  async function addHood() {
    if (!selected) return;
    const name = newHood.name.trim();
    if (!name) {
      setError("Le nom du quartier est obligatoire.");
      return;
    }
    setAddingHood(true);
    setError("");
    const { data, error: dbErr } = await supabaseBrowser()
      .from("neighborhoods")
      .insert({
        city_id: selected.id,
        name,
        slug: slugify(name),
        lat: num(newHood.lat),
        lng: num(newHood.lng),
      })
      .select("*")
      .single();
    setAddingHood(false);
    if (dbErr) {
      setError(
        dbErr.message.includes("duplicate")
          ? "Ce quartier existe déjà dans cette ville."
          : dbErr.message
      );
      return;
    }
    const hood = data as Neighborhood;
    setHoods((list) =>
      [...list, hood].sort((a, b) => a.name.localeCompare(b.name, "fr"))
    );
    setHoodDrafts((d) => ({
      ...d,
      [hood.id]: {
        name: hood.name,
        lat: hood.lat != null ? String(hood.lat) : "",
        lng: hood.lng != null ? String(hood.lng) : "",
        dirty: false,
        saving: false,
      },
    }));
    setNewHood({ name: "", lat: "", lng: "" });
    revalidate(selected.slug, [hood.slug]);
  }

  async function saveHood(hood: Neighborhood) {
    const draft = hoodDrafts[hood.id];
    if (!draft || !selected) return;
    const name = draft.name.trim();
    if (!name) {
      setError("Le nom du quartier est obligatoire.");
      return;
    }
    setHoodDrafts((d) => ({ ...d, [hood.id]: { ...draft, saving: true } }));
    const { error: dbErr } = await supabaseBrowser()
      .from("neighborhoods")
      .update({ name, lat: num(draft.lat), lng: num(draft.lng) })
      .eq("id", hood.id);
    if (dbErr) {
      setError(dbErr.message);
      setHoodDrafts((d) => ({ ...d, [hood.id]: { ...draft, saving: false } }));
      return;
    }
    setHoods((list) =>
      list.map((h) =>
        h.id === hood.id
          ? { ...h, name, lat: num(draft.lat), lng: num(draft.lng) }
          : h
      )
    );
    setHoodDrafts((d) => ({
      ...d,
      [hood.id]: { ...draft, dirty: false, saving: false },
    }));
    revalidate(selected.slug, [hood.slug]);
  }

  async function deleteHood(hood: Neighborhood) {
    if (!selected) return;
    if (
      !window.confirm(
        `Supprimer le quartier « ${hood.name} » ?\n\nSes prix au m² seront supprimés et ses pages publiques (quartier, rapport, comparateur) disparaîtront.`
      )
    )
      return;
    const { error: dbErr } = await supabaseBrowser()
      .from("neighborhoods")
      .delete()
      .eq("id", hood.id);
    if (dbErr) {
      setError(dbErr.message);
      return;
    }
    setHoods((list) => list.filter((h) => h.id !== hood.id));
    revalidate(selected.slug, [hood.slug]);
  }

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-[14px] text-ink/50">
        <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden />
        Chargement…
      </p>
    );
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-4 text-[13.5px] font-medium text-red-600">
          {error}
        </p>
      )}

      {/* Ajout de ville */}
      <div className="card flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-40 flex-1">
          <label htmlFor="ca-name" className="label">
            Nouvelle ville
          </label>
          <input
            id="ca-name"
            type="text"
            value={newCity.name}
            onChange={(e) => setNewCity((v) => ({ ...v, name: e.target.value }))}
            placeholder="Ex. Agadir"
            className="field !py-2.5"
          />
        </div>
        <div className="min-w-36 flex-1">
          <label htmlFor="ca-region" className="label">
            Région
          </label>
          <input
            id="ca-region"
            type="text"
            value={newCity.region}
            onChange={(e) => setNewCity((v) => ({ ...v, region: e.target.value }))}
            placeholder="Souss-Massa"
            className="field !py-2.5"
          />
        </div>
        <div>
          <label htmlFor="ca-lat" className="label">
            Latitude
          </label>
          <input
            id="ca-lat"
            type="text"
            inputMode="decimal"
            value={newCity.lat}
            onChange={(e) => setNewCity((v) => ({ ...v, lat: e.target.value }))}
            placeholder="30.4278"
            className="field w-28 !py-2.5"
          />
        </div>
        <div>
          <label htmlFor="ca-lng" className="label">
            Longitude
          </label>
          <input
            id="ca-lng"
            type="text"
            inputMode="decimal"
            value={newCity.lng}
            onChange={(e) => setNewCity((v) => ({ ...v, lng: e.target.value }))}
            placeholder="-9.5981"
            className="field w-28 !py-2.5"
          />
        </div>
        <button
          type="button"
          onClick={addCity}
          disabled={addingCity}
          className="btn-primary !px-4 !py-2.5 text-[13.5px]"
        >
          {addingCity ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Plus className="h-4 w-4" aria-hidden />
          )}
          Ajouter
        </button>
      </div>

      {/* Sélecteur de ville */}
      <div className="mt-6 flex flex-wrap gap-2">
        {cities.map((city) => (
          <button
            key={city.id}
            type="button"
            onClick={() => setSelectedId(city.id)}
            className={`rounded-full px-4 py-2 text-[13.5px] font-bold transition ${
              city.id === selectedId
                ? "bg-primary text-white"
                : "border border-line bg-white text-ink/60 hover:border-primary hover:text-primary"
            } ${city.is_active ? "" : "opacity-50"}`}
          >
            {city.name}
            {!city.is_active && " (inactive)"}
          </button>
        ))}
      </div>

      {selected && cityDrafts[selected.id] && (
        <>
          {/* Fiche ville */}
          <section className="card mt-5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-[16px] font-bold text-ink">
                {selected.name}{" "}
                <span className="text-[12.5px] font-semibold text-ink/40">
                  /{selected.slug}
                </span>
              </h2>
              <button
                type="button"
                onClick={() => deleteCity(selected)}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                Supprimer la ville
              </button>
            </div>
            {(() => {
              const draft = cityDrafts[selected.id];
              const set = (patch: Partial<CityDraft>) =>
                setCityDrafts((d) => ({
                  ...d,
                  [selected.id]: { ...draft, ...patch, dirty: true },
                }));
              return (
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <div className="min-w-40 flex-1">
                    <label htmlFor="cv-name" className="label">
                      Nom
                    </label>
                    <input
                      id="cv-name"
                      type="text"
                      value={draft.name}
                      onChange={(e) => set({ name: e.target.value })}
                      className="field !py-2.5"
                    />
                  </div>
                  <div className="min-w-36 flex-1">
                    <label htmlFor="cv-region" className="label">
                      Région
                    </label>
                    <input
                      id="cv-region"
                      type="text"
                      value={draft.region}
                      onChange={(e) => set({ region: e.target.value })}
                      className="field !py-2.5"
                    />
                  </div>
                  <div>
                    <label htmlFor="cv-lat" className="label">
                      Latitude
                    </label>
                    <input
                      id="cv-lat"
                      type="text"
                      inputMode="decimal"
                      value={draft.lat}
                      onChange={(e) => set({ lat: e.target.value })}
                      className="field w-28 !py-2.5"
                    />
                  </div>
                  <div>
                    <label htmlFor="cv-lng" className="label">
                      Longitude
                    </label>
                    <input
                      id="cv-lng"
                      type="text"
                      inputMode="decimal"
                      value={draft.lng}
                      onChange={(e) => set({ lng: e.target.value })}
                      className="field w-28 !py-2.5"
                    />
                  </div>
                  <label className="flex items-center gap-2 py-2.5 text-[13.5px] font-semibold text-ink/70">
                    <input
                      type="checkbox"
                      checked={draft.is_active}
                      onChange={(e) => set({ is_active: e.target.checked })}
                      className="h-4.5 w-4.5 accent-[var(--color-primary)]"
                    />
                    Ville active (visible sur le site)
                  </label>
                  <button
                    type="button"
                    onClick={() => saveCity(selected)}
                    disabled={!draft.dirty || draft.saving}
                    className="btn-primary !px-4 !py-2.5 text-[13.5px] disabled:opacity-30"
                  >
                    {draft.saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Save className="h-4 w-4" aria-hidden />
                    )}
                    Enregistrer
                  </button>
                </div>
              );
            })()}
          </section>

          {/* Quartiers */}
          <section className="card mt-5 p-5">
            <h2 className="font-display flex items-center gap-2 text-[16px] font-bold text-ink">
              <MapPin className="h-4.5 w-4.5 text-primary" aria-hidden />
              Quartiers de {selected.name}
            </h2>

            {/* Ajout de quartier */}
            <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl bg-sand/60 p-3">
              <div className="min-w-40 flex-1">
                <label htmlFor="nh-name" className="label">
                  Nouveau quartier
                </label>
                <input
                  id="nh-name"
                  type="text"
                  value={newHood.name}
                  onChange={(e) => setNewHood((v) => ({ ...v, name: e.target.value }))}
                  placeholder="Ex. Guich Oudaya"
                  className="field !py-2.5"
                />
              </div>
              <div>
                <label htmlFor="nh-lat" className="label">
                  Latitude
                </label>
                <input
                  id="nh-lat"
                  type="text"
                  inputMode="decimal"
                  value={newHood.lat}
                  onChange={(e) => setNewHood((v) => ({ ...v, lat: e.target.value }))}
                  className="field w-28 !py-2.5"
                />
              </div>
              <div>
                <label htmlFor="nh-lng" className="label">
                  Longitude
                </label>
                <input
                  id="nh-lng"
                  type="text"
                  inputMode="decimal"
                  value={newHood.lng}
                  onChange={(e) => setNewHood((v) => ({ ...v, lng: e.target.value }))}
                  className="field w-28 !py-2.5"
                />
              </div>
              <button
                type="button"
                onClick={addHood}
                disabled={addingHood}
                className="btn-primary !px-4 !py-2.5 text-[13.5px]"
              >
                {addingHood ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Plus className="h-4 w-4" aria-hidden />
                )}
                Ajouter
              </button>
            </div>

            {hoodsLoading ? (
              <p className="mt-5 flex items-center gap-2 text-[14px] text-ink/50">
                <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden />
                Chargement…
              </p>
            ) : hoods.length === 0 ? (
              <p className="mt-5 text-[14px] text-ink/50">
                Aucun quartier pour l&apos;instant — ajoutez-en un ci-dessus,
                puis renseignez ses prix dans l&apos;onglet « Prix au m² ».
              </p>
            ) : (
              <ul className="mt-5 space-y-3">
                {hoods.map((hood) => {
                  const draft = hoodDrafts[hood.id];
                  if (!draft) return null;
                  const set = (patch: Partial<HoodDraft>) =>
                    setHoodDrafts((d) => ({
                      ...d,
                      [hood.id]: { ...draft, ...patch, dirty: true },
                    }));
                  return (
                    <li
                      key={hood.id}
                      className="flex flex-wrap items-end gap-3 border-t border-line/60 pt-3"
                    >
                      <div className="min-w-40 flex-1">
                        <label htmlFor={`h-name-${hood.id}`} className="label">
                          Nom{" "}
                          <span className="font-normal text-ink/40">
                            (/{hood.slug})
                          </span>
                        </label>
                        <input
                          id={`h-name-${hood.id}`}
                          type="text"
                          value={draft.name}
                          onChange={(e) => set({ name: e.target.value })}
                          className="field !py-2 text-[13.5px]"
                        />
                      </div>
                      <div>
                        <label htmlFor={`h-lat-${hood.id}`} className="label">
                          Latitude
                        </label>
                        <input
                          id={`h-lat-${hood.id}`}
                          type="text"
                          inputMode="decimal"
                          value={draft.lat}
                          onChange={(e) => set({ lat: e.target.value })}
                          className="field w-28 !py-2 text-[13.5px]"
                        />
                      </div>
                      <div>
                        <label htmlFor={`h-lng-${hood.id}`} className="label">
                          Longitude
                        </label>
                        <input
                          id={`h-lng-${hood.id}`}
                          type="text"
                          inputMode="decimal"
                          value={draft.lng}
                          onChange={(e) => set({ lng: e.target.value })}
                          className="field w-28 !py-2 text-[13.5px]"
                        />
                      </div>
                      <div className="flex items-center gap-2 pb-0.5">
                        <button
                          type="button"
                          onClick={() => saveHood(hood)}
                          disabled={!draft.dirty || draft.saving}
                          className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-2 text-[12px] font-bold text-white disabled:opacity-30"
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
                          onClick={() => deleteHood(hood)}
                          aria-label={`Supprimer ${hood.name}`}
                          className="p-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
