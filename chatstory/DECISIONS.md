# 📋 Décisions techniques — MRC War Room

Journal des décisions architecturales importantes. Mis à jour au fil des sessions.

---

## Stack technologique

| Composant | Choix | Raison |
|-----------|-------|--------|
| Runtime | Node.js 20 LTS | Stabilité + ESM natif |
| Framework API | Fastify v4 | 2x plus rapide qu'Express, TypeScript natif |
| Base de données | better-sqlite3 | Stable (vs `node:sqlite` expérimental), synchrone |
| Temps réel | @fastify/websocket | Intégré à Fastify, topics pub/sub |
| Frontend | React 19 + Vite | Pas de UI lib = design sur-mesure MRC |
| Mobile | Expo ~53 | Pas d'éjection, OTA updates, expo-location/image-picker |
| Auth | scrypt + sessions | Compat avec nove/ (mêmes seed users) |
| Process manager | PM2 | Standard VPS, restart automatique, logs |

---

## Décisions de design

### D-001 — Territoire en JSON (pas en DB)
**Raison :** nove/ utilisait un fichier JSON → compat ascendante, import simple.
**Fichier :** `backend/data/territory.json`

### D-002 — Pas d'auth sur `/dashboard/candidate-brief`
**Raison :** L'app mobile candidat n'a pas de login (juste URL backend).
**Impact :** Ce endpoint est public → ne jamais y mettre de données sensibles.

### D-003 — Seed users compatibles nove/
**Raison :** `crypto.scryptSync` identique à nove/server.js lignes 852-860.
**Utilisateurs :** `warroom.admin/Admin123!`, `coord.brazza/Coord123!`, etc.
**Fichier seed :** `backend/config/seed/users.seed.json`

### D-004 — Pas de workspace/monorepo
**Raison :** Les 2 apps mobiles sont 100% indépendantes — pas de npm workspace.
**Impact :** Dupliquer les types si besoin (acceptable pour 2 apps très différentes).

### D-005 — `moduleResolution: NodeNext` pour le backend
**Raison :** `bundler` est pour Webpack/Vite — `NodeNext` est correct pour `node dist/server.js`.
**Impact :** Toutes les imports doivent avoir l'extension `.js`.

### D-006 — Mapping user backend→mobile dans api.ts
**Raison :** Backend retourne `username`, `scopeDepartmentName`, `sessionToken` — mobile attend `login`, `department`, `token`.
**Décision :** Mapping dans `mobile-terrain/src/services/api.ts` fonction `login()`.

### D-007 — CORS désactivé en production
**Raison :** Fastify sert le frontend React depuis le même processus en production.
**Config :** `origin: process.env.NODE_ENV === 'development' ? true : false`

### D-008 — PM2 avec ecosystem.config.cjs
**Raison :** `package.json` a `"type": "module"` → PM2 ne peut pas lire un `.js` en CommonJS.
**Solution :** Extension `.cjs` force CommonJS pour le fichier de config PM2.

### D-009 — Build web local + rsync, deps installées sur VPS
**Raison :** `better-sqlite3` est un module natif qui compile pour l'OS cible.
**Impact :** Impossible de rsync node_modules depuis Windows vers Linux.

---

## Rôles et permissions

```
war_room              → Tout accès (admin opérationnel)
regional_coordinator  → Campaign, Events, Members, Media, Polling, Territory, Teams
zone_leader           → Campaign, Events, Members, Media
field_agent           → Campaign, Events (lecture+écriture terrain)
membership_data_entry → Members uniquement
candidate             → CandidateBrief uniquement
direction             → CandidateBrief + read-only (Events, Media, Teams, Territory, Social, Admin)
```

## Modules terrain par rôle (défaut)

```
field_agent           → campaign, sondage, incident
zone_leader           → campaign, sondage, incident, events, mission
regional_coordinator  → campaign, sondage, incident, events, mission, digital, logistique
war_room              → tous les 8 modules
```

---

## Endpoints clés

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /api/auth/login` | Public | Retourne `{ sessionToken, user }` |
| `GET /dashboard/candidate-brief` | **Public** | Brief exécutif (mobile candidat) |
| `GET /dashboard/war-room` | war_room, coord | Dashboard temps réel |
| `GET /ws?topic=war-room` | WebSocket | Temps réel (ping/pong 30s) |
| `POST /api/campaign-records` | terrain roles | Rapports terrain (offline queue cible) |
| `POST /api/member-enrollments` | terrain roles | Adhérents (offline queue cible) |
| `GET /health` | Public | `{ ok: true, ts: "..." }` |
