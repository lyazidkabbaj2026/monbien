import Link from "next/link";
import { site } from "../../../site.config";
import { ogCard, pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BorrowingCapacity } from "@/components/BorrowingCapacity";
import { FaqBlock, type Faq } from "@/components/FaqBlock";
import { Reveal } from "@/components/Reveal";

export const metadata = pageMetadata({
  title: "Capacité d'emprunt au Maroc — combien pouvez-vous emprunter ?",
  description:
    "Calculez gratuitement votre capacité d'emprunt immobilier au Maroc : mensualité maximale, capital empruntable et budget d'achat réel (frais déduits), selon vos revenus.",
  path: "/capacite-emprunt",
  image: ogCard(
    "Quelle est votre capacité d'emprunt ?",
    "Mensualité max, capital empruntable et budget d'achat réel selon vos revenus.",
    "Gratuit"
  ),
});

const FAQS: Faq[] = [
  {
    question: "Comment les banques calculent-elles ma capacité d'emprunt au Maroc ?",
    answer:
      "La règle centrale est le taux d'endettement : vos mensualités de crédit (toutes confondues) ne doivent généralement pas dépasser 40 à 45 % de vos revenus nets mensuels. La banque examine aussi l'ancienneté professionnelle, le secteur d'activité, l'apport et l'historique bancaire.",
  },
  {
    question: "Quels revenus sont pris en compte ?",
    answer:
      "Les salaires nets (les deux conjoints pour un achat en couple), les revenus locatifs existants (souvent retenus à 50-70 %), et les revenus professionnels justifiés sur 2-3 ans pour les indépendants. Les primes irrégulières sont rarement retenues en totalité.",
  },
  {
    question: "Pourquoi déduire 7 % de frais de mon budget ?",
    answer:
      "Parce qu'au prix du bien s'ajoutent les droits d'enregistrement (~4 %), la conservation foncière (~1,5 %), le notaire (~1 %) et les frais bancaires. Notre calcul affiche votre budget « prix du bien » réel — pas un chiffre théorique qui explose au moment de signer.",
  },
  {
    question: "Qu'est-ce qu'un accord de principe et pourquoi en obtenir un ?",
    answer:
      "C'est un document par lequel la banque confirme, dossier examiné, qu'elle est disposée à vous prêter un montant donné. Face à un vendeur, un acheteur avec accord de principe passe devant les autres — et négocie mieux. Nous préparons ce dossier avec vous gratuitement.",
  },
  {
    question: "Emprunter sur 20 ou 25 ans, que choisir ?",
    answer:
      "25 ans augmente votre capacité d'emprunt et baisse la mensualité, mais renchérit le coût total des intérêts. La bonne durée dépend de votre âge, de vos projets et de votre épargne de sécurité. Utilisez notre simulateur de crédit pour comparer les deux scénarios en 30 secondes.",
  },
];

export default function BorrowingCapacityPage() {
  return (
    <>
      <section className="hero-surface">
        <div className="wrap py-10 sm:py-14">
          <Breadcrumbs
            items={[
              { name: "Accueil", path: "/" },
              { name: "Capacité d'emprunt", path: "/capacite-emprunt" },
            ]}
          />
          <div className="mt-6 max-w-2xl">
            <p className="kicker">Outil gratuit</p>
            <h1 className="h-display">Combien pouvez-vous emprunter ?</h1>
            <p className="mt-4 text-[16px] leading-relaxed text-ink/70">
              Avant de visiter, sachez ce que les banques vous prêteront : mensualité
              maximale, capital empruntable et surtout votre{" "}
              <strong>budget d&apos;achat réel</strong>, frais d&apos;acquisition
              déduits.
            </p>
          </div>
        </div>
      </section>

      <section className="wrap py-10 sm:py-14">
        <BorrowingCapacity />
      </section>

      <section className="wrap pb-16">
        <Reveal>
          <FaqBlock faqs={FAQS} title="Capacité d'emprunt : vos questions" />
        </Reveal>
        <p className="mt-8 text-[14px] text-ink/60">
          Voir aussi :{" "}
          <Link href="/simulateur-credit" className="font-semibold text-primary hover:underline">
            Simulateur de mensualités
          </Link>{" "}
          ·{" "}
          <Link href="/prix-immobilier" className="font-semibold text-primary hover:underline">
            Prix au m² par quartier
          </Link>{" "}
          ·{" "}
          <Link href="/avant-premiere" className="font-semibold text-primary hover:underline">
            Biens en avant-première
          </Link>
        </p>
      </section>
    </>
  );
}
