"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ExternalLink, Menu, X } from "lucide-react";
import { LogoutButton } from "./LogoutButton";

const LINKS = [
  { href: "/admin", label: "Leads" },
  { href: "/admin/annonces", label: "Annonces" },
  { href: "/admin/prix", label: "Prix au m²" },
  { href: "/admin/villes", label: "Villes & quartiers" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/stats", label: "Statistiques" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Navigation desktop */}
      <nav
        aria-label="Navigation admin"
        className="hidden min-w-0 flex-1 items-center gap-1 lg:flex"
      >
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 rounded-lg px-3 py-2 text-[13.5px] font-semibold transition ${
              isActive(pathname, link.href)
                ? "bg-primary-soft text-primary"
                : "text-ink/65 hover:bg-primary-soft/60 hover:text-primary"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="hidden items-center gap-4 lg:flex">
        <a
          href="/"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink/60 transition hover:text-ink"
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
          Voir le site
        </a>
        <LogoutButton />
      </div>

      {/* Menu mobile */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-white text-ink"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        {open && (
          <nav
            aria-label="Navigation admin mobile"
            className="absolute inset-x-0 top-14 z-40 border-b border-line bg-white shadow-xl"
          >
            <ul className="wrap flex flex-col py-2">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-lg px-3 py-3.5 text-[15.5px] font-semibold ${
                      isActive(pathname, link.href)
                        ? "bg-primary-soft text-primary"
                        : "text-ink/80"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2 flex items-center justify-between gap-4 border-t border-line/70 px-3 py-4">
                <a
                  href="/"
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink/60"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  Voir le site
                </a>
                <LogoutButton />
              </li>
            </ul>
          </nav>
        )}
      </div>
    </>
  );
}
