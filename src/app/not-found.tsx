import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { site } from "../../site.config";

export default function NotFound() {
  return (
    <div className="hero-surface">
      <div className="wrap flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <Compass className="h-12 w-12 text-accent" aria-hidden />
        <p className="kicker mt-6">Erreur 404</p>
        <h1 className="h-display max-w-xl !text-3xl sm:!text-4xl">
          Cette page a déménagé — pas vous.
        </h1>
        <p className="mt-4 max-w-md text-[15.5px] leading-relaxed text-ink/65">
          L&apos;adresse demandée n&apos;existe pas ou plus. Reprenez votre projet
          immobilier à {site.defaultCity} là où il compte :
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/estimer-mon-bien" className="btn-accent">
            Estimer mon bien
            <ArrowRight className="h-4.5 w-4.5" aria-hidden />
          </Link>
          <Link href="/annonces" className="btn-outline">
            Voir les annonces
          </Link>
          <Link href="/prix-immobilier" className="btn-outline">
            Prix au m²
          </Link>
        </div>
        <p className="mt-10 text-[13.5px] text-ink/50">
          Ou consultez nos{" "}
          <Link href="/blog" className="font-semibold text-primary hover:underline">
            guides et conseils
          </Link>{" "}
          pour préparer votre projet.
        </p>
      </div>
    </div>
  );
}
