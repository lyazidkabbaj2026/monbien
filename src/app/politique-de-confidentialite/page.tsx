import { site } from "../../../site.config";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata = pageMetadata({
  title: "Politique de confidentialité",
  description: `Comment ${site.brandName} collecte, utilise et protège vos données personnelles (loi 09-08).`,
  path: "/politique-de-confidentialite",
});

export default function PrivacyPolicyPage() {
  return (
    <div className="wrap max-w-3xl py-10 sm:py-14">
      <Breadcrumbs
        items={[
          { name: "Accueil", path: "/" },
          { name: "Confidentialité", path: "/politique-de-confidentialite" },
        ]}
      />
      <h1 className="h-display mt-6 !text-3xl">Politique de confidentialité</h1>

      <div className="prose-blog mt-8">
        <p>
          {site.brandName} accorde une grande importance à la protection de vos
          données personnelles, conformément à la loi marocaine n° 09-08 relative à
          la protection des personnes physiques à l&apos;égard du traitement des
          données à caractère personnel.
        </p>

        <h2>Données collectées</h2>
        <p>
          Lorsque vous utilisez nos formulaires (estimation de bien, demande de
          visite, simulateur de crédit, rapport de prix, contact), nous collectons
          les données que vous nous transmettez volontairement : nom, numéro de
          téléphone, adresse email (facultative), ville et caractéristiques du bien
          concerné, ainsi que votre message éventuel.
        </p>

        <h2>Finalités</h2>
        <ul>
          <li>Vous transmettre l&apos;estimation ou les informations demandées ;</li>
          <li>Vous recontacter au sujet de votre projet immobilier ;</li>
          <li>Assurer le suivi de la relation commerciale ;</li>
          <li>Établir des statistiques d&apos;usage anonymisées de nos outils.</li>
        </ul>
        <p>
          <strong>Vos données ne sont ni vendues, ni louées, ni partagées</strong>{" "}
          avec des tiers à des fins commerciales.
        </p>

        <h2>Conservation et sécurité</h2>
        <p>
          Les données sont hébergées chez Supabase (serveurs situés dans l&apos;Union
          européenne, région Paris) et protégées par des règles d&apos;accès
          strictes : seul le propriétaire du site, authentifié, peut les consulter.
          Elles sont conservées pendant la durée nécessaire au suivi de votre
          projet, puis supprimées ou anonymisées.
        </p>

        <h2>Cookies et mesure d&apos;audience</h2>
        <p>
          Le site n&apos;utilise pas de cookies publicitaires. Une mesure
          d&apos;audience (Google Analytics) peut être activée pour comprendre
          l&apos;usage du site ; elle ne permet pas de vous identifier
          personnellement. Un stockage local technique mémorise vos préférences
          d&apos;affichage (ex. fermeture des invitations à estimer votre bien).
        </p>

        <h2>Vos droits</h2>
        <p>
          Vous disposez d&apos;un droit d&apos;accès, de rectification et
          d&apos;opposition sur vos données. Pour l&apos;exercer, écrivez-nous à{" "}
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> ou sur
          WhatsApp au +{site.whatsappNumber}. Nous répondons sous 30 jours au plus.
        </p>
      </div>
    </div>
  );
}
