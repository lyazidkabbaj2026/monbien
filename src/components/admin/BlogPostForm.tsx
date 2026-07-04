"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Save, Trash2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { slugify } from "@/lib/format";
import type { BlogPost } from "@/lib/types";

export function BlogPostForm({ initial }: { initial?: BlogPost | null }) {
  const router = useRouter();
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [category, setCategory] = useState(initial?.category ?? "Conseils");
  const [metaDescription, setMetaDescription] = useState(initial?.meta_description ?? "");
  const [heroImage, setHeroImage] = useState(initial?.hero_image ?? "");
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(", "));
  const [bodyMd, setBodyMd] = useState(initial?.body_md ?? "");
  const [status, setStatus] = useState<BlogPost["status"]>(initial?.status ?? "published");
  const [author, setAuthor] = useState(initial?.author ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function revalidateBlog(postSlug: string, postCategory: string | null) {
    const paths = ["/blog", `/blog/${postSlug}`];
    if (postCategory) paths.push(`/blog/categorie/${slugify(postCategory)}`);
    if (initial?.category && initial.category !== postCategory) {
      paths.push(`/blog/categorie/${slugify(initial.category)}`);
    }
    await fetch("/api/admin/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths }),
    }).catch(() => {});
  }

  async function handleSave() {
    setError("");
    if (title.trim().length < 8) return setError("Titre trop court.");
    if (bodyMd.trim().length < 100)
      return setError("Contenu trop court (100 caractères minimum).");
    const finalSlug = slugify(slug || title);
    if (!finalSlug) return setError("Slug invalide.");

    setSaving(true);
    const row = {
      title: title.trim(),
      slug: finalSlug,
      category: category.trim() || null,
      meta_description: metaDescription.trim() || null,
      hero_image: heroImage.trim() || null,
      tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      body_md: bodyMd,
      status,
      author: author.trim() || null,
      published_at:
        status === "published" ? (initial?.published_at ?? new Date().toISOString()) : null,
      updated_at: new Date().toISOString(),
    };

    const supabase = supabaseBrowser();
    const query = isEdit
      ? supabase.from("blog_posts").update(row).eq("id", initial.id)
      : supabase.from("blog_posts").insert(row);
    const { error: dbErr } = await query;

    if (dbErr) {
      setError(
        dbErr.message.includes("duplicate")
          ? "Ce slug existe déjà — choisissez-en un autre."
          : dbErr.message
      );
      setSaving(false);
      return;
    }

    await revalidateBlog(finalSlug, row.category);
    router.push("/admin/blog");
    router.refresh();
  }

  async function handleDelete() {
    if (!initial) return;
    if (!window.confirm(`Supprimer définitivement « ${initial.title} » ?`)) return;
    setSaving(true);
    const { error: dbErr } = await supabaseBrowser()
      .from("blog_posts")
      .delete()
      .eq("id", initial.id);
    if (dbErr) {
      setError(dbErr.message);
      setSaving(false);
      return;
    }
    await revalidateBlog(initial.slug, initial.category);
    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="card grid gap-4 p-5">
        <div>
          <label htmlFor="bp-title" className="label">
            Titre *
          </label>
          <input
            id="bp-title"
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="field"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bp-slug" className="label">
              Slug (URL)
            </label>
            <input
              id="bp-slug"
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              className="field font-mono text-[13px]"
            />
          </div>
          <div>
            <label htmlFor="bp-category" className="label">
              Catégorie
            </label>
            <input
              id="bp-category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="field"
              placeholder="Conseils, Marché, Quartiers, Financement…"
            />
          </div>
        </div>
        <div>
          <label htmlFor="bp-meta" className="label">
            Meta description{" "}
            <span className="font-normal text-ink/45">
              ({metaDescription.length}/160 — visée : 150–160)
            </span>
          </label>
          <textarea
            id="bp-meta"
            rows={2}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className="field resize-none"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bp-hero" className="label">
              Image de couverture (URL https)
            </label>
            <input
              id="bp-hero"
              type="url"
              value={heroImage}
              onChange={(e) => setHeroImage(e.target.value)}
              className="field font-mono text-[12.5px]"
            />
          </div>
          <div>
            <label htmlFor="bp-tags" className="label">
              Tags <span className="font-normal text-ink/45">(séparés par des virgules)</span>
            </label>
            <input
              id="bp-tags"
              type="text"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className="field"
            />
          </div>
        </div>
      </div>

      <div className="card p-5">
        <label htmlFor="bp-body" className="label">
          Contenu (Markdown) *
        </label>
        <textarea
          id="bp-body"
          rows={22}
          value={bodyMd}
          onChange={(e) => setBodyMd(e.target.value)}
          className="field resize-y font-mono text-[13px] leading-relaxed"
          placeholder={"## Sous-titre\n\nVotre contenu en **Markdown**…"}
        />
        <p className="mt-2 text-[12px] text-ink/45">
          {bodyMd.split(/\s+/).filter(Boolean).length} mots · ##&nbsp;sous-titres,
          **gras**, [liens](/estimer-mon-bien), listes à puces pris en charge.
        </p>
      </div>

      <div className="card flex flex-wrap items-end gap-5 p-5">
        <div>
          <label htmlFor="bp-status" className="label">
            Statut
          </label>
          <select
            id="bp-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as BlogPost["status"])}
            className="field !py-2.5"
          >
            <option value="published">Publié</option>
            <option value="draft">Brouillon (retiré du site)</option>
          </select>
        </div>
        <div>
          <label htmlFor="bp-author" className="label">
            Auteur
          </label>
          <input
            id="bp-author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="field !py-2.5"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-[14px] font-medium text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={handleSave} disabled={saving} className="btn-accent">
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <Save className="h-4.5 w-4.5" aria-hidden />
          )}
          {isEdit ? "Enregistrer" : "Créer l'article"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-red-600 hover:underline"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Supprimer l&apos;article
          </button>
        )}
      </div>
    </div>
  );
}
