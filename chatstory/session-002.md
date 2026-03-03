# Session 002 — Mobile Terrain, Pages Web, Déploiement VPS

**Date :** 2026-03-03
**Contexte :** Reprise après compression du contexte (session 001 archivée)
**Statut :** ✅ Complète

---

## 🎯 Demande

> "tu peux continuer"

Reprise là où la session 001 s'était arrêtée : les services du mobile-terrain étaient créés, il fallait finir les hooks, composants, screens et App.tsx. Puis finaliser les pages web manquantes et préparer le déploiement.

---

## 📦 Ce qui a été construit — Mobile Terrain

### Hooks (`src/hooks/`)

| Fichier | Rôle |
|---------|------|
| `useAuth.ts` | Login/logout, session AsyncStorage, mapping champs backend→MobileUser |
| `useOfflineQueue.ts` | Compteur file d'attente, auto-sync toutes les 60s |
| `useLocation.ts` | GPS via expo-location, permissions, GpsSnapshot |
| `useTerritory.ts` | Fetch départements + cache AsyncStorage, fallback offline |
| `useModules.ts` | Modules activés de l'user avec labels/icônes/couleurs par ModuleKey |

### Composants (`src/components/`)

| Fichier | Rôle |
|---------|------|
| `GpsCapture.tsx` | Bouton capture GPS, affichage coords + précision, clear |
| `MediaPicker.tsx` | Galerie + caméra expo-image-picker, scroll horizontal, max N photos |
| `TerritorySelect.tsx` | Sélection hiérarchique 4 niveaux via Modal + FlatList + recherche |
| `OfflineBanner.tsx` | Bandeau hors-ligne via @react-native-community/netinfo |
| `QueueBadge.tsx` | Badge "N en attente" amber, bouton sync manuel |

### Screens (`src/screens/`)

| Fichier | Description |
|---------|-------------|
| `LoginScreen.tsx` | Dark theme, flag Congo, config URL serveur dépliable |
| `HomeScreen.tsx` | Grille modules 2 colonnes, QueueBadge, info scope agent |
| `SettingsScreen.tsx` | Compte, URL backend, modules activés, déconnexion |
| `modules/IncidentScreen.tsx` | Type + sévérité + titre + desc + territoire + GPS + photos |
| `modules/SondageScreen.tsx` | Nb répondants + intentions de vote + territoire + GPS |
| `modules/CampaignScreen.tsx` | Type activité + titre + participants + territoire + GPS + photos |
| `modules/EventScreen.tsx` | Type + titre + participants + description + territoire + GPS + photos |
| `modules/MissionScreen.tsx` | Référence + statut + objectif + résultat + territoire + GPS |
| `modules/DigitalScreen.tsx` | Plateforme + type contenu + texte + URL + portée estimée |
| `modules/LogistiqueScreen.tsx` | Ressource + statut + quantité + description + territoire + GPS |
| `modules/AdherentScreen.tsx` | Prénom + nom + téléphone + genre + naissance + profession + territoire + GPS |

### App.tsx

NavigationContainer avec `createNativeStackNavigator` :
- `Home` → HomeScreen (grille modules)
- `Settings` → SettingsScreen
- `Module` → switch sur `ModuleKey` → affiche le bon screen

Auth centralisée : si pas de session, affiche `LoginScreen` hors navigation.

---

## 🔧 Corrections de cohérence

### Bug 1 — Chemin `web/dist` incorrect dans app.ts
```diff
- const webDist = path.resolve(__dirname, '../../../web/dist');
+ const webDist = path.resolve(__dirname, '../../web/dist');
```
`__dirname` dans `backend/dist/` → `../../` remonte à `warroom/` → `warroom/web/dist` ✓

### Bug 2 — `moduleResolution: bundler` → `NodeNext`
```diff
- "module": "ESNext",
- "moduleResolution": "bundler",
+ "module": "NodeNext",
+ "moduleResolution": "NodeNext",
```
`bundler` est pour Webpack/Vite, pas pour `node dist/server.js` en production.

### Bug 3 — `storage.ts` incohérent
- Fonctions `getSettings`/`saveSettings` → remplacées par `getBackendUrl`/`setBackendUrl`/`getEffectiveBackendUrl`
- `saveSession(token, user)` → `saveSession({ token, user })`
- `getDepartments` → `getDepartmentsCache` / `saveDepartmentsCache`

### Bug 4 — `LoginResponse.sessionToken` vs `token`
Backend retourne `{ sessionToken, user }` → `api.ts` mappe vers `{ token, user }` :
```typescript
const data = await res.json();
const user = { login: u.username, department: u.scopeDepartmentName, ... };
return { token: data.sessionToken ?? data.token, user };
```

### Bug 5 — `ModuleKey` : `'event'` → `'events'`
Aligné sur `TERRAIN_MODULE_IDS` du backend qui utilise `'events'` (pluriel).

### Bug 6 — Pages web : champs domain types
- `Members.tsx` : `m.firstName` → `m.fullName ?? ${m.lastName} ${m.firstNames}`
- `Media.tsx` : `item.url` → `item.sourceUrl`
- `Campaign.tsx` : `r.departmentId/agentName/data` → `r.regionName/submittedBy/summary`
- `Teams.tsx` : `m.userName` → `m.name ?? m.username ?? m.userId`

---

## 📄 Pages Web ajoutées

| Page | Route | Rôles |
|------|-------|-------|
| `Campaign.tsx` | `/campaign` | war_room, regional_coordinator, zone_leader, field_agent |
| `Events.tsx` | `/events` | + direction |
| `Members.tsx` | `/members` | + membership_data_entry |
| `Media.tsx` | `/media` | war_room, regional_coordinator, zone_leader, direction |
| `Teams.tsx` | `/teams` | war_room, regional_coordinator, direction |
| `Territory.tsx` | `/territory` | war_room, regional_coordinator, direction |
| `Social.tsx` | `/social` | war_room, regional_coordinator, direction |
| `PollingReview.tsx` | `/polling` | war_room, regional_coordinator |
| `SystemAdmin.tsx` | `/admin` | war_room, direction |

`App.tsx` et `AppShell.tsx` mis à jour avec toutes les routes.

---

## 🚀 Déploiement VPS — `169.239.181.3`

### Fichiers créés

| Fichier | Description |
|---------|-------------|
| `backend/ecosystem.config.cjs` | Config PM2 (`.cjs` car package.json `"type":"module"`) |
| `deploy.sh` | Script de déploiement depuis le PC local |
| `scripts/setup-vps.sh` | Setup VPS first-time (Node 20, PM2, dossiers, firewall) |
| `backend/.env.production` | Variables d'env production |
| `.gitignore` | node_modules, dist, .env, sqlite, uploads |

### Architecture production

```
Fastify :8787
├── /health          → { ok: true }
├── /api/*           → 48 endpoints REST
├── /dashboard/*     → candidateBrief, warRoom, polling, social
├── /ws              → WebSocket (topics: war-room, candidate-brief)
└── /*               → web/dist/ (SPA React, SPA fallback → index.html)
```

### Procédure de déploiement

```bash
# 1. Setup VPS (une seule fois)
scp scripts/setup-vps.sh root@169.239.181.3:/tmp/
ssh root@169.239.181.3 "bash /tmp/setup-vps.sh"

# 2. Premier déploiement complet
bash deploy.sh --full

# 3. Re-déploiements rapides
bash deploy.sh
```

### Ce que fait `deploy.sh`

1. `npm run build` dans `web/` → `web/dist/`
2. `rsync` backend source → VPS `/var/www/warroom/backend/` (sans node_modules, sans .env)
3. `rsync` `web/dist/` → VPS `/var/www/warroom/web/dist/`
4. Sur VPS : `npm install` (compile better-sqlite3 pour Linux) + `tsc` + `pm2 restart`

---

## 📊 État final du projet

### Mobile Terrain — 100% ✅

```
App.tsx                      ← NavigationContainer
src/
├── types/domain.ts
├── services/
│   ├── api.ts               ← login, logout, fetchDepartments, postRecord
│   ├── storage.ts           ← session, queue, territory cache, backendUrl
│   └── offlineQueue.ts      ← enqueue, processQueue, removeFromQueue
├── hooks/
│   ├── useAuth.ts
│   ├── useOfflineQueue.ts
│   ├── useLocation.ts
│   ├── useTerritory.ts
│   └── useModules.ts
├── components/
│   ├── GpsCapture.tsx
│   ├── MediaPicker.tsx
│   ├── TerritorySelect.tsx
│   ├── OfflineBanner.tsx
│   └── QueueBadge.tsx
└── screens/
    ├── LoginScreen.tsx
    ├── HomeScreen.tsx
    ├── SettingsScreen.tsx
    └── modules/
        ├── IncidentScreen.tsx
        ├── SondageScreen.tsx
        ├── CampaignScreen.tsx
        ├── EventScreen.tsx
        ├── MissionScreen.tsx
        ├── DigitalScreen.tsx
        ├── LogistiqueScreen.tsx
        └── AdherentScreen.tsx
```

### Web — 100% ✅ (13 pages)
Login, Dashboard (War Room WS), CandidateBrief, Campaign, Events, Members, Media, Teams, Territory, Social, PollingReview, SystemAdmin

### Backend — 100% ✅
48 endpoints, WebSocket, RBAC, auth scrypt, better-sqlite3, PM2

### Mobile Candidat — 100% ✅
2 screens, auto-refresh 30s, cache offline

---

## 💡 Notes pour la prochaine session

- Tester le déploiement réel sur `169.239.181.3`
- Vérifier que `better-sqlite3` compile bien sur la version Linux du VPS
- Copier les fichiers seed JSON depuis `nove/config/seed/` si pas encore fait
- Vérifier les logs PM2 après premier démarrage
- Tester le WebSocket depuis le web (indicateur vert dans Dashboard)
- Tester offline queue depuis mobile terrain (couper WiFi → soumettre → rallumer → sync)
