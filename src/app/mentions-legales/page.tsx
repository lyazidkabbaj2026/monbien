import { site } from "../../../site.config";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata = pageMetadata({
  title: "Mentions légales",
  description: `Mentions légales du site ${site.brandName} — édition, hébergement et propriété intellectuelle.`,
  path: "/mentions-legales",
});

export default function LegalNoticePage() {
  return (
    <div className="wrap max-w-3xl py-10 sm:py-14">
      <Breadcrumbs
        items={[
          { name: "Accueil", path: "/" },
          { name: "Mentions légales", path: "/mentions-legales" },
        ]}
      />
      <h1 className="h-display mt-6 !text-3xl">Mentions légales</h1>

      <div className="prose-blog mt-8">
        <h2>Éditeur du site</h2>
        <p>
          Le site {siteUrl().replace(/^https?:\/\//, "")} (« {site.brandName} ») est
          édité par {site.brandName}, activité de conseil et d&apos;intermédiation
          immobilière basée à {site.defaultCity}, Maroc.
          {/* À compléter après immatriculation : raison sociale, RC, ICE, adresse. */}
        </p>
        <p>
          Contact :{" "}
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> ·
          WhatsApp : +{site.whatsappNumber}
        </p>

        <h2>Hébergement</h2>
        <p>
          Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA
          91723, États-Unis (vercel.com). Les données sont stockées par Supabase
          Inc. (supabase.com) sur des serveurs situés dans l&apos;Union européenne
          (région Paris, eu-west-3).
        </p>

        <h2>Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble des contenus du site (textes, visuels, logo, structure,
          base de données de prix) est la propriété de {site.brandName}, sauf
          mention contraire. Toute reproduction, extraction ou réutilisation non
          autorisée est interdite. Certaines photographies d&apos;illustration
          proviennent de banques d&apos;images libres de droits (Unsplash).
        </p>

        <h2>Caractère indicatif des informations</h2>
        <p>
          Les estimations de prix, prix au m² et simulations de crédit fournis par
          le site sont <strong>indicatifs</strong> et ne constituent ni une
          expertise immobilière, ni un avis de valeur opposable, ni une offre de
          crédit. Chaque bien mérite une évaluation individuelle et chaque
          financement dépend des conditions bancaires en vigueur.
        </p>

        <h2>Responsabilité</h2>
        <p>
          {`${site.brandName} s'efforce d'assurer l'exactitude des`}{" "}
          informations publiées mais ne saurait être tenu responsable des erreurs,
          omissions ou de l&apos;indisponibilité temporaire du service. Les liens
          externes ne relèvent pas de la responsabilité de l&apos;éditeur.
        </p>
      </div>
    </div>
  );
}
