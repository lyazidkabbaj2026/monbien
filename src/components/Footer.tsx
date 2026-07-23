import Link from "next/link";
import { site } from "../../site.config";
import { Logo } from "./Logo";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { waLink, waMessages } from "@/lib/whatsapp";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Acheter",
    links: [
      { href: "/immobilier/rabat/appartement-a-vendre", label: "Appartements à vendre à Rabat" },
      { href: "/immobilier/rabat/villa-a-vendre", label: "Villas à vendre à Rabat" },
      { href: "/immobilier/casablanca/appartement-a-vendre", label: "Appartements à Casablanca" },
      { href: "/avant-premiere", label: "Biens en avant-première" },
      { href: "/annonces", label: "Toutes les annonces" },
    ],
  },
  {
    title: "Services",
    links: [
      { href: "/vendre", label: "Vendre mon bien" },
      { href: "/estimer-mon-bien", label: "Estimation gratuite" },
      { href: "/expatries", label: "Expatriés & MRE" },
      { href: "/professionnels", label: "Professionnels & B2B" },
    ],
  },
  {
    title: "Outils gratuits",
    links: [
      { href: "/capacite-emprunt", label: "Capacité d'emprunt" },
      { href: "/simulateur-credit", label: "Simulateur de crédit" },
      { href: "/prix-immobilier", label: "Carte des prix au m²" },
      { href: "/blog", label: "Guides & conseils" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="dark-surface mt-20 text-white print:hidden">
      <div className="wrap grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo onDark />
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-white/70">
            {site.tagline}. Estimation gratuite, accompagnement de A à Z et
            réponse rapide sur WhatsApp.
          </p>
          {/* Réseaux : trois tuiles égales, alignées sur la largeur du paragraphe */}
          <div className="mt-5 grid max-w-xs grid-cols-3 gap-2.5">
            <a
              href={waLink(waMessages.generic)}
              target="_blank"
              rel="noopener"
              aria-label={`${site.brandName} sur WhatsApp`}
              className="flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] text-white/75 transition hover:border-whatsapp hover:bg-whatsapp hover:text-white"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </a>
            {site.instagram && (
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener"
                aria-label={`${site.brandName} sur Instagram`}
                className="flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] text-white/75 transition hover:border-white/60 hover:bg-white/10 hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            )}
            {site.tiktok && (
              <a
                href={site.tiktok}
                target="_blank"
                rel="noopener"
                aria-label={`${site.brandName} sur TikTok`}
                className="flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] text-white/75 transition hover:border-white/60 hover:bg-white/10 hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            )}
          </div>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="font-display mb-4 text-[15px] font-bold tracking-wide text-white/95">
              {col.title}
            </h3>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-white/65 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-2 py-6 text-[13px] text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.brandName} — Immobilier à{" "}
            {site.defaultCity}, Maroc.
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/mentions-legales" className="hover:text-white">
              Mentions légales
            </Link>
            <Link href="/politique-de-confidentialite" className="hover:text-white">
              Confidentialité
            </Link>
            <a href={`mailto:${site.contactEmail}`} className="hover:text-white">
              {site.contactEmail}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
