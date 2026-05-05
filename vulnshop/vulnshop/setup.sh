#!/bin/bash
# VulnShop — Quick Setup Script
# ⚠️  For cybersecurity training use only

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════╗"
echo "║   🛒  VulnShop Security Training Setup       ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}⚠️  WARNING: This app contains intentional security vulnerabilities.${NC}"
echo -e "${YELLOW}   For educational/training use ONLY. Never deploy in production.${NC}"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js not found. Install from https://nodejs.org${NC}"
  exit 1
fi
NODE_VER=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VER}${NC}"

# Check MySQL
if ! command -v mysql &> /dev/null; then
  echo -e "${YELLOW}⚠ MySQL client not found in PATH. Make sure MySQL server is running.${NC}"
else
  echo -e "${GREEN}✓ MySQL client found${NC}"
fi

# Install dependencies
echo ""
echo -e "${CYAN}📦 Installing dependencies...${NC}"
npm install

# Setup .env
if [ ! -f .env ]; then
  cp .env.example .env
  echo -e "${GREEN}✓ Created .env from .env.example${NC}"
fi

# Create uploads dir
mkdir -p public/uploads
echo -e "${GREEN}✓ Created public/uploads${NC}"

# Database setup
echo ""
echo -e "${CYAN}🗄️  Setting up database...${NC}"
echo -e "   Using: ${DB_HOST:-localhost}:${DB_PORT:-3306} / ${DB_NAME:-vulnshop}"
echo ""

read -p "Run database initialization? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  npm run init-db
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         ✅  Setup Complete!                  ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Start server:  npm start                    ║${NC}"
echo -e "${GREEN}║  Dev mode:      npm run dev                  ║${NC}"
echo -e "${GREEN}║                                              ║${NC}"
echo -e "${GREEN}║  🌐  http://localhost:3000                   ║${NC}"
echo -e "${GREEN}║  🎯  /api/challenges  (all 10 challenges)    ║${NC}"
echo -e "${GREEN}║  ⚙️   /admin          (admin panel)           ║${NC}"
echo -e "${GREEN}║  🐛  /debug          (session dump)          ║${NC}"
echo -e "${GREEN}║                                              ║${NC}"
echo -e "${GREEN}║  Admin:  admin / admin123                    ║${NC}"
echo -e "${GREEN}║  User:   john_doe / password123              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
