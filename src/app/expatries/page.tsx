import Link from "next/link";
import {
  ArrowRight,
  Globe2,
  KeyRound,
  Plane,
  ShieldCheck,
  Video,
} from "lucide-react";
import { site } from "../../../site.config";
import { ogCard, pageMetadata } from "@/lib/seo";
import { waLink } from "@/lib/whatsapp";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqBlock, type Faq } from "@/components/FaqBlock";
import { LeadForm } from "@/components/LeadForm";
import { Reveal } from "@/components/Reveal";
import { WaButton } from "@/components/WaButton";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export const revalidate = 21600;

export const metadata = pageMetadata({
  title: `Expatriés & MRE — acheter ou louer à ${site.defaultCity} à distance`,
  description: `Expatrié à ${site.defaultCity} ou Marocain résidant à l'étranger : recherche à distance, visites vidéo, bail et achat sécurisés chez le notaire, installation clé en main avec ${site.brandName}.`,
  path: "/expatries",
  image: ogCard(
    "Expatriés & MRE",
    "Acheter ou louer à Rabat depuis l'étranger, en toute sécurité.",
    "À distance"
  ),
});

const STEPS = [
  {
    icon: Globe2,
    title: "Brief à distance",
    text: "Visio ou WhatsApp : votre budget, vos quartiers, votre calendrier. Vous recevez une sélection ciblée sous quelques jours — pas un catalogue.",
  },
  {
    icon: Video,
    title: "Visites vidéo en direct",
    text: "Nous visitons pour vous, caméra au poing : défauts montrés honnêtement, environnement du bien, questions en direct. Vous décidez comme si vous y étiez.",
  },
  {
    icon: ShieldCheck,
    title: "Sécurisation juridique",
    text: "Vérification du titre foncier, bail enregistré ou compromis chez le notaire, procuration si nécessaire : chaque étape est sécurisée sans que vous ayez à faire l'aller-retour.",
  },
  {
    icon: KeyRound,
    title: "Installation clé en main",
    text: "État des lieux, compteurs (eau, électricité, internet), petites réparations, remise des clés à votre arrivée — ou gestion locative si vous restez à l'étranger.",
  },
];

const AUDIENCES = [
  {
    title: "Expatriés & diplomates à Rabat",
    text: `Ambassades, organisations internationales, entreprises : nous logeons les nouveaux arrivants dans les quartiers qui leur correspondent — Souissi, Hay Riad, Agdal, L'Océan — avec des baux clairs et un interlocuteur francophone et anglophone.`,
    links: [
      { href: "/quartiers/rabat/souissi", label: "Souissi" },
      { href: "/quartiers/rabat/hay-riad", label: "Hay Riad" },
      { href: "/quartiers/rabat/agdal", label: "Agdal" },
      { href: "/quartiers/rabat/l-ocean", label: "L'Océan" },
    ],
  },
  {
    title: "Marocains résidant à l'étranger (MRE)",
    text: "Acheter au pays sans y être : sourcing selon vos critères, visites vidéo, négociation sur données de prix réelles, signature par procuration chez le notaire. Et si vous vendez ou louez un bien familial depuis l'étranger, nous gérons tout sur place.",
    links: [
      { href: "/estimer-mon-bien", label: "Estimer un bien au Maroc" },
      { href: "/prix-immobilier", label: "Prix par quartier" },
      { href: "/avant-premiere", label: "Alerte avant-première" },
    ],
  },
];

const FAQS: Faq[] = [
  {
    question: "Puis-je vraiment acheter à Rabat sans me déplacer ?",
    answer:
      "Oui. La procuration notariée (établie au consulat du Maroc de votre pays de résidence ou chez un notaire local puis légalisée) permet de signer compromis et acte définitif à distance. Nous coordonnons notaire, banque et vendeur ; vous validez chaque étape par visio.",
  },
  {
    question: "Comment être sûr de l'état réel du bien depuis l'étranger ?",
    answer:
      "Visites vidéo en direct où nous montrons tout — y compris les défauts —, photos détaillées, vérification des documents (titre foncier, charges, PV de copropriété) et, si vous le souhaitez, contre-visite avec un expert technique indépendant.",
  },
  {
    question: "Quels quartiers de Rabat privilégient les expatriés ?",
    answer:
      "Souissi (ambassades, villas, écoles internationales), Hay Riad (résidences modernes, ministères), Agdal (centralité, vie urbaine) et L'Océan (charme, océan) concentrent l'essentiel de la demande expatriée. Le bon choix dépend de votre lieu de travail et de votre mode de vie — on vous conseille honnêtement.",
  },
  {
    question: "Un MRE peut-il obtenir un crédit immobilier au Maroc ?",
    answer:
      "Oui, la plupart des banques marocaines financent les MRE (souvent jusqu'à 70-80 % du prix), sur présentation des justificatifs de revenus du pays de résidence. Utilisez notre simulateur de capacité d'emprunt pour un ordre de grandeur, puis nous montons le dossier avec vous.",
  },
  {
    question: "Dans quelles langues travaillez-vous ?",
    answer:
      "Français, arabe (darija) et anglais — pour les échanges comme pour l'accompagnement des démarches sur place.",
  },
];

export default function ExpatsPage() {
  return (
    <>
      <section className="hero-surface">
        <div className="wrap py-12 sm:py-16">
          <Breadcrumbs
            items={[
              { name: "Accueil", path: "/" },
              { name: "Expatriés & MRE", path: "/expatries" },
            ]}
          />
          <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <p className="kicker">
                <Plane className="h-4 w-4" aria-hidden />
                Expatriés & MRE
              </p>
              <h1 className="h-display">
                Votre projet immobilier à {site.defaultCity},{" "}
                <span className="text-primary">même à 5 000 km</span>
              </h1>
              <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-ink/70">
                Vous arrivez à Rabat en poste, ou vous investissez au pays depuis
                l&apos;étranger : nous cherchons, visitons en vidéo, négocions et
                sécurisons chez le notaire — vous décidez, nous exécutons sur place.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <WaButton
                  href={waLink(
                    `Bonjour ${site.brandName}, je suis à l'étranger et j'ai un projet immobilier à Rabat (location ou achat).`
                  )}
                  placement="expat_hero"
                  className="btn-whatsapp text-[15.5px]"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Décrire mon projet sur WhatsApp
                </WaButton>
                <Link href="/avant-premiere" className="btn-outline">
                  Déposer mes critères
                </Link>
              </div>
              <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[13.5px] text-ink/60">
                <li>
                  <strong className="font-display block text-xl text-ink">3 langues</strong>
                  français, darija, anglais
                </li>
                <li>
                  <strong className="font-display block text-xl text-ink">100 %</strong>
                  des démarches gérables à distance
                </li>
                <li>
                  <strong className="font-display block text-xl text-ink">15 min</strong>
                  temps de réponse moyen
                </li>
              </ul>
            </div>
            <Reveal>
              <div className="card p-6 sm:p-7">
                <h2 className="font-display text-lg font-bold text-ink">
                  Être rappelé (WhatsApp ou visio)
                </h2>
                <p className="mt-1 mb-5 text-[13.5px] text-ink/60">
                  Indiquez votre fuseau horaire dans le message — on s&apos;adapte.
                </p>
                <LeadForm
                  source="contact"
                  sourceRef="expatries"
                  withMessage
                  cta="Être rappelé où que je sois"
                  successText="Bien reçu — nous vous recontactons sur WhatsApp en tenant compte de votre fuseau."
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="dark-surface text-white">
        <div className="wrap py-14">
          <Reveal>
            <p className="kicker !text-accent">Comment ça marche</p>
            <h2 className="h-section !text-white">Tout se fait à distance, sauf vivre dedans</h2>
          </Reveal>
          <ol className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 60}>
                <li className="flex h-full flex-col rounded-2xl border border-white/12 bg-white/[0.06] p-6">
                  <div className="flex items-center justify-between">
                    <step.icon className="h-7 w-7 text-accent" aria-hidden />
                    <span className="font-display text-3xl font-bold text-white/20">{i + 1}</span>
                  </div>
                  <h3 className="font-display mt-4 text-[16px] font-bold">{step.title}</h3>
                  <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-white/70">
                    {step.text}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Deux publics */}
      <section className="wrap py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          {AUDIENCES.map((audience, i) => (
            <Reveal key={audience.title} delay={i * 80}>
              <div className="card h-full p-7">
                <h2 className="font-display text-[18px] font-bold text-ink">
                  {audience.title}
                </h2>
                <p className="mt-3 text-[14.5px] leading-relaxed text-ink/70">
                  {audience.text}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {audience.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold text-primary transition hover:border-primary"
                    >
                      {link.label}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="wrap pb-16">
        <Reveal>
          <FaqBlock faqs={FAQS} title="Acheter ou louer à distance : vos questions" />
        </Reveal>
      </section>
    </>
  );
}
