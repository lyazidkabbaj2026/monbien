import { BellRing, EyeOff, Rocket, Users } from "lucide-react";
import { site } from "../../../site.config";
import { getCities, getNeighborhoods } from "@/lib/data";
import type { Neighborhood } from "@/lib/types";
import { ogCard, pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BuyerSearchForm } from "@/components/BuyerSearchForm";
import { FaqBlock, type Faq } from "@/components/FaqBlock";
import { Reveal } from "@/components/Reveal";

export const revalidate = 21600;

export const metadata = pageMetadata({
  title: `Biens en avant-première à ${site.defaultCity} — soyez prévenu avant tout le monde`,
  description: `Les meilleurs biens partent avant d'être publiés. Déposez vos critères et recevez en priorité les appartements, villas et maisons qui correspondent, à ${site.defaultCity} et partout au Maroc.`,
  path: "/avant-premiere",
  image: ogCard(
    "Biens en avant-première",
    "Déposez vos critères, soyez prévenu avant la publication des annonces.",
    "Acheteurs"
  ),
});

const BENEFITS = [
  {
    icon: EyeOff,
    title: "L'accès au marché caché",
    text: "Une partie des biens se vend sans jamais être publiée : vendeurs discrets, successions, arbitrages rapides. Nos alertes vous ouvrent ce marché.",
  },
  {
    icon: BellRing,
    title: "Prévenu avant la publication",
    text: "Dès qu'un mandat correspond à vos critères, vous recevez photos et prix sur WhatsApp — avant la mise en ligne de l'annonce.",
  },
  {
    icon: Rocket,
    title: "Visites prioritaires",
    text: "Vous visitez avant les autres. Sur les biens bien placés en prix, ces 48 heures d'avance font toute la différence.",
  },
  {
    icon: Users,
    title: "Un conseiller qui cherche pour vous",
    text: `${site.agent.name} connaît votre recherche et active son réseau : notaires, syndics, confrères. Vous ne cherchez plus seul.`,
  },
];

const FAQS: Faq[] = [
  {
    question: "Est-ce vraiment gratuit ?",
    answer:
      "Oui, totalement. Notre rémunération vient de la transaction lorsque vous achetez un bien que nous vous avons trouvé — jamais de frais d'inscription ni d'abonnement.",
  },
  {
    question: "Combien d'alertes vais-je recevoir ?",
    answer:
      "Uniquement des biens qui correspondent réellement à vos critères — quelques-uns par mois selon la rareté de votre recherche, pas un flux publicitaire. Qualité avant quantité.",
  },
  {
    question: "Puis-je modifier ou arrêter mon alerte ?",
    answer:
      "À tout moment, en un message WhatsApp. Vos critères évoluent, votre alerte aussi.",
  },
  {
    question: "Pourquoi les meilleurs biens partent-ils avant publication ?",
    answer:
      "Parce qu'un bien bien estimé trouve souvent preneur dans la base d'acheteurs qualifiés de l'agence avant même la mise en ligne : le vendeur gagne du temps, l'acheteur gagne la priorité. C'est exactement la place que cette alerte vous donne.",
  },
];

export default async function OffMarketPage() {
  const cities = await getCities();
  const hoodEntries = await Promise.all(
    cities.map(async (city) => [city.id, await getNeighborhoods(city.id)] as const)
  );
  const neighborhoods: Record<string, Neighborhood[]> = Object.fromEntries(hoodEntries);

  return (
    <>
      <section className="hero-surface">
        <div className="wrap py-10 sm:py-14">
          <Breadcrumbs
            items={[
              { name: "Accueil", path: "/" },
              { name: "Avant-première", path: "/avant-premiere" },
            ]}
          />
          <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div className="lg:sticky lg:top-24">
              <p className="kicker">
                <BellRing className="h-4 w-4" aria-hidden />
                Acheteurs
              </p>
              <h1 className="h-display">
                Les meilleurs biens partent{" "}
                <span className="text-primary">avant d&apos;être publiés</span>
              </h1>
              <p className="mt-4 max-w-md text-[16px] leading-relaxed text-ink/70">
                Déposez vos critères une fois : nous vous prévenons en priorité —
                photos et prix sur WhatsApp — dès qu&apos;un bien correspond, même
                avant sa mise en ligne.
              </p>
              <ul className="mt-8 space-y-5">
                {BENEFITS.map((benefit) => (
                  <li key={benefit.title} className="flex gap-3.5">
                    <benefit.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
                    <div>
                      <p className="text-[15px] font-bold text-ink">{benefit.title}</p>
                      <p className="mt-0.5 text-[13.5px] leading-relaxed text-ink/60">
                        {benefit.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold text-ink">
                Décrivez votre recherche
              </h2>
              <p className="mt-1 mb-6 text-[13.5px] text-ink/60">
                2 minutes — plus vos critères sont précis, meilleures sont les
                alertes.
              </p>
              <BuyerSearchForm cities={cities} neighborhoods={neighborhoods} />
            </div>
          </div>
        </div>
      </section>

      <section className="wrap py-16">
        <Reveal>
          <FaqBlock faqs={FAQS} title="L'avant-première en questions" />
        </Reveal>
      </section>
    </>
  );
}
