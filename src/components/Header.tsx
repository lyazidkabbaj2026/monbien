import Link from "next/link";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { NavLinks } from "./NavLinks";

// L'estimation est la CTA principale : elle n'apparaît pas en double dans le menu.
export const NAV_LINKS = [
  { href: "/vendre", label: "Vendre" },
  { href: "/annonces", label: "Annonces" },
  { href: "/prix-immobilier", label: "Prix au m²" },
  { href: "/simulateur-credit", label: "Financer" },
  { href: "/blog", label: "Blog" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-sand/85 backdrop-blur-md print:hidden">
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigation principale">
          <NavLinks links={NAV_LINKS} />
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
