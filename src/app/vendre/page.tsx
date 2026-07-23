import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  FileSignature,
  Handshake,
  LineChart,
  Quote,
  ShieldCheck,
  Star,
  Timer,
} from "lucide-react";
import { site } from "../../../site.config";
import { getPublishedPosts } from "@/lib/data";
import { ogCard, pageMetadata } from "@/lib/seo";
import { waLink, waMessages } from "@/lib/whatsapp";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqBlock, type Faq } from "@/components/FaqBlock";
import { AgentCard } from "@/components/AgentCard";
import { Reveal } from "@/components/Reveal";
import { WaButton } from "@/components/WaButton";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export const revalidate = 21600;

export const metadata = pageMetadata({
  title: `Vendre son bien immobilier à ${site.defaultCity} — vite et au meilleur prix`,
  description: `Vendez votre appartement, villa ou maison à ${site.defaultCity} avec un expert local : estimation gratuite, plan de vente clair, acheteurs qualifiés et accompagnement jusqu'au notaire.`,
  path: "/vendre",
  image: ogCard(
    `Vendre votre bien à ${site.defaultCity}`,
    "Estimation gratuite, acheteurs qualifiés, accompagnement jusqu'à la signature.",
    "Vendeurs"
  ),
});

const PILLARS = [
  {
    icon: LineChart,
    title: "Un prix juste, prouvé par les données",
    text: `Pas d'estimation « au doigt mouillé » : nous croisons les prix réels de votre quartier avec l'état et les atouts de votre bien. Un prix juste dès le départ, c'est une vente plus rapide et sans négociation subie.`,
  },
  {
    icon: Camera,
    title: "Une mise en valeur professionnelle",
    text: "Photos soignées, annonce rédigée pour convaincre, diffusion ciblée. Votre bien est présenté comme il le mérite — la première impression fait le prix final.",
  },
  {
    icon: ShieldCheck,
    title: "Des acheteurs filtrés, pas des curieux",
    text: "Nous qualifions chaque contact (financement, projet, délai) avant toute visite. Vous n'ouvrez votre porte qu'à de vrais acheteurs.",
  },
  {
    icon: Handshake,
    title: "Négociation et notaire, sans stress",
    text: "Nous menons la négociation sur données, sécurisons le compromis et vous accompagnons jusqu'à la signature chez le notaire. Un seul interlocuteur du début à la fin.",
  },
];

const STEPS = [
  {
    icon: LineChart,
    title: "Estimation gratuite",
    duration: "Jour 1",
    text: "En ligne en 2 minutes, puis affinée sur place gratuitement : exposition, étage, prestations, travaux.",
  },
  {
    icon: FileSignature,
    title: "Plan de vente & mandat",
    duration: "Jours 2–7",
    text: "Prix de mise en vente argumenté, stratégie de diffusion, honoraires clairs annoncés d'avance. Vous validez tout.",
  },
  {
    icon: Camera,
    title: "Commercialisation & visites",
    duration: "Semaines 1–6",
    text: "Photos pro, annonce en ligne, diffusion auprès de notre base d'acheteurs en recherche active, visites organisées et comptes-rendus systématiques.",
  },
  {
    icon: Handshake,
    title: "Offre, compromis, signature",
    duration: "Dernière ligne droite",
    text: "Négociation, vérification du financement de l'acheteur, compromis chez le notaire, acompte séquestré — jusqu'à la remise des clés.",
  },
];

const FAQS: Faq[] = [
  {
    question: `Combien coûte la vente avec ${site.brandName} ?`,
    answer:
      "Nos honoraires sont annoncés clairement avant la signature du mandat — aucun frais caché, rien à payer tant que la vente n'est pas conclue. L'estimation et le plan de vente sont gratuits et sans engagement.",
  },
  {
    question: "Combien de temps faut-il pour vendre à Rabat ?",
    answer:
      "Un bien correctement estimé et bien présenté se vend généralement en 4 à 10 semaines à Rabat selon le quartier et le type de bien. Un prix de départ trop ambitieux est la première cause des ventes qui traînent — c'est précisément ce que notre estimation par données évite.",
  },
  {
    question: "Quels documents faut-il préparer pour vendre ?",
    answer:
      "L'essentiel : titre foncier (ou réquisition), plans si disponibles, dernières quittances de taxe de services communaux, règlement de copropriété et procès-verbaux récents pour un appartement. Nous vous fournissons la liste complète et vous aidons à tout rassembler.",
  },
  {
    question: "Puis-je vendre un bien encore sous crédit ?",
    answer:
      "Oui, c'est très courant : le notaire règle la banque avec le prix de vente (mainlevée de l'hypothèque) et vous percevez le solde. Nous coordonnons la banque, le notaire et l'acheteur pour que tout se fasse en une seule signature.",
  },
  {
    question: "Faut-il faire des travaux avant de vendre ?",
    answer:
      "Rarement de gros travaux — souvent contre-productifs. En revanche, quelques centaines de dirhams de rafraîchissement (peinture, joints, luminosité) peuvent changer la perception et le prix final. Nous vous disons honnêtement ce qui vaut le coup lors de la visite d'estimation.",
  },
  {
    question: "Pourquoi ne pas vendre seul, entre particuliers ?",
    answer:
      "C'est possible, mais les écarts se paient cher : prix mal calibré, acheteurs non solvables, négociation subie, compromis mal ficelé. Notre rôle est de vous faire gagner au net plus que nos honoraires — sinon nous n'avons aucune raison d'exister, et nous vous le dirons.",
  },
];

export default async function SellPage() {
  const posts = await getPublishedPosts();
  const sellerPosts = posts
    .filter((p) =>
      `${p.title} ${p.category}`.toLowerCase().match(/vend|estim|prix/)
    )
    .slice(0, 3);

  return (
    <>
      {/* Héro vendeur */}
      <section className="hero-surface">
        <div className="wrap py-12 sm:py-16">
          <Breadcrumbs
            items={[
              { name: "Accueil", path: "/" },
              { name: "Vendre", path: "/vendre" },
            ]}
          />
          <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="kicker">
                <Timer className="h-4 w-4" aria-hidden />
                Vendeurs
              </p>
              <h1 className="h-display">
                Vendre votre bien à {site.defaultCity},{" "}
                <span className="text-primary">vite et au meilleur prix</span>
              </h1>
              <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-ink/70">
                Le bon prix dès le premier jour, des acheteurs qualifiés et un seul
                interlocuteur jusqu&apos;au notaire. Commencez par savoir ce que
                vaut réellement votre bien — c&apos;est gratuit.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/estimer-mon-bien" className="btn-accent text-[16px]">
                  Estimer mon bien gratuitement
                  <ArrowRight className="h-4.5 w-4.5" aria-hidden />
                </Link>
                <WaButton
                  href={waLink(waMessages.valuation)}
                  placement="vendre_hero"
                  className="btn-outline"
                >
                  <WhatsAppIcon className="h-5 w-5 text-whatsapp" />
                  Parler à {site.agent.name.split(" ")[0]}
                </WaButton>
              </div>
              <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[13.5px] text-ink/60">
                <li>
                  <strong className="font-display block text-xl text-ink">
                    {site.proof.propertiesSold}+
                  </strong>
                  biens vendus à {site.proof.cityFocus}
                </li>
                <li>
                  <strong className="font-display block text-xl text-ink">
                    4–10 sem.
                  </strong>
                  délai de vente typique
                </li>
                <li>
                  <strong className="font-display block text-xl text-ink">0 MAD</strong>
                  tant que ce n&apos;est pas vendu
                </li>
              </ul>
            </div>
            <Reveal className="hidden lg:block">
              <div className="card space-y-4 p-7">
                <p className="flex items-center gap-2 text-[13px] font-bold tracking-wide text-accent uppercase">
                  <BadgeCheck className="h-4.5 w-4.5" aria-hidden />
                  Engagement de transparence
                </p>
                <ul className="space-y-3 text-[14.5px] leading-relaxed text-ink/75">
                  <li>— Estimation argumentée par les prix réels du quartier</li>
                  <li>— Honoraires annoncés par écrit avant tout mandat</li>
                  <li>— Compte-rendu après chaque visite</li>
                  <li>— Acompte toujours séquestré chez le notaire</li>
                  <li>— Vous restez libre : mandat sans surprise</li>
                </ul>
                <AgentCard compact />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Piliers */}
      <section className="wrap py-16">
        <Reveal>
          <p className="kicker">Notre méthode</p>
          <h2 className="h-section max-w-xl">
            Ce qui fait la différence entre « en vente » et « vendu »
          </h2>
        </Reveal>
        <div className="mt-9 grid gap-5 sm:grid-cols-2">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 70}>
              <div className="card h-full p-6">
                <pillar.icon className="h-7 w-7 text-accent" aria-hidden />
                <h3 className="font-display mt-3.5 text-[17px] font-bold text-ink">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink/70">
                  {pillar.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Processus */}
      <section className="dark-surface text-white">
        <div className="wrap py-16">
          <Reveal>
            <p className="kicker !text-accent">Le déroulé, sans surprise</p>
            <h2 className="h-section !text-white">Votre vente en 4 étapes</h2>
          </Reveal>
          <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 70}>
                <li className="flex h-full flex-col rounded-2xl border border-white/12 bg-white/[0.06] p-6">
                  <div className="flex items-center justify-between">
                    <step.icon className="h-7 w-7 text-accent" aria-hidden />
                    <span className="font-display text-3xl font-bold text-white/20">
                      {i + 1}
                    </span>
                  </div>
                  <p className="mt-4 text-[12px] font-bold tracking-wide text-accent uppercase">
                    {step.duration}
                  </p>
                  <h3 className="font-display mt-1 text-[16.5px] font-bold">
                    {step.title}
                  </h3>
                  <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-white/70">
                    {step.text}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
          <Reveal delay={200}>
            <div className="mt-10 text-center">
              <Link href="/estimer-mon-bien" className="btn-accent !px-8 text-[15.5px]">
                Commencer par l&apos;estimation gratuite
                <ArrowRight className="h-4.5 w-4.5" aria-hidden />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Témoignages vendeurs */}
      <section className="wrap py-16">
        <Reveal>
          <p className="kicker">Ils ont vendu avec nous</p>
          <h2 className="h-section">Des vendeurs, pas des promesses</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {site.testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 70}>
              <figure className="card h-full p-5">
                <Quote className="h-5 w-5 text-accent/70" aria-hidden />
                <blockquote className="mt-3 text-[14.5px] leading-relaxed text-ink/75">
                  « {t.text} »
                </blockquote>
                <figcaption className="mt-4 flex items-center justify-between">
                  <span className="text-[13.5px] font-bold text-ink">
                    {t.name}
                    <span className="block text-[12.5px] font-medium text-ink/50">
                      {t.city}
                    </span>
                  </span>
                  <span className="flex text-accent" aria-label="5 étoiles">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-current" aria-hidden />
                    ))}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ vendeur */}
      <section className="wrap pb-16">
        <Reveal>
          <FaqBlock faqs={FAQS} title="Vendre à Rabat : vos questions" />
        </Reveal>
      </section>

      {/* Guides vendeur */}
      {sellerPosts.length > 0 && (
        <section className="wrap pb-16">
          <h2 className="font-display mb-4 text-lg font-bold text-ink">
            Pour aller plus loin
          </h2>
          <ul className="space-y-3">
            {sellerPosts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex items-baseline justify-between gap-4 border-b border-line pb-3"
                >
                  <span className="text-[15px] font-semibold text-ink group-hover:text-primary">
                    {post.title}
                  </span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-ink/30 transition group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
