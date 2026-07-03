"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Home, X } from "lucide-react";
import { site } from "../../site.config";

const STORAGE_KEY = "mb-nudge-snooze-until";
const SNOOZE_DAYS = 7;
const MIN_DWELL_MS = 8000; // jamais avant 8 s sur la page
const SCROLL_TRIGGER = 0.6; // 60 % de la page

/** Pages à forte intention où la relance estimation a du sens. */
function isHighIntentPage(pathname: string): boolean {
  return (
    pathname.startsWith("/annonces") ||
    pathname.startsWith("/prix-immobilier") ||
    pathname.startsWith("/quartiers") ||
    pathname.startsWith("/immobilier") ||
    pathname.startsWith("/blog/")
  );
}

function snoozed(): boolean {
  try {
    const until = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
    return Date.now() < until;
  } catch {
    return true;
  }
}

function snooze() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      String(Date.now() + SNOOZE_DAYS * 86_400_000)
    );
  } catch {
    // stockage indisponible : tant pis, pas de relance persistée
  }
}

/**
 * Relance estimation non intrusive : apparaît à l'intention de sortie
 * (souris vers le haut, desktop) ou après 60 % de scroll (mobile),
 * au plus une fois par semaine.
 */
export function ValuationNudge() {
  const pathname = usePathname() ?? "/";
  const [visible, setVisible] = useState(false);
  const armedAt = useRef(0);

  useEffect(() => {
    if (!isHighIntentPage(pathname) || snoozed()) return;
    armedAt.current = Date.now();
    let shown = false;

    const show = () => {
      if (shown || Date.now() - armedAt.current < MIN_DWELL_MS) return;
      shown = true;
      setVisible(true);
      cleanup();
    };

    const onMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY <= 8) show();
    };
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max > 400 && window.scrollY / max >= SCROLL_TRIGGER) show();
    };

    const cleanup = () => {
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", onScroll);
    };
    document.addEventListener("mouseout", onMouseOut);
    window.addEventListener("scroll", onScroll, { passive: true });
    return cleanup;
  }, [pathname]);

  if (!visible) return null;

  const dismiss = () => {
    snooze();
    setVisible(false);
  };

  return (
    <aside
      role="dialog"
      aria-label="Estimer mon bien"
      className="fixed bottom-20 left-4 z-50 max-w-[340px] rounded-2xl border border-line bg-white p-4 shadow-[0_18px_50px_-18px_rgba(20,24,27,0.4)] sm:bottom-6 sm:left-6"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Fermer"
        className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full text-ink/40 transition hover:bg-sand hover:text-ink"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Home className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-[14.5px] leading-snug font-bold text-ink">
            Combien vaut votre bien à {site.defaultCity} ?
          </p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink/60">
            Estimation gratuite en 2 minutes, basée sur les prix réels de votre
            quartier.
          </p>
          <Link
            href="/estimer-mon-bien"
            onClick={dismiss}
            className="btn-accent mt-3 !px-4 !py-2 text-[13px]"
          >
            Estimer gratuitement
          </Link>
        </div>
      </div>
    </aside>
  );
}
