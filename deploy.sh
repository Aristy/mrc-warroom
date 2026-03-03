#!/bin/bash
# ============================================================
# MRC War Room — Deploy via GitHub
# Usage:
#   bash deploy.sh              # git push + VPS git pull + tsc + pm2 restart
#   bash deploy.sh --full       # idem + npm install (après ajout de dépendances)
#   bash deploy.sh --push-only  # git push uniquement (sans toucher au VPS)
# ============================================================

set -e

VPS="vmcuutte@169.239.181.3"
DEPLOY_PATH="/var/www/warroom"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FULL_DEPLOY=false
PUSH_ONLY=false

for arg in "$@"; do
  [[ "$arg" == "--full" ]]      && FULL_DEPLOY=true
  [[ "$arg" == "--push-only" ]] && PUSH_ONLY=true
done

echo ""
echo "┌─────────────────────────────────────────┐"
echo "│   MRC War Room — Deploy via GitHub      │"
echo "└─────────────────────────────────────────┘"
echo ""

# ─── Step 1 : Git push ────────────────────────────────────────
echo "▶ [1/2] Git push..."
cd "$SCRIPT_DIR"

if [[ -z "$(git status --porcelain)" ]]; then
  echo "  ℹ Rien à commiter, push du dernier commit..."
else
  git add -A
  git commit -m "deploy: $(date '+%Y-%m-%d %H:%M')"
fi

git push origin main
echo "  ✓ Code poussé sur GitHub"

[[ "$PUSH_ONLY" == true ]] && echo "" && echo "  Push only — terminé." && exit 0

# ─── Step 2 : Deploy on VPS ──────────────────────────────────
echo "▶ [2/2] Déploiement sur VPS ($VPS)..."

if [ "$FULL_DEPLOY" = true ]; then
  echo "  (full: git pull + npm install + build web + tsc + pm2)"
  ssh "$VPS" bash << 'REMOTE'
set -e
cd /var/www/warroom
echo "  → git pull..."
git pull origin main

echo "  → build web..."
cd web && npm install --silent && npm run build
cd ..

echo "  → build backend..."
cd backend && npm install --silent && npm run build
mkdir -p /var/log/warroom

if pm2 describe warroom > /dev/null 2>&1; then
  pm2 restart warroom --update-env
else
  pm2 start ecosystem.config.cjs --env production
fi
pm2 save
echo "  ✓ Déployé"
REMOTE

else
  echo "  (rapide: git pull + tsc + pm2)"
  ssh "$VPS" bash << 'REMOTE'
set -e
cd /var/www/warroom
echo "  → git pull..."
git pull origin main
echo "  → tsc build backend..."
cd backend && npm run build
if pm2 describe warroom > /dev/null 2>&1; then
  pm2 restart warroom --update-env
else
  mkdir -p /var/log/warroom
  pm2 start ecosystem.config.cjs --env production
  pm2 save
fi
echo "  ✓ Redémarré"
REMOTE
fi

echo ""
echo "┌─────────────────────────────────────────────────────────┐"
echo "│  ✓ Déploiement terminé !                                │"
echo "│                                                         │"
echo "│  Health : http://169.239.181.3:8787/health              │"
echo "│  Web    : http://169.239.181.3:8787                     │"
echo "└─────────────────────────────────────────────────────────┘"
echo ""
