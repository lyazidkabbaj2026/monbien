import Link from "next/link";
import { site } from "../../site.config";

/** Pictogramme de marque (maison + point « finder »). */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="7" fill="var(--brand-primary)" />
      <path d="M16 7.2 L25.4 15.6 H22.6 V24.4 H9.4 V15.6 H6.6 Z" fill="var(--brand-sand)" />
      <circle cx="16" cy="19" r="2.4" fill="var(--brand-accent)" />
    </svg>
  );
}

export function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <Link
      href="/"
      aria-label={`${site.brandName} — accueil`}
      className={`inline-flex items-center gap-2.5 ${onDark ? "text-white" : "text-ink"}`}
    >
      <LogoMark />
      <span className="font-display inline-flex items-baseline text-[21px] font-bold tracking-tight">
        {site.brandName}
        <span className="text-accent" aria-hidden>
          .
        </span>
      </span>
    </Link>
  );
}
