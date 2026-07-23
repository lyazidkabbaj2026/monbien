# AUTOMATION.md — Automatisations du site

Deux routines Claude Code tournent quotidiennement (gérables en discutant
avec Claude, ou depuis la liste des routines) :

1. **Blog quotidien** (07:30 Rabat) — rédige et publie un article via
   `POST /api/blog/ingest` (détails ci-dessous).
2. **Copilote commercial** (08:00 Rabat) — lit un instantané agrégé du
   pipeline via la RPC `get_lead_briefing` (jeton `automation_token` dans
   `app_secrets`, fonction SECURITY DEFINER : la clé anon seule ne peut pas
   lire les leads) et envoie une notification : leads en attente +24 h avec
   liens WhatsApp, nouveaux leads, rapprochements acheteurs ↔ nouvelles
   annonces, bilan hebdomadaire le lundi. Silencieuse (« RAS ») quand le
   pipeline est à jour.

Pour changer un jeton d'automatisation :
`update app_secrets set value = 'NOUVEAU' where key = 'automation_token';`
(ou `blog_ingest_token`) puis mettre à jour la routine/variable concernée.

# Publier des articles automatiquement

Le blog est **piloté par la base de données** : insérer une ligne publiée dans
`blog_posts` suffit pour qu'un article soit en ligne, **sans redéploiement**.
L'API ci-dessous fait tout (insertion + revalidation ISR) en un seul appel.

## L'endpoint

```
POST {SITE_URL}/api/blog/ingest
Authorization: Bearer {BLOG_INGEST_TOKEN}
Content-Type: application/json
```

- `BLOG_INGEST_TOKEN` est défini dans les variables d'environnement Vercel
  (et `.env.local` en local). La **même valeur** doit exister dans la table
  Supabase `app_secrets` (clé `blog_ingest_token`) — c'est déjà le cas.
- Pour changer le jeton : mettez à jour la variable d'env **et**
  `update app_secrets set value = 'NOUVEAU' where key = 'blog_ingest_token';`

## Corps de la requête

```json
{
  "title": "Louer meublé ou vide à Rabat : que choisir en 2026 ?",
  "body_md": "Le marché locatif de Rabat…\n\n## Meublé : plus de rendement\n\n…",
  "meta_description": "Rendement, fiscalité, vacance locative : le comparatif complet meublé vs vide à Rabat.",
  "category": "Investissement",
  "tags": ["location", "rabat", "investissement"],
  "hero_image": "https://images.unsplash.com/photo-XXXX?auto=format&fit=crop&w=1600&q=80",
  "author": "HomeFinder",
  "slug": "louer-meuble-ou-vide-rabat"
}
```

| Champ | Requis | Notes |
|---|---|---|
| `title` | ✅ | Titre H1 de l'article |
| `body_md` | ✅ | Markdown (##, listes, liens, gras…) |
| `meta_description` | recommandé | 150–160 caractères, utilisée en `<meta>` |
| `category` | recommandé | Ex. `Marché`, `Conseils`, `Investissement` (alimente les filtres) |
| `tags` | non | Tableau de chaînes |
| `hero_image` | recommandé | URL https (Unsplash ou Supabase Storage) |
| `author` | non | Défaut : nom du site |
| `slug` | non | Généré depuis `title` si absent (slug français propre) |

Comportement : **upsert par slug** — renvoyer le même `slug` met l'article à
jour. L'article est publié immédiatement (`status = published`,
`published_at = now()`).

## Réponse

```json
{
  "ok": true,
  "id": "uuid…",
  "slug": "louer-meuble-ou-vide-rabat",
  "url": "/blog/louer-meuble-ou-vide-rabat",
  "revalidated": ["/blog", "/blog/louer-meuble-ou-vide-rabat", "/", "/sitemap.xml"]
}
```

La route revalide `/blog`, la page de l'article, la home (bloc « derniers
articles ») et le sitemap : l'article est visible et indexable en quelques
secondes.

Erreurs : `401` jeton manquant/incorrect · `400` title/body_md manquant ·
`500` insertion échouée.

## Exemple cURL

```bash
curl -X POST "$SITE_URL/api/blog/ingest" \
  -H "Authorization: Bearer $BLOG_INGEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Prix immobilier Agdal : tendance du mois",
    "body_md": "## Le marché ce mois-ci\n\nLes prix à Agdal…",
    "meta_description": "Analyse mensuelle des prix à Agdal, Rabat.",
    "category": "Marché",
    "hero_image": "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1600&q=80"
  }'
```

## Recette pour une tâche Claude quotidienne

Prompt type à donner à la tâche planifiée :

> Rédige un article de blog en français (600–900 mots, Markdown) pour un site
> immobilier centré sur Rabat. Sujet du jour : {sujet}. Ton : expert local,
> concret, orienté données. Termine par un appel à l'action vers
> `/estimer-mon-bien` ou `/simulateur-credit`. Puis publie-le via
> `POST $SITE_URL/api/blog/ingest` avec le header
> `Authorization: Bearer $BLOG_INGEST_TOKEN` et le JSON
> `{title, body_md, meta_description, category, hero_image}`.

Idées de rotation de sujets : prix par quartier (8 quartiers de Rabat),
guides acheteur/vendeur, financement, fiscalité immobilière, comparatifs de
quartiers, actualité du marché.

## Étendre le SEO programmatique (villes & quartiers)

Les pages `/immobilier/[ville]/[combo]`, `/quartiers/[ville]/[quartier]` et
`/prix-immobilier/[ville]` sont générées depuis la base. Pour ouvrir une
nouvelle ville ou un nouveau quartier, il suffit d'insérer les données —
aucune modification de code :

```sql
-- Nouvelle ville
insert into cities (name, slug, region, lat, lng) values
  ('Agadir', 'agadir', 'Souss-Massa', 30.4278, -9.5981);

-- Ses quartiers
insert into neighborhoods (city_id, name, slug, lat, lng)
select id, 'Founty', 'founty', 30.4020, -9.5850 from cities where slug = 'agadir';

-- Ses prix (fait apparaître la ville sur la carte des prix + FAQ chiffrées)
insert into price_data (neighborhood_id, property_type, transaction, avg_price_per_m2, sample_size)
select n.id, 'appartement', 'vente', 14500, 40
from neighborhoods n join cities c on c.id = n.city_id
where c.slug = 'agadir' and n.slug = 'founty';
```

Les nouvelles pages apparaissent au prochain cycle ISR (≤ 6 h) et dans le
sitemap automatiquement. Les types de biens et transactions se règlent dans
`site.config.ts` (`propertyTypes`, `transactions`).
