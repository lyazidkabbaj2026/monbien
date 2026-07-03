<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# MonBien — notes pour agents

Site de génération de leads immobiliers (français, Maroc/Rabat). Next.js App
Router + TypeScript + Tailwind v4 + Supabase. Voir `README.md` (architecture)
et `AUTOMATION.md` (blog + extension SEO).

## Règles du projet

- **Tout le contenu visible est en français** (fr-MA). Pas d'i18n.
- Les réglages propriétaire (marque, WhatsApp, couleurs, témoignages, types de
  biens) vivent dans `site.config.ts` — ne pas les dupliquer en dur.
- Écritures publiques en base **uniquement** via les RPC `SECURITY DEFINER`
  (`submit_lead`, `submit_valuation`, `ingest_blog_post`). Pas de clé
  service_role dans ce projet.
- Toute nouvelle page publique doit avoir : `pageMetadata()` (canonical/OG),
  JSON-LD adapté, une CTA principale unique, et rester statique/ISR.
- JS client minimal : les composants lourds (cartes Leaflet) se montent via
  `LazyVisible` + `next/dynamic`. Ne jamais bloquer le LCP.
- Tailwind v4 : les classes composant (`btn-accent`, `card`, `field`, `wrap`…)
  sont définies dans `src/app/globals.css` (`@layer components`). On ne peut
  pas `@apply` une classe custom dans une autre.
- Migrations SQL : fichiers numérotés dans `supabase/migrations/`, appliqués
  au projet Supabase `monbien` (kgcfapbzujdfbbgenzjy).

## Vérifications avant commit

```bash
npx tsc --noEmit && npm run build
```
