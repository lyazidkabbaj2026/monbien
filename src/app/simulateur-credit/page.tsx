import { site } from "../../../site.config";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CreditSimulator } from "@/components/CreditSimulator";
import { FaqBlock } from "@/components/FaqBlock";
import { Reveal } from "@/components/Reveal";

export const metadata = pageMetadata({
  title: "Simulateur de crédit immobilier au Maroc — mensualité & coût total",
  description:
    "Calculez gratuitement votre mensualité de crédit immobilier au Maroc : montant emprunté, taux, durée, coût des intérêts et tableau d'amortissement détaillé.",
  path: "/simulateur-credit",
});

const FAQS = [
  {
    question: "Quel est le taux de crédit immobilier moyen au Maroc ?",
    answer:
      "Les taux varient généralement entre 4 % et 5,5 % selon les banques, la durée et votre profil (revenus, apport, stabilité professionnelle). Le taux affiché n'est qu'un point de départ : il se négocie, surtout avec un bon dossier ou en faisant jouer la concurrence.",
  },
  {
    question: "Quel apport faut-il pour acheter au Maroc ?",
    answer:
      "Les banques financent le plus souvent jusqu'à 80–90 % du prix du bien ; un apport de 10 à 20 % est donc recommandé. N'oubliez pas d'y ajouter les frais annexes (enregistrement, conservation foncière, notaire), soit environ 6 à 8 % du prix.",
  },
  {
    question: "Quelle durée de crédit choisir ?",
    answer:
      "Plus la durée est longue, plus la mensualité baisse… mais plus le coût total des intérêts augmente. La plupart des acquéreurs choisissent 15 à 25 ans. Utilisez le simulateur pour trouver l'équilibre entre mensualité confortable et coût total maîtrisé.",
  },
  {
    question: "La mensualité affichée inclut-elle l'assurance ?",
    answer:
      "Non, la simulation est hors assurance décès-invalidité et frais de dossier. Comptez environ 0,3 à 0,5 % du capital par an pour l'assurance. Nos conseillers peuvent vous obtenir des devis précis auprès de plusieurs banques.",
  },
];

export default function SimulatorPage() {
  return (
    <>
      <section className="hero-surface">
        <div className="wrap py-10 sm:py-14">
          <Breadcrumbs
            items={[
              { name: "Accueil", path: "/" },
              { name: "Simulateur de crédit", path: "/simulateur-credit" },
            ]}
          />
          <div className="mt-6 max-w-2xl">
            <p className="kicker">Outil gratuit</p>
            <h1 className="h-display">Simulateur de crédit immobilier</h1>
            <p className="mt-4 text-[16px] leading-relaxed text-ink/70">
              Estimez votre mensualité en temps réel : ajustez le prix, l&apos;apport,
              le taux et la durée pour trouver le financement qui respecte votre
              budget — avant même de visiter.
            </p>
          </div>
        </div>
      </section>

      <section className="wrap py-10 sm:py-14">
        <CreditSimulator />
      </section>

      <section className="wrap pb-16">
        <Reveal>
          <FaqBlock faqs={FAQS} title="Crédit immobilier au Maroc : vos questions" />
        </Reveal>
      </section>
    </>
  );
}
