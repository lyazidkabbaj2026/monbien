"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import type { ListingImage } from "@/lib/types";

/**
 * Galerie d'annonce : grille principale + visionneuse plein écran
 * (clavier ← → Échap, compteur). La visionneuse ne se monte qu'à l'ouverture.
 */
export function ListingGallery({
  images,
  title,
  badge,
}: {
  images: ListingImage[];
  title: string;
  badge?: string;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const count = images.length;
  const show = useCallback(
    (i: number) => {
      setIndex(((i % count) + count) % count);
      setOpen(true);
    },
    [count]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % count);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, count]);

  if (count === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-sand-deep text-ink/30">
        Photos à venir
      </div>
    );
  }

  const [main, ...thumbs] = images;
  const extraCount = count - 3;

  return (
    <>
      {/* Grille */}
      <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        <button
          type="button"
          onClick={() => show(0)}
          aria-label="Agrandir la photo principale"
          className="group relative block aspect-[16/10] cursor-zoom-in overflow-hidden rounded-2xl bg-sand-deep"
        >
          <Image
            src={main.url}
            alt={main.alt ?? title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
          />
          {badge && (
            <span className="absolute top-4 left-4 rounded-full bg-ink/75 px-3.5 py-1.5 text-[13px] font-semibold text-white backdrop-blur">
              {badge}
            </span>
          )}
          {count > 1 && (
            <span className="absolute right-4 bottom-4 inline-flex items-center gap-1.5 rounded-full bg-ink/70 px-3 py-1.5 text-[12.5px] font-semibold text-white backdrop-blur">
              <Images className="h-4 w-4" aria-hidden />
              {count} photos
            </span>
          )}
        </button>
        {thumbs.length > 0 && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            {thumbs.slice(0, 2).map((img, i) => {
              const isLastVisible = i === 1 && extraCount > 0;
              return (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => show(i + 1)}
                  aria-label={`Voir la photo ${i + 2}`}
                  className="relative block aspect-[16/10] cursor-zoom-in overflow-hidden rounded-2xl bg-sand-deep lg:aspect-auto lg:h-full"
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? title}
                    fill
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                  {isLastVisible && (
                    <span className="absolute inset-0 flex items-center justify-center bg-ink/55 text-lg font-bold text-white">
                      +{extraCount} photos
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Visionneuse */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photos — ${title}`}
          className="fixed inset-0 z-[100] flex flex-col bg-ink/95"
          onClick={() => setOpen(false)}
        >
          <div className="flex items-center justify-between p-4 text-white">
            <span className="text-[13.5px] font-semibold text-white/80">
              {index + 1} / {count}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer la visionneuse"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div
            className="relative flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[index].url}
              alt={images[index].alt ?? `${title} — photo ${index + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setIndex((i) => (i - 1 + count) % count)}
                  aria-label="Photo précédente"
                  className="absolute top-1/2 left-3 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setIndex((i) => (i + 1) % count)}
                  aria-label="Photo suivante"
                  className="absolute top-1/2 right-3 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
          {images[index].alt && (
            <p className="p-4 text-center text-[13px] text-white/60">
              {images[index].alt}
            </p>
          )}
        </div>
      )}
    </>
  );
}
