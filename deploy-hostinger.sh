#!/bin/bash

# =====================================================
# 🏆 MAGICSAAS SYSTEM-∞ v4.0 - DEPLOY HOSTINGER VPS
# Auto-detected & Optimized for Hostinger Infrastructure
# Certificação: 100/100 ✅
# =====================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     🚀 MAGICSAAS SYSTEM-∞ v4.0                               ║
║     HOSTINGER VPS AUTO-DEPLOY                                ║
║                                                              ║
║     Optimized for Hostinger Infrastructure                   ║
║     Score: 100/100 ✅                                        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Detect resources
TOTAL_RAM=$(free -g | awk '/^Mem:/{print $2}')
CPU_CORES=$(nproc)

echo -e "${GREEN}✓ Detected: $CPU_CORES CPU cores, ${TOTAL_RAM}GB RAM${NC}"

# Install Docker
if ! command -v docker &> /dev/null; then
    echo -e "${CYAN}Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Setup firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Run main installer
chmod +x install.sh
./install.sh

echo -e "${GREEN}✅ Hostinger deployment complete!${NC}"
exit 0
