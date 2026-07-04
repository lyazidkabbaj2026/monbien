import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  Home as HomeIcon,
  LineChart,
  MapPinned,
  Quote,
  Star,
  Wallet,
} from "lucide-react";
import { site } from "../../site.config";
import {
  getCities,
  getCityBySlug,
  getFeaturedListings,
  getNeighborhoods,
  getPublishedPosts,
} from "@/lib/data";
import { formatDate, readingTimeMinutes } from "@/lib/format";
import { ogCard, pageMetadata } from "@/lib/seo";
import { ListingCard } from "@/components/ListingCard";
import { Reveal } from "@/components/Reveal";
import { AgentCard } from "@/components/AgentCard";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: `${site.brandName} — ${site.tagline}`,
  description: `Estimation gratuite de votre bien à ${site.defaultCity}, annonces vérifiées, simulateur de crédit et carte des prix au m². ${site.agent.responseTime}.`,
  path: "/",
  image: ogCard(site.tagline, `Estimation gratuite, annonces vérifiées et prix au m² par quartier.`),
});

const TOOLS = [
  {
    href: "/estimer-mon-bien",
    icon: HomeIcon,
    title: "Estimer mon bien",
    text: "Une fourchette de prix fiable en 2 minutes, basée sur les prix réels de votre quartier.",
    cta: "Estimation gratuite",
  },
  {
    href: "/capacite-emprunt",
    icon: Wallet,
    title: "Capacité d'emprunt",
    text: "Combien les banques vous prêteront — et votre budget d'achat réel, frais déduits.",
    cta: "Calculer mon budget",
  },
  {
    href: "/simulateur-credit",
    icon: Calculator,
    title: "Simulateur de crédit",
    text: "Mensualité, coût total, tableau d'amortissement : calibrez votre financement.",
    cta: "Simuler mon crédit",
  },
  {
    href: "/prix-immobilier",
    icon: MapPinned,
    title: "Prix au m² par quartier",
    text: "Carte interactive des prix de vente et de location, mise à jour en continu.",
    cta: "Voir la carte des prix",
  },
];

export default async function HomePage() {
  const [featured, posts, cities, rabat] = await Promise.all([
    getFeaturedListings(3),
    getPublishedPosts(),
    getCities(),
    getCityBySlug(site.defaultCitySlug),
  ]);
  const latestPosts = posts.slice(0, 3);
  const rabatHoods = rabat ? await getNeighborhoods(rabat.id) : [];

  return (
    <>
      {/* ------------------------------------------------------------ Héro */}
      <section className="hero-surface">
        <div className="wrap grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <p className="kicker">
              <LineChart className="h-4 w-4" aria-hidden />
              Immobilier à {site.defaultCity}
            </p>
            <h1 className="h-display">
              Vendez votre bien au juste prix,{" "}
              <span className="text-primary">sans stress</span>.
            </h1>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-ink/70">
              Estimation gratuite en 2 minutes basée sur les prix réels de votre
              quartier, accompagnement complet —{" "}
              {site.agent.responseTime.toLowerCase()} sur WhatsApp.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/estimer-mon-bien" className="btn-accent text-[16px]">
                Estimer mon bien gratuitement
                <ArrowRight className="h-4.5 w-4.5" aria-hidden />
              </Link>
              <Link href="/annonces" className="btn-outline">
                Voir les annonces
              </Link>
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
                  {site.proof.yearsExperience} ans
                </strong>
                d&apos;expérience locale
              </li>
              <li>
                <strong className="font-display block text-xl text-ink">15 min</strong>
                temps de réponse moyen
              </li>
            </ul>
          </div>
          <div className="relative hidden aspect-[5/4] overflow-hidden rounded-3xl shadow-[0_24px_60px_-24px_rgba(15,76,92,0.5)] lg:block">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
              alt="Villa contemporaine à Rabat"
              fill
              priority
              sizes="(max-width: 1024px) 0px, 45vw"
              className="object-cover"
            />
            <div className="absolute right-4 bottom-4 left-4 rounded-2xl bg-white/90 p-4 backdrop-blur">
              <p className="text-[13px] font-semibold text-ink/60">
                Estimation moyenne à l&apos;Agdal
              </p>
              <p className="font-display text-xl font-bold text-primary">
                19 500 MAD/m²{" "}
                <span className="text-[13px] font-semibold text-accent">
                  · mis à jour ce mois-ci
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- Biens en vedette */}
      <section className="wrap py-16 sm:py-20">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="kicker">Sélection du moment</p>
              <h2 className="h-section">Nos biens en vedette</h2>
            </div>
            <Link
              href="/annonces"
              className="group inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-primary"
            >
              Toutes les annonces
              <ArrowRight
                className="h-4 w-4 transition group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((listing, i) => (
            <Reveal key={listing.id} delay={i * 80}>
              <ListingCard listing={listing} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------- Outils gratuits */}
      <section className="dark-surface text-white">
        <div className="wrap py-16 sm:py-20">
          <Reveal>
            <p className="kicker !text-accent">Outils gratuits</p>
            <h2 className="h-section max-w-xl !text-white">
              Quatre outils pour décider avec des données, pas au feeling
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map((tool, i) => (
              <Reveal key={tool.href} delay={i * 80}>
                <Link
                  href={tool.href}
                  className="group flex h-full flex-col rounded-2xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur transition hover:border-accent/60 hover:bg-white/[0.1]"
                >
                  <tool.icon className="h-8 w-8 text-accent" aria-hidden />
                  <h3 className="font-display mt-4 text-lg font-bold">{tool.title}</h3>
                  <p className="mt-2 flex-1 text-[14px] leading-relaxed text-white/70">
                    {tool.text}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-accent">
                    {tool.cta}
                    <ArrowRight
                      className="h-4 w-4 transition group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Confiance */}
      <section className="wrap py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <p className="kicker">Ils nous ont fait confiance</p>
            <h2 className="h-section">
              Un seul interlocuteur, de l&apos;estimation à la signature
            </h2>
            <p className="mt-4 max-w-md text-[15.5px] leading-relaxed text-ink/70">
              Pas de plateforme anonyme : vous échangez directement avec{" "}
              {site.agent.name}, qui connaît chaque quartier de {site.defaultCity} et
              négocie pour vous.
            </p>
            <div className="mt-6 max-w-sm">
              <AgentCard />
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {site.testimonials.map((t, i) => (
              <Reveal
                key={t.name}
                delay={i * 80}
                className={i === 2 ? "sm:col-span-2" : ""}
              >
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
        </div>
      </section>

      {/* --------------------------------------------------------------- Blog */}
      {latestPosts.length > 0 && (
        <section className="border-t border-line bg-white/50">
          <div className="wrap py-16 sm:py-20">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="kicker">Guides &amp; conseils</p>
                  <h2 className="h-section">Comprendre le marché avant d&apos;agir</h2>
                </div>
                <Link
                  href="/blog"
                  className="group inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-primary"
                >
                  Tout le blog
                  <ArrowRight
                    className="h-4 w-4 transition group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </div>
            </Reveal>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {latestPosts.map((post, i) => (
                <Reveal key={post.id} delay={i * 80}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="card group block h-full overflow-hidden"
                  >
                    {post.hero_image && (
                      <div className="relative aspect-[16/9] overflow-hidden bg-sand-deep">
                        <Image
                          src={post.hero_image}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.04]"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <p className="text-[12.5px] font-semibold tracking-wide text-accent uppercase">
                        {post.category ?? "Conseils"}
                      </p>
                      <h3 className="mt-2 line-clamp-2 text-[16px] leading-snug font-bold text-ink group-hover:text-primary">
                        {post.title}
                      </h3>
                      <p className="mt-3 text-[12.5px] text-ink/50">
                        {post.published_at ? formatDate(post.published_at) : ""} ·{" "}
                        {readingTimeMinutes(post.body_md)} min de lecture
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------- Maillage explorer */}
      <section className="wrap pt-4 pb-2" aria-label="Explorer le marché">
        <div className="grid gap-10 border-t border-line pt-12 md:grid-cols-2">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">
              L&apos;immobilier ville par ville
            </h2>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
              {cities.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/prix-immobilier/${city.slug}`}
                    className="text-[14px] text-ink/65 underline decoration-line underline-offset-4 transition hover:text-primary hover:decoration-accent"
                  >
                    Prix immobilier {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-ink">
              Les quartiers de {site.defaultCity}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
              {rabatHoods.map((hood) => (
                <li key={hood.slug}>
                  <Link
                    href={`/quartiers/${site.defaultCitySlug}/${hood.slug}`}
                    className="text-[14px] text-ink/65 underline decoration-line underline-offset-4 transition hover:text-primary hover:decoration-accent"
                  >
                    Immobilier {hood.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- CTA final */}
      <section className="wrap py-16 sm:py-20">
        <Reveal>
          <div className="dark-surface overflow-hidden rounded-3xl px-6 py-12 text-center text-white sm:px-12 sm:py-16">
            <h2 className="font-display mx-auto max-w-2xl text-2xl leading-tight font-bold tracking-tight sm:text-4xl">
              Combien vaut votre bien aujourd&apos;hui ?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15.5px] text-white/75">
              2 minutes, gratuit et sans engagement. Recevez une fourchette de prix
              basée sur les transactions réelles de votre quartier.
            </p>
            <Link href="/estimer-mon-bien" className="btn-accent mt-8 !px-8 text-[16px]">
              Lancer mon estimation
              <ArrowRight className="h-4.5 w-4.5" aria-hidden />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
