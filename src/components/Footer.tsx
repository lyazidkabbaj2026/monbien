import Link from "next/link";
import { site } from "../../site.config";
import { Logo } from "./Logo";
import { waLink, waMessages } from "@/lib/whatsapp";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Acheter",
    links: [
      { href: "/immobilier/rabat/appartement-a-vendre", label: "Appartements à vendre à Rabat" },
      { href: "/immobilier/rabat/villa-a-vendre", label: "Villas à vendre à Rabat" },
      { href: "/immobilier/casablanca/appartement-a-vendre", label: "Appartements à Casablanca" },
      { href: "/annonces?transaction=vente", label: "Toutes les ventes" },
    ],
  },
  {
    title: "Louer",
    links: [
      { href: "/immobilier/rabat/appartement-a-louer", label: "Appartements à louer à Rabat" },
      { href: "/quartiers/rabat/agdal", label: "Immobilier Agdal" },
      { href: "/quartiers/rabat/hay-riad", label: "Immobilier Hay Riad" },
      { href: "/annonces?transaction=location", label: "Toutes les locations" },
    ],
  },
  {
    title: "Outils gratuits",
    links: [
      { href: "/estimer-mon-bien", label: "Estimer mon bien" },
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
          <a
            href={waLink(waMessages.generic)}
            target="_blank"
            rel="noopener"
            className="btn-whatsapp mt-5 !px-5 !py-2.5 text-[14px]"
          >
            Discuter sur WhatsApp
          </a>
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
