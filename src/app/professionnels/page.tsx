import Link from "next/link";
import {
  Briefcase,
  Building,
  Database,
  Handshake,
  LineChart,
  Users,
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
  title: `Professionnels & entreprises — solutions immobilières B2B à ${site.defaultCity}`,
  description: `Promoteurs, entreprises, banques, notaires : commercialisation de programmes, logement de collaborateurs, gestion de parc et partenariats avec ${site.brandName} à ${site.defaultCity}.`,
  path: "/professionnels",
  image: ogCard(
    "Solutions immobilières B2B",
    "Promoteurs, entreprises, banques et notaires : travaillons ensemble à Rabat.",
    "Professionnels"
  ),
});

const SERVICES = [
  {
    icon: Building,
    title: "Promoteurs : commercialisation de programmes",
    text: "Nous vendons vos lots neufs en nous appuyant sur notre base d'acheteurs qualifiés, nos pages quartiers et nos outils de financement. Reporting de commercialisation régulier, discours de vente calé sur les données de prix du secteur.",
  },
  {
    icon: Users,
    title: "Entreprises : logement de vos collaborateurs",
    text: "Mutation, expatriation, mission longue : nous trouvons, négocions et sécurisons les logements de vos équipes à Rabat — baux vérifiés, états des lieux, interlocuteur unique et facturation claire.",
  },
  {
    icon: Handshake,
    title: "Banques & courtiers : apport d'affaires croisé",
    text: "Nos simulateurs de crédit et de capacité d'emprunt génèrent chaque mois des acheteurs en recherche de financement. Construisons un partenariat d'orientation réciproque, dans la transparence.",
  },
  {
    icon: Briefcase,
    title: "Notaires & professions du droit",
    text: "Successions, indivisions, ventes sur décision de justice : nous prenons en charge l'estimation objective, la mise en marché et la coordination des parties, avec la discrétion qu'exigent ces dossiers.",
  },
  {
    icon: Database,
    title: "Investisseurs : sourcing & gestion de parc",
    text: "Constitution de portefeuilles locatifs (sourcing off-market, analyse de rendement par quartier), puis mise en location et suivi. Vous décidez sur données, nous exécutons.",
  },
  {
    icon: LineChart,
    title: "Données de marché",
    text: "Nos rapports de prix par quartier et nos analyses de marché sont à disposition de nos partenaires pour leurs propres dossiers — études, comités de crédit, expertises.",
  },
];

const FAQS: Faq[] = [
  {
    question: "Comment démarre une collaboration ?",
    answer:
      "Un premier échange de 30 minutes (téléphone, WhatsApp ou dans vos locaux) pour comprendre votre besoin, puis une proposition écrite : périmètre, engagements, honoraires. Pas d'exclusivité imposée pour commencer — la relation se construit sur les résultats.",
  },
  {
    question: "Quels sont vos honoraires B2B ?",
    answer:
      "Ils dépendent du service : commission de commercialisation pour les programmes neufs, forfait par dossier pour le logement de collaborateurs, honoraires partagés pour l'apport d'affaires. Tout est annoncé par écrit avant tout engagement.",
  },
  {
    question: "Couvrez-vous d'autres villes que Rabat ?",
    answer:
      "Notre cœur de marché est Rabat-Salé-Témara, avec des données de prix couvrant aussi Casablanca, Marrakech, Tanger, Kénitra, Fès et Tétouan. Pour des besoins multi-villes, nous activons notre réseau de confrères sélectionnés.",
  },
  {
    question: "Travaillez-vous avec les gestionnaires de biens des MRE ?",
    answer:
      "Oui — mandats de vente ou de location à distance pour les Marocains résidant à l'étranger, avec visites vidéo, signatures coordonnées avec le notaire et reporting à distance. Voir aussi notre page dédiée aux expatriés.",
  },
];

export default function ProfessionalsPage() {
  return (
    <>
      <section className="hero-surface">
        <div className="wrap py-12 sm:py-16">
          <Breadcrumbs
            items={[
              { name: "Accueil", path: "/" },
              { name: "Professionnels", path: "/professionnels" },
            ]}
          />
          <div className="mt-6 max-w-3xl">
            <p className="kicker">
              <Briefcase className="h-4 w-4" aria-hidden />
              B2B & partenariats
            </p>
            <h1 className="h-display">
              L&apos;immobilier de vos projets professionnels,{" "}
              <span className="text-primary">exécuté sur données</span>
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink/70">
              Promoteurs, entreprises, banques, notaires, investisseurs :{" "}
              {site.brandName} met sa connaissance du terrain rabati, sa base
              d&apos;acheteurs qualifiés et ses données de prix au service de vos
              opérations.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="wrap py-14">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <Reveal key={service.title} delay={i * 60}>
              <div className="card h-full p-6">
                <service.icon className="h-7 w-7 text-accent" aria-hidden />
                <h2 className="font-display mt-3.5 text-[16.5px] font-bold text-ink">
                  {service.title}
                </h2>
                <p className="mt-2 text-[14px] leading-relaxed text-ink/70">
                  {service.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="wrap pb-14">
        <div className="card grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="kicker">Parlons de votre projet</p>
            <h2 className="h-section">Un interlocuteur décisionnaire, pas un standard</h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink/70">
              Décrivez votre besoin en deux lignes — programme à commercialiser,
              collaborateurs à loger, partenariat à construire. Réponse{" "}
              {site.agent.responseTime.toLowerCase()}, proposition écrite sous 48 h.
            </p>
            <WaButton
              href={waLink(
                `Bonjour ${site.brandName}, je vous contacte pour un projet professionnel / partenariat B2B.`
              )}
              placement="b2b"
              className="btn-whatsapp mt-6 !px-6"
            >
              <WhatsAppIcon className="h-5 w-5" />
              WhatsApp direct
            </WaButton>
          </div>
          <LeadForm
            source="contact"
            sourceRef="professionnels-b2b"
            withMessage
            cta="Être recontacté sous 48 h"
            successText="Votre demande est transmise — proposition écrite sous 48 h ouvrées."
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="wrap pb-16">
        <Reveal>
          <FaqBlock faqs={FAQS} title="Collaborer avec HomeFinder" />
        </Reveal>
        <p className="mt-8 text-[14px] text-ink/60">
          Voir aussi :{" "}
          <Link href="/expatries" className="font-semibold text-primary hover:underline">
            Services expatriés & MRE
          </Link>{" "}
          ·{" "}
          <Link href="/prix-immobilier" className="font-semibold text-primary hover:underline">
            Nos données de prix par quartier
          </Link>{" "}
          ·{" "}
          <Link href="/annonces" className="font-semibold text-primary hover:underline">
            Biens en commercialisation
          </Link>
        </p>
      </section>
    </>
  );
}
