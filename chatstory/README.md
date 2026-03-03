# 📖 ChatStory — MRC War Room

Ce dossier contient l'historique complet des conversations et décisions prises lors du développement de la plateforme **MRC War Room** (Congo 2026).

---

## 📁 Fichiers

| Fichier | Contenu | Statut |
|---------|---------|--------|
| `session-001.md` | Analyse nove/, choix de stack, création backend + web + mobile-candidat | ✅ |
| `session-002.md` | Mobile terrain complet, 9 pages web, déploiement VPS 169.239.181.3 | ✅ |
| `DECISIONS.md` | Toutes les décisions techniques avec justifications | 🔄 en cours |

---

## 📊 Progression globale

```
Backend          ████████████████████  100% ✅
Web (React)      ████████████████████  100% ✅
Mobile Candidat  ████████████████████  100% ✅
Mobile Terrain   ████████████████████  100% ✅
Déploiement VPS  ████████████████░░░░   80% 🔄 (scripts prêts, à tester)
```

---

## 🚀 Commandes rapides

```bash
# Dev local
cd backend && npm run dev          # :8787
cd web && npm run dev              # :5173
cd mobile-terrain && npx expo start
cd mobile-candidate && npx expo start

# Déployer sur VPS 169.239.181.3
bash deploy.sh --full              # Premier déploiement complet
bash deploy.sh                     # Re-déploiement rapide
```

---

## Convention

Chaque session est un fichier `session-NNN.md` avec :
- Date et contexte
- Ce qui a été demandé
- Ce qui a été construit
- Décisions techniques clés
- Bugs rencontrés et corrections
- État final
