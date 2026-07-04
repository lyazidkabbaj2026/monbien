"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Liens de navigation avec état actif et soulignement animé. */
export function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname() ?? "/";

  return (
    <>
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`nav-link text-[14.5px] font-medium transition ${
              active ? "is-active text-primary" : "text-ink/75 hover:text-primary"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
