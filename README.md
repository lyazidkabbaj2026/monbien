# MonBien — Moteur de génération de leads immobiliers (Maroc)

Site immobilier français centré sur **Rabat**, construit pour générer des
leads vendeurs et acheteurs : estimation gratuite (gate de contact),
simulateur de crédit, carte des prix au m², moteur SEO programmatique et blog
automatisable.

**Stack** : Next.js (App Router, Turbopack) · TypeScript · Tailwind CSS v4 ·
Supabase (Postgres + Auth) · Resend · Vercel.

## Démarrage

```bash
cp .env.example .env.local   # remplir (voir ci-dessous)
npm install
npm run dev                  # http://localhost:3000
```

Build de production : `npm run build && npm run start`.

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon (lecture publique + RPC) |
| `BLOG_INGEST_TOKEN` | Jeton bearer de `POST /api/blog/ingest` — doit aussi exister dans la table `app_secrets` (clé `blog_ingest_token`) |
| `RESEND_API_KEY` | Optionnel — notification email à chaque lead (sinon ignoré silencieusement) |
| `LEAD_NOTIFICATION_FROM` | Expéditeur des emails (domaine vérifié Resend) |
| `NEXT_PUBLIC_SITE_URL` | URL canonique publique (sitemap, OG, JSON-LD) |
| `NEXT_PUBLIC_GA_ID` | Optionnel — GA4 |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Optionnel — Search Console |

> Aucune clé `service_role` n'est nécessaire : toutes les écritures publiques
> passent par des fonctions Postgres `SECURITY DEFINER` (`submit_lead`,
> `submit_valuation`, `ingest_blog_post`) et la RLS bloque tout le reste.

## Tout se règle dans `site.config.ts`

Marque, numéro WhatsApp, email de réception des leads, ville par défaut,
palette de couleurs, identité de l'agent (nom, promesse de délai de réponse),
preuves sociales et témoignages, types de biens du moteur SEO. Changer
`brandName` rebrande le site entier.

## Base de données

Migrations dans `supabase/migrations/` (appliquées au projet Supabase) :

1. `0001_schema.sql` — tables `cities`, `neighborhoods`, `price_data`,
   `listings`, `leads`, `valuations`, `blog_posts`, `app_secrets` + RLS.
2. `0002_functions.sql` — RPC d'écriture `SECURITY DEFINER`.
3. `0003_seed.sql` — 8 villes, 16 quartiers (Rabat complet), prix indicatifs,
   6 annonces d'exemple, 2 articles.

Modèle de sécurité : lecture publique du contenu (villes, quartiers, prix,
annonces actives, articles publiés) ; `leads`/`valuations` lisibles uniquement
par l'utilisateur authentifié (dashboard) ; `app_secrets` inaccessible via
l'API. Les avertissements du linter Supabase sur les fonctions
`SECURITY DEFINER` publiques sont **intentionnels** (capture de leads
publique ; l'ingestion blog vérifie son propre jeton).

## Pages & routes

| Route | Rôle |
|---|---|
| `/` | Home : héro estimation, biens en vedette, outils, confiance, blog |
| `/annonces` (+`/annonces/[slug]`) | Annonces filtrables (form GET sans JS) + fiches avec JSON-LD `RealEstateListing`, carte lazy, LeadForm |
| `/estimer-mon-bien` | Cheval de Troie n°1 — estimation multi-étapes, résultat **après** coordonnées (leads `valuation`) |
| `/simulateur-credit` | Cheval de Troie n°2 — mensualité/amortissement 100 % client + CTA lead douce (`simulator`) |
| `/prix-immobilier` (+`/[ville]`) | Cheval de Troie n°3 — carte Leaflet lazy des prix par quartier + rapport gratuit (`price_map`) |
| `/immobilier/[ville]/[type]-a-[vendre\|louer]` | **SEO programmatique** : 96+ pages ville × type × transaction, FAQ JSON-LD, maillage interne |
| `/quartiers/[ville]/[quartier]` | Pages quartier (prix, annonces, FAQ) |
| `/blog` (+`/blog/[slug]`) | Blog DB-driven, `Article` JSON-LD, temps de lecture |
| `/admin` | Dashboard leads (Supabase Auth) : filtres source/statut, MAJ statut, estimations, liens WhatsApp/appel |
| `POST /api/leads` | Insertion lead + email Resend + lien WhatsApp de confirmation |
| `POST /api/valuation` | Calcul d'estimation serveur + lead + valuation |
| `POST /api/blog/ingest` | Publication automatisée (voir `AUTOMATION.md`) |
| `/sitemap.xml`, `/robots.txt` | Générés dynamiquement depuis la base |

## Performance & SEO

- Statique/ISR partout (annonces 30 min, pages programmatiques 6 h) ; les
  seules routes dynamiques sont les filtres, le blog (query) et l'admin.
- JS client minimal : les cartes Leaflet et le simulateur sont code-splittés
  et montés **à l'approche du viewport** (`LazyVisible`).
- `next/image` (AVIF/WebP, `sizes`, priorité réservée au héro), polices
  self-hostées via `next/font` (`display: swap`), animations CSS inertes sans
  JS (`@media (scripting: enabled)`).
- Metadata + canonical par page, JSON-LD `RealEstateAgent`, `RealEstateListing`,
  `Article`, `FAQPage`, `BreadcrumbList`, slugs français propres.

## Conversion

`<LeadForm/>` réutilisable (validation française, honeypot anti-spam, état de
succès → bouton WhatsApp prérempli), bouton WhatsApp flottant avec message
contextuel par page, signaux de confiance (`AgentCard`, témoignages,
compteurs) près de chaque formulaire, une CTA principale par page. Chaque lead
porte `source`/`source_ref` → conversion mesurable par canal dans `/admin`.

## Déploiement (Vercel)

1. Importer le repo dans Vercel (framework Next.js, zéro config).
2. Renseigner les variables d'environnement ci-dessus.
3. Déployer. Le sitemap et les pages programmatiques se régénèrent par ISR —
   ajouter des villes/quartiers/prix en base suffit (voir `AUTOMATION.md`).

## Automatisation du blog

Voir **`AUTOMATION.md`** : payload, auth, revalidation instantanée, recette
pour une tâche Claude quotidienne et SQL d'extension du SEO programmatique.
