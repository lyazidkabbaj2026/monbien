import Link from "next/link";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";

export const NAV_LINKS = [
  { href: "/annonces", label: "Annonces" },
  { href: "/estimer-mon-bien", label: "Estimer mon bien" },
  { href: "/simulateur-credit", label: "Simulateur de crédit" },
  { href: "/prix-immobilier", label: "Prix au m²" },
  { href: "/blog", label: "Blog" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-sand/85 backdrop-blur-md">
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[14.5px] font-medium text-ink/75 transition hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/estimer-mon-bien"
            className="btn-accent hidden !px-5 !py-2.5 text-[14px] sm:inline-flex"
          >
            Estimation gratuite
          </Link>
          <MobileNav links={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
