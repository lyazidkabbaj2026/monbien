"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ImagePlus, Loader2, Save, Trash2, X } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { slugify } from "@/lib/format";
import type { City, Listing, ListingImage, Neighborhood } from "@/lib/types";
import { propertyTypes, transactions } from "../../../site.config";

interface ListingFormProps {
  initial?: Listing | null;
  cities: City[];
  neighborhoods: Record<string, Neighborhood[]>;
}

function newRef() {
  return `MB-${Date.now().toString(36).toUpperCase()}`;
}

export function ListingForm({ initial, cities, neighborhoods }: ListingFormProps) {
  const router = useRouter();
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [transaction, setTransaction] = useState(initial?.transaction ?? "vente");
  const [propertyType, setPropertyType] = useState(initial?.property_type ?? "appartement");
  const [cityId, setCityId] = useState(initial?.city_id ?? "");
  const [neighborhoodId, setNeighborhoodId] = useState(initial?.neighborhood_id ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [areaM2, setAreaM2] = useState(initial?.area_m2 != null ? String(initial.area_m2) : "");
  const [rooms, setRooms] = useState(initial?.rooms != null ? String(initial.rooms) : "");
  const [bedrooms, setBedrooms] = useState(
    initial?.bedrooms != null ? String(initial.bedrooms) : ""
  );
  const [bathrooms, setBathrooms] = useState(
    initial?.bathrooms != null ? String(initial.bathrooms) : ""
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [featuresText, setFeaturesText] = useState((initial?.features ?? []).join("\n"));
  const [status, setStatus] = useState<Listing["status"]>(initial?.status ?? "active");
  const [isFeatured, setIsFeatured] = useState(initial?.is_featured ?? false);
  const [images, setImages] = useState<ListingImage[]>(initial?.images ?? []);
  const [ref] = useState(initial?.ref ?? newRef());

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const cityHoods = useMemo(
    () => (cityId ? (neighborhoods[cityId] ?? []) : []),
    [cityId, neighborhoods]
  );

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    const supabase = supabaseBrowser();
    try {
      const uploaded: ListingImage[] = [];
      for (const file of Array.from(files)) {
        const path = `${ref.toLowerCase()}/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${(file.name.split(".").pop() || "jpg").toLowerCase()}`;
        const { error: upErr } = await supabase.storage
          .from("listings")
          .upload(path, file, { cacheControl: "31536000", upsert: false });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("listings").getPublicUrl(path);
        uploaded.push({ url: data.publicUrl, alt: title || "Photo du bien" });
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(
        `Échec de l'envoi d'une photo : ${err instanceof Error ? err.message : "erreur inconnue"}`
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setError("");
    if (title.trim().length < 8) return setError("Titre trop court (8 caractères min).");
    if (!cityId) return setError("Choisissez une ville.");
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum <= 0)
      return setError("Prix invalide.");

    setSaving(true);
    const citySlug = cities.find((c) => c.id === cityId)?.slug ?? "";
    const hoodSlug = cityHoods.find((h) => h.id === neighborhoodId)?.slug;
    const slug =
      initial?.slug ??
      slugify(
        `${propertyType}-a-${transaction === "vente" ? "vendre" : "louer"}-${citySlug}${hoodSlug ? `-${hoodSlug}` : ""}-${ref}`
      );

    const row = {
      ref,
      title: title.trim(),
      slug,
      description: description.trim() || null,
      transaction,
      property_type: propertyType,
      city_id: cityId,
      neighborhood_id: neighborhoodId || null,
      price: priceNum,
      area_m2: areaM2 ? Number(areaM2) : null,
      rooms: rooms ? Number(rooms) : null,
      bedrooms: bedrooms ? Number(bedrooms) : null,
      bathrooms: bathrooms ? Number(bathrooms) : null,
      features: featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
      images,
      status,
      is_featured: isFeatured,
    };

    const supabase = supabaseBrowser();
    const query = isEdit
      ? supabase.from("listings").update(row).eq("id", initial.id)
      : supabase.from("listings").insert(row);
    const { error: dbErr } = await query;

    if (dbErr) {
      setError(`Enregistrement impossible : ${dbErr.message}`);
      setSaving(false);
      return;
    }

    await fetch("/api/admin/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: [slug] }),
    }).catch(() => {});

    router.push("/admin/annonces");
    router.refresh();
  }

  async function handleDelete() {
    if (!initial) return;
    if (!window.confirm(`Supprimer définitivement « ${initial.title} » ?`)) return;
    setSaving(true);
    const { error: dbErr } = await supabaseBrowser()
      .from("listings")
      .delete()
      .eq("id", initial.id);
    if (dbErr) {
      setError(`Suppression impossible : ${dbErr.message}`);
      setSaving(false);
      return;
    }
    await fetch("/api/admin/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: [initial.slug] }),
    }).catch(() => {});
    router.push("/admin/annonces");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Photos */}
      <section className="card p-5">
        <h2 className="mb-3 text-[14px] font-bold text-ink">
          Photos <span className="font-normal text-ink/45">(la première est la principale)</span>
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img, i) => (
            <div key={img.url} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-sand-deep">
              <Image src={img.url} alt="" fill sizes="200px" className="object-cover" />
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 rounded bg-ink/70 px-1.5 py-0.5 text-[10.5px] font-bold text-white">
                  Principale
                </span>
              )}
              <button
                type="button"
                onClick={() => setImages(images.filter((im) => im.url !== img.url))}
                aria-label="Retirer cette photo"
                className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-ink/70 text-white opacity-0 transition group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line text-[12.5px] font-semibold text-ink/50 transition hover:border-primary hover:text-primary">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
            ) : (
              <ImagePlus className="h-6 w-6" aria-hidden />
            )}
            {uploading ? "Envoi…" : "Ajouter"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleUpload(e.target.files)}
            />
          </label>
        </div>
      </section>

      {/* Essentiel */}
      <section className="card grid gap-4 p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="lf-title" className="label">
            Titre de l&apos;annonce *
          </label>
          <input
            id="lf-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="field"
            placeholder="Ex. Appartement lumineux 3 pièces avec balcon — Agdal"
          />
        </div>
        <div>
          <label htmlFor="lf-transaction" className="label">
            Transaction *
          </label>
          <select
            id="lf-transaction"
            value={transaction}
            onChange={(e) => setTransaction(e.target.value as Listing["transaction"])}
            className="field"
          >
            {transactions.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lf-type" className="label">
            Type de bien *
          </label>
          <select
            id="lf-type"
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
        <div>
          <label htmlFor="lf-city" className="label">
            Ville *
          </label>
          <select
            id="lf-city"
            value={cityId}
            onChange={(e) => {
              setCityId(e.target.value);
              setNeighborhoodId("");
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
          <label htmlFor="lf-hood" className="label">
            Quartier
          </label>
          <select
            id="lf-hood"
            value={neighborhoodId ?? ""}
            onChange={(e) => setNeighborhoodId(e.target.value)}
            disabled={cityHoods.length === 0}
            className="field disabled:opacity-50"
          >
            <option value="">—</option>
            {cityHoods.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lf-price" className="label">
            Prix (MAD{transaction === "location" ? "/mois" : ""}) *
          </label>
          <input
            id="lf-price"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="field"
            placeholder="1 850 000"
          />
        </div>
        <div>
          <label htmlFor="lf-area" className="label">
            Surface (m²)
          </label>
          <input
            id="lf-area"
            type="number"
            min={0}
            value={areaM2}
            onChange={(e) => setAreaM2(e.target.value)}
            className="field"
          />
        </div>
        <div className="grid grid-cols-3 gap-3 sm:col-span-2">
          <div>
            <label htmlFor="lf-rooms" className="label">
              Pièces
            </label>
            <input
              id="lf-rooms"
              type="number"
              min={0}
              value={rooms}
              onChange={(e) => setRooms(e.target.value)}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="lf-bedrooms" className="label">
              Chambres
            </label>
            <input
              id="lf-bedrooms"
              type="number"
              min={0}
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="lf-bathrooms" className="label">
              Salles de bains
            </label>
            <input
              id="lf-bathrooms"
              type="number"
              min={0}
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              className="field"
            />
          </div>
        </div>
      </section>

      {/* Description & prestations */}
      <section className="card grid gap-4 p-5">
        <div>
          <label htmlFor="lf-desc" className="label">
            Description{" "}
            <span className="font-normal text-ink/45">
              (paragraphes séparés par une ligne vide)
            </span>
          </label>
          <textarea
            id="lf-desc"
            rows={7}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="field resize-y"
          />
        </div>
        <div>
          <label htmlFor="lf-features" className="label">
            Prestations <span className="font-normal text-ink/45">(une par ligne)</span>
          </label>
          <textarea
            id="lf-features"
            rows={4}
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            className="field resize-y"
            placeholder={"Balcon\nAscenseur\nParking"}
          />
        </div>
      </section>

      {/* Publication */}
      <section className="card flex flex-wrap items-center gap-5 p-5">
        <div>
          <label htmlFor="lf-status" className="label">
            Statut
          </label>
          <select
            id="lf-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Listing["status"])}
            className="field !py-2.5"
          >
            <option value="active">En ligne</option>
            <option value="draft">Brouillon</option>
            <option value="sold">Vendu</option>
          </select>
        </div>
        <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-[14px] font-semibold text-ink">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="h-4.5 w-4.5 accent-[var(--brand-accent)]"
          />
          Mettre en vedette (home)
        </label>
        <p className="mt-5 text-[12.5px] text-ink/45">Réf. {ref}</p>
      </section>

      {error && (
        <p role="alert" className="text-[14px] font-medium text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={handleSave} disabled={saving || uploading} className="btn-accent">
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <Save className="h-4.5 w-4.5" aria-hidden />
          )}
          {isEdit ? "Enregistrer les modifications" : "Publier l'annonce"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-red-600 hover:underline"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Supprimer l&apos;annonce
          </button>
        )}
      </div>
    </div>
  );
}
