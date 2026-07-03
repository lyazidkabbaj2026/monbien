import Link from "next/link";
import { site } from "../../site.config";

export function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <Link
      href="/"
      aria-label={`${site.brandName} — accueil`}
      className={`font-display inline-flex items-baseline gap-0.5 text-[22px] font-bold tracking-tight ${
        onDark ? "text-white" : "text-ink"
      }`}
    >
      {site.brandName}
      <span className="text-accent" aria-hidden>
        .
      </span>
    </Link>
  );
}
