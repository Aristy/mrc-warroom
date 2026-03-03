#!/bin/bash
# ============================================================
# MRC War Room — First-time VPS setup
# Run this ONCE on the VPS via: bash setup-vps.sh
# Tested on Ubuntu 22.04 / Debian 12
# ============================================================

set -e

DEPLOY_PATH="/var/www/warroom"
NODE_VERSION="20"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   MRC War Room — VPS First-Time Setup               ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ─── Require root ─────────────────────────────────────────────
if [ "$EUID" -ne 0 ]; then
  echo "  Re-running with sudo..."
  exec sudo bash "$0" "$@"
fi

# ─── System packages ─────────────────────────────────────────
echo "▶ [1/6] Updating system packages..."
apt-get update -qq
apt-get install -y -qq curl wget git build-essential python3 unzip > /dev/null
echo "  ✓ System packages ready"

# ─── Node.js via nvm ─────────────────────────────────────────
echo "▶ [2/6] Installing Node.js $NODE_VERSION via nvm..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - > /dev/null 2>&1
  apt-get install -y -qq nodejs > /dev/null
fi
echo "  ✓ Node $(node --version) ready"

# ─── PM2 ─────────────────────────────────────────────────────
echo "▶ [3/6] Installing PM2..."
DEPLOY_USER="${SUDO_USER:-vmcuutte}"
npm install -g pm2 --quiet
# Configure pm2 systemd startup for the deploy user
env PATH="$PATH:/usr/local/bin" pm2 startup systemd -u "$DEPLOY_USER" --hp "/home/$DEPLOY_USER" 2>/dev/null || true
echo "  ✓ PM2 $(pm2 --version) ready (configured for $DEPLOY_USER)"

# ─── Directory structure ──────────────────────────────────────
echo "▶ [4/6] Creating directory structure..."
mkdir -p "$DEPLOY_PATH/backend"
mkdir -p "$DEPLOY_PATH/backend/data"
mkdir -p "$DEPLOY_PATH/backend/uploads/events"
mkdir -p "$DEPLOY_PATH/backend/uploads/pvs"
mkdir -p "$DEPLOY_PATH/backend/config/seed"
mkdir -p "$DEPLOY_PATH/web/dist"
mkdir -p /var/log/warroom
# Give deploy user write access (so rsync works without sudo)
DEPLOY_USER="${SUDO_USER:-vmcuutte}"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_PATH" /var/log/warroom 2>/dev/null || true
echo "  ✓ Directories created (owner: $DEPLOY_USER)"

# ─── Production .env ─────────────────────────────────────────
echo "▶ [5/6] Creating .env if not exists..."
ENV_FILE="$DEPLOY_PATH/backend/.env"
if [ ! -f "$ENV_FILE" ]; then
  cat > "$ENV_FILE" <<'EOF'
NODE_ENV=production
PORT=8787
LOG_LEVEL=warn
EOF
  echo "  ✓ .env created at $ENV_FILE"
else
  echo "  ℹ .env already exists — not overwritten"
fi

# ─── Firewall ─────────────────────────────────────────────────
echo "▶ [6/6] Configuring firewall (ufw)..."
if command -v ufw &> /dev/null; then
  ufw allow 22/tcp   > /dev/null 2>&1 || true
  ufw allow 8787/tcp > /dev/null 2>&1 || true
  ufw allow 80/tcp   > /dev/null 2>&1 || true
  ufw allow 443/tcp  > /dev/null 2>&1 || true
  echo "  ✓ Ports 22, 80, 443, 8787 open"
else
  echo "  ⚠ ufw not found, skipping firewall config"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✓ Setup terminé !                                      ║"
echo "║                                                         ║"
echo "║  Prochaine étape : lancer le deploy depuis votre PC     ║"
echo "║    bash deploy.sh --full                                ║"
echo "║                                                         ║"
echo "║  Vérifier les logs :                                    ║"
echo "║    pm2 logs warroom                                     ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
