# ADR-001 : Architecture MVP pour bêta utilisateurs — STM Spot

**Statut :** Accepté
**Date :** 2026-05-26
**Décideurs :** propriétaire du projet

## Contexte

Prototype React/TS/Tailwind/shadcn fonctionnel : carte cliquable du métro (68 stations), 3 types de posts (Info / Inspecteur / Incident), votes + crédibilité, anonymat — mais 100 % mock data, aucun backend.

**Objectif** : atteindre une bêta publique, partageable par URL à de vrais testeurs montréalais, en 2-3 semaines, sans introduire de dette qui forcera une réécriture si la validation UX réussit.

**Contraintes** :
- Budget bêta ~0 $ (tier gratuit)
- 1 développeur + Claude Code
- Cadre légal sensible : positionnement « média social communautaire » obligatoire (voir CLAUDE.md)
- UI déjà en français, audience Montréal

## Décision

Stack : **Vite + React + TS (déjà) → Supabase (BaaS) → Vercel → PWA d'abord, Expo après validation UX.**

## Options considérées — Backend

### A. Supabase *(retenu)*

| Dimension | Évaluation |
|-----------|------------|
| Complexité | Basse — auth + DB Postgres + Realtime + Storage groupés |
| Coût | 0 $ jusqu'à ~50k MAU / 500 MB DB / 5 GB transfert |
| Évolutivité bêta | Largement suffisante (< 1000 utilisateurs visés) |
| Familiarité | SDK JS officiel, doc abondante, dashboard SQL pour debug |
| Verrouillage | Postgres = portable. Auth/Realtime = couplage modéré |

**Pros** : Realtime sur tables (WebSocket), auth anonyme native, RLS pour sécurité ligne-à-ligne, edge functions, SQL standard.
**Cons** : cold start sur tier gratuit (DB en pause après 7 jours d'inactivité), latence Realtime ~1-2 s.

### B. Firebase
**Pros** : Realtime mature, push notifs intégrées (utile Phase 4).
**Cons** : Firestore mal adapté à nos requêtes (filtrage par crédibilité, expiration), coût qui explose au scaling.

### C. Backend custom (Node + Postgres + Socket.IO)
**Pros** : contrôle total, aucun verrouillage.
**Cons** : 2-3 semaines de boilerplate — repousse la bêta.

### D. Pocketbase / Appwrite self-hosted
**Pros** : Open source, peu cher à scaler.
**Cons** : ops à gérer, pas de tier hébergé géré comparable.

## Options considérées — Livraison

### A. PWA d'abord, Expo après *(retenu)*
URL bêta partageable → testeurs ouvrent dans Safari/Chrome au métro. Phase 4 = wrapper Expo.
**Pros** : zéro friction stores, déploiement instantané.
**Cons** : push notifs iOS limitées, pas dans App Store.

### B. Expo dès le début
**Pros** : une codebase iOS/Android/web.
**Cons** : composants shadcn ne portent pas tels quels, cycles App Store = friction.

### C. Capacitor (wrap PWA en app native)
**Pros** : garde la codebase web, accès stores plus tard.
**Cons** : rien que la PWA n'offre déjà pour la bêta.

## Trade-offs clés

1. **Vitesse vs flexibilité backend** — Supabase gagne 2-3 semaines. Mitigation : encapsuler tous les appels Supabase dans `src/lib/api.ts`.
2. **PWA vs natif** — Une URL partageable bat l'App Store pour valider une interface.
3. **Anonyme vs identifié** — Supabase auth anonyme donne un `user_id` stable, suffisant pour 1 vote/post et rate limiting.
4. **Modération réactive vs proactive** — Bêta : signalement + filtre mots-clés + expiration auto à 2h pour les posts Inspecteur.

## Modèle de données (Postgres / Supabase)

Schéma détaillé dans [`supabase-schema.sql`](./supabase-schema.sql).

Tables : `stations`, `posts`, `votes`, `reports`.
Vue dérivée : `post_credibility(post_id, score)`.

## Conséquences

- **Plus facile** : itération sur retours UX en < 1 semaine, coût bêta nul, mêmes composants UI gardés.
- **Plus dur** : si validation OK, port vers Expo demandera de réécrire les composants shadcn (~1 semaine).
- **À revoir** après 1000 utilisateurs : tenir du tier gratuit Supabase, décision PWA → Expo.

## Roadmap vers bêta (2-3 semaines)

### Semaine 1 — Brancher le backend
- [ ] Projet Supabase créé, schéma SQL exécuté
- [ ] Seed des 68 stations
- [ ] Auth anonyme + RLS
- [ ] `src/lib/supabase.ts` + `src/lib/api.ts`
- [ ] Remplacer `src/data/posts.ts` par appels API réels

### Semaine 2 — Realtime + modération minimale
- [ ] Realtime subscription sur posts par station
- [ ] Edge function de purge des posts expirés (cron quotidien)
- [ ] Bouton « Signaler » → `reports`
- [ ] Rate limiting (max 5 posts/h par user_id)
- [ ] Filtre mots-clés (client + serveur)
- [ ] PWA manifest + service worker (vite-plugin-pwa)

### Semaine 3 — Déploiement + test réel
- [ ] Build → Vercel + env vars
- [ ] Domaine custom (~15 $/an)
- [ ] Tests mobile en LTE dans le métro
- [ ] Recruter 10-20 testeurs (groupe Facebook BLO Spotted STM)
- [ ] Feedback in-app (Tally / Google Forms)

## Actions immédiates

1. [ ] Créer le projet Supabase et récupérer les clés
2. [ ] Exécuter `docs/supabase-schema.sql` dans l'éditeur SQL Supabase
3. [ ] Choisir un nom de domaine pour la bêta
4. [ ] Brouillon CGU + politique de confidentialité minimale
