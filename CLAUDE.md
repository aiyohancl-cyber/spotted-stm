# Projet STM Spot — Contexte pour Claude

## Vue d'ensemble

App de média social inspirée du groupe Facebook "BLO Spotted STM". Plateforme communautaire où les utilisateurs du métro de Montréal partagent des observations en temps réel: présence d'inspecteurs, incidents, infos générales.

**Important légal**: l'app est positionnée comme un média social communautaire, pas comme une app de signalement de contrôle de billets. Cette distinction est essentielle pour passer les conditions des stores Apple/Google et minimiser les risques légaux. Maintenir ce framing partout dans le code et l'UI.

## Stack technique

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: lucide-react
- **Backend prévu**: Supabase (pas encore branché — actuellement mock data)
- **Future app mobile**: React Native + Expo

## Décisions de design

1. **Carte du métro**: utilise l'image officielle STM (`src/assets/metro-map.webp`, 600x718). Les hotspots sont des boutons HTML absolus positionnés en pourcentage par-dessus l'image — pas du SVG, pour éviter des problèmes de rendu.

2. **Anonymat par défaut**: chaque utilisateur a un pseudo généré automatiquement. Pas d'inscription requise pour lire ou poster (auth anonyme via Supabase prévue).

3. **3 types de posts**:
   - **Info** (bleu): infos générales sur la station
   - **Inspecteur** (rouge): signalement d'inspecteurs STM
   - **Incident** (ambre): retards, problèmes techniques, manifestations

4. **Crédibilité par vote**: chaque post a un % de crédibilité = upvotes / (upvotes + downvotes). Les posts douteux sont visuellement déprioritisés.

5. **Posts éphémères prévus**: les posts type "Inspecteur" devraient expirer après 2h (information périmée). À implémenter dans la phase backend.

## Structure des fichiers

```
src/
├── App.tsx                       # Layout: header, carte, canal de station, footer
├── components/
│   ├── MetroMap.tsx              # Carte cliquable (img + boutons absolus)
│   ├── StationChannel.tsx        # Canal d'une station (header + stats + posts + composer)
│   ├── PostCard.tsx              # Un post avec vote up/down et crédibilité
│   └── PostComposer.tsx          # Formulaire avec sélecteur de type
├── data/
│   ├── stations.ts               # Les 68 stations + coordonnées + lignes
│   └── posts.ts                  # Mock posts (À REMPLACER par Supabase)
└── assets/
    └── metro-map.webp            # Carte officielle STM (qualité 92)
```

## Coordonnées des stations

Les 68 stations sont dans `src/data/stations.ts` avec coordonnées x,y sur l'image 600x718. **Certaines sont encore mal alignées** — c'est le travail prioritaire à faire en regardant le rendu dans le navigateur. Format:

```ts
['Nom', x, y, 'g'] // ou 'o', 'b', 'y', ou 'g,o' pour transfer
```

Lignes:
- `g` = Verte (#00A651)
- `o` = Orange (#EF8B22)
- `b` = Bleue (#0083CA)
- `y` = Jaune (#E0AE00)

Stations de transfert (multi-lignes): Berri-UQAM, Lionel-Groulx, Jean-Talon, Snowdon.

## Roadmap

### Phase 1 — Finir le prototype (en cours)
- Corriger les coordonnées des stations
- Ajouter recherche par nom
- Tester sur mobile

### Phase 2 — Backend Supabase
- Auth anonyme
- Tables: stations, posts, votes, reports
- Realtime sur posts
- Remplacer mock data

### Phase 3 — Modération
- Signaler un post
- Filtres de mots-clés
- Expiration auto des posts inspecteurs
- Rate limiting

### Phase 4 — Mobile (Expo)
- Convertir en React Native
- Push notifications
- Géolocalisation pour suggérer la station la plus proche

## Commandes utiles

```bash
npm run dev          # Serveur de dev avec hot reload
npm run build        # Build pour production
npm run preview      # Preview du build
npx tsc --noEmit     # Vérifier les types sans build
```

## Contraintes à respecter

- **Toujours en français** pour l'UI utilisateur (l'app cible Montréal)
- **Disclaimer dans le footer**: "Plateforme communautaire — Les signalements sont partagés par les utilisateurs et n'engagent pas la STM."
- **Pas de monétisation** de la délation des inspecteurs (pas de système de récompense pour signaler des inspecteurs spécifiquement)
- **Pas de tracking précis de personnes** (description générale OK, photos d'inspecteurs identifiables PAS OK)
