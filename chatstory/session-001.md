# Session 001 — Analyse & Création du projet

**Date :** Début de conversation (contexte compressé)
**Statut :** ✅ Complète

---

## 🎯 Demande initiale

> "can check all nove folder"

L'utilisateur avait un projet existant `e:/Apps/nove/` — une plateforme MRC (Mouvement pour la Renaissance du Congo) pour les élections Congo 2026.

---

## 🔍 Analyse du projet existant (nove/)

### Problèmes identifiés dans nove/

| Problème | Impact |
|----------|--------|
| `server.js` monolithique de **174 KB** | Impossible à maintenir |
| `node:sqlite` expérimental (Node 22) | Instabilité en production |
| **3 apps mobiles** avec 99% de duplication | Maintenance impossible |
| Pas de temps réel | Dashboard ne se met pas à jour sans F5 |
| Frontend vanilla JS | Pas de TypeScript, pas de composants |
| Pas de RBAC propre | Sécurité fragile |

### Ce qui fonctionnait bien dans nove/
- Logique métier complète (48 endpoints)
- Système de rôles bien pensé (7 rôles)
- Seed users fonctionnels (`warroom.admin/Admin123!`)
- Structure territoire Congo (12 départements)
- Dashboard candidat (`buildCandidateBrief`, 300+ lignes)

---

## 💬 Dialogue clé

**User :** "what the best solution a suppose to use to get best plateform"

**Claude (recommandation) :**
- Backend : Node.js + **Fastify** + **better-sqlite3** + @fastify/websocket
- Frontend : **React 19 + Vite + TypeScript** (pas de UI lib)
- Mobile : **2 apps Expo séparées** (terrain + candidat) au lieu de 3

**User :** "peux tu cree un nouveau projet novera/warroom et on va faire un nouveau developpement avec le meilleur solution la-bas"

**User (clarification) :** "on redevelopper de maniere pro avec et corrige tout ce qu'il faut corrige avec un focus sur la partie du candidat et application mobile de terrain"

---

## 🏗️ Architecture choisie (Q&A utilisateur)

| Question | Réponse utilisateur |
|----------|---------------------|
| Localisation | `e:/Apps/novera/warroom/` |
| Frontend | React + Vite |
| Mobile | 2 apps séparées propres |
| Backend | Node.js + Fastify + better-sqlite3 |

---

## 📁 Ce qui a été construit — Session 001

### Backend (`warroom/backend/`)

```
package.json              ← fastify, better-sqlite3, @fastify/websocket, nanoid
tsconfig.json             ← ES2022, NodeNext modules
.env.example

src/
├── server.ts             ← Entry point, port 8787
├── app.ts                ← Fastify factory + plugins + WS + static serving
├── constants/
│   └── roles.ts          ← 7 rôles, RBAC sets, TerrainModuleId, SESSION_TTL
├── types/
│   └── fastify.d.ts      ← Type augmentation request.user
├── db/
│   ├── index.ts          ← better-sqlite3 connection, WAL mode, paths
│   ├── schema.ts         ← CREATE TABLE (extrait de server.js lignes 311-529)
│   ├── migrations.ts     ← addColumnIfMissing() pour compat ascendante
│   ├── seed.ts           ← Seed users depuis users.seed.json
│   └── queries/
│       ├── users.ts      ← findUserByLogin, findUserById, sanitizeUser
│       ├── sessions.ts   ← createSession (crypto.randomBytes), getSession
│       ├── campaign.ts   ← CampaignRecord CRUD
│       ├── members.ts    ← MemberEnrollment CRUD + publish
│       ├── events.ts     ← EventItem CRUD + validations + media
│       ├── media.ts      ← MediaItem CRUD + validate + publish
│       └── teams.ts      ← Team + TeamMember upsert
├── services/
│   ├── auth.service.ts       ← scrypt identique à nove (compat seed users)
│   ├── territory.service.ts  ← JSON file management, flattening
│   ├── campaign.service.ts   ← Agrégations campagne
│   ├── dashboard.service.ts  ← buildCandidateBrief + buildWarRoomDashboard
│   ├── upload.service.ts     ← saveFile vers uploads/
│   └── media.service.ts      ← resolveSharedMediaLink
├── middleware/
│   ├── auth.ts           ← Cookie mrc_session + Bearer token
│   └── rbac.ts           ← requireRole(Set<Role>) factory
├── ws/
│   ├── topics.ts         ← WS_TOPICS + WSMessage discriminated union
│   ├── hub.ts            ← Map<topic, Set<WebSocket>> + broadcast + heartbeat 30s
│   └── broadcaster.ts    ← pushWarRoom() + pushCandidateBrief()
└── routes/
    ├── auth.ts           ← POST login, GET session, POST logout
    ├── territory.ts      ← GET departments/arrondissements/zones/centers
    ├── campaign.ts       ← GET/POST campaign-records
    ├── members.ts        ← GET/POST + publish
    ├── events.ts         ← CRUD + media upload + validations + publish
    ├── media.ts          ← CRUD + resolve-link + screenshot + validate + publish
    ├── teams.ts          ← GET/POST teams + GET/PUT users
    ├── dashboard.ts      ← war-room, candidate-brief, polling, social
    ├── system.ts         ← settings, overview, clear-data
    └── index.ts          ← registerRoutes()
```

### Web Frontend (`warroom/web/`)

```
package.json              ← react 19, react-dom, react-router-dom
vite.config.ts            ← proxy /api + /dashboard + /ws → localhost:8787

src/
├── types/
│   ├── domain.ts         ← Tous les types TS : User, CampaignRecord, EventItem...
│   └── ws.ts             ← WSMessage discriminated union
├── api/
│   ├── client.ts         ← apiFetch<T>, apiPost, ApiError, redirect 401
│   ├── auth.api.ts
│   ├── dashboard.api.ts  ← dashboardApi + systemApi
│   └── campaign.api.ts   ← campaignApi, membersApi, eventsApi, mediaApi, teamsApi, territoryApi
├── context/
│   └── AuthContext.tsx   ← Provider + useAuth hook
├── hooks/
│   ├── useWS.ts          ← WebSocket avec backoff exponentiel (min(n*2000, 30000))
│   └── useApi.ts         ← Generic fetcher {data, loading, error, refresh}
├── components/
│   └── layout/
│       └── AppShell.tsx  ← Sidebar nav filtrée par rôle + logout
└── pages/
    ├── Login.tsx + Login.css   ← Dark theme, flag Congo, MRC branding
    ├── Dashboard.tsx           ← War Room : WS live, KPIs, priorités, incidents
    └── CandidateBrief.tsx      ← VUE EXÉCUTIVE (PRIORITÉ) : visibilité + KPIs + régions
```

### Mobile Candidat (`warroom/mobile-candidate/`)

```
App.tsx                   ← SafeAreaProvider + toggle Dashboard/Settings
src/
├── services/
│   ├── storage.ts        ← AsyncStorage : URL, cache brief
│   └── api.ts            ← fetchCandidateBrief() sans auth
├── hooks/
│   ├── useAutoRefresh.ts ← setInterval 30s avec cleanup
│   └── useCandidateBrief.ts ← fetch + fallback cache + stale state
└── screens/
    ├── DashboardScreen.tsx   ← Vue exécutive : AlertBanner + KPIs + régions + events
    └── SettingsScreen.tsx    ← URL backend
```

---

## 🔧 Décisions techniques clés — Session 001

### 1. Compatibilité seed users
`auth.service.ts` utilise `crypto.scryptSync` avec les mêmes paramètres que `nove/server.js` lignes 852-860. Les utilisateurs existants (`warroom.admin/Admin123!`) fonctionnent sans re-seed.

### 2. Territoire en JSON
Conservé comme fichier `data/territory.json` (pas de table DB), comme dans nove — préserve le workflow d'import.

### 3. Candidat Brief sans auth
`/dashboard/candidate-brief` n'a pas de `requireRole` → l'app mobile candidat peut fetcher sans token.

### 4. WebSocket protocol
```typescript
type WSMessage =
  | { type: 'war-room-update'; payload: WarRoomData; timestamp: string }
  | { type: 'candidate-brief-update'; payload: CandidateBrief; timestamp: string }
  | { type: 'ping'; timestamp: string }
  | { type: 'pong'; timestamp: string }
  | { type: 'connected'; topic: string; timestamp: string }
  | { type: 'error'; message: string; timestamp: string }
```

### 5. CORS en production
`origin: false` en production → Fastify sert le front, pas de cross-origin.

---

## 🐛 Bugs identifiés et corrigés

| Bug | Correction |
|-----|-----------|
| `node:sqlite` expérimental | Remplacé par `better-sqlite3` |
| 174KB monolithique | Découpé en modules db/services/routes/ws |
| 3 apps dupliquées | 2 apps propres et séparées |
| Pas de temps réel | @fastify/websocket + hub/broadcaster |

---

## ✅ État en fin de Session 001

- Backend : **100% complet** (48 endpoints, WS, RBAC, auth)
- Web : **Dashboard + CandidateBrief** (pages prioritaires) + Login + AppShell
- Mobile Candidat : **100% complet** (2 screens, auto-refresh 30s)
- Mobile Terrain : **Services uniquement** (storage, api, offlineQueue)
- `npm install` backend : ✅ effectué
