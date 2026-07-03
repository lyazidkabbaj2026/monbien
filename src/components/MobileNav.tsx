"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-white/70 text-ink"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <nav
          aria-label="Navigation mobile"
          className="absolute inset-x-0 top-16 border-b border-line bg-sand shadow-xl"
        >
          <ul className="wrap flex flex-col py-3">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3.5 text-[16px] font-medium text-ink/85"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="py-3">
              <Link
                href="/estimer-mon-bien"
                onClick={() => setOpen(false)}
                className="btn-accent w-full"
              >
                Estimation gratuite
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
