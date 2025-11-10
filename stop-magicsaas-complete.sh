#!/usr/bin/env bash

# ==============================================================================
#
#         🌸 MAGICSAAS SYSTEM-∞ + PÉTALA FASHION
#         COMPLETE SHUTDOWN SCRIPT
#
#         Stops all services gracefully
#
# ==============================================================================

set -euo pipefail

# Colors
readonly COLOR_RESET='\033[0m'
readonly COLOR_GREEN='\033[0;32m'
readonly COLOR_CYAN='\033[0;36m'
readonly COLOR_MAGENTA='\033[0;35m'

# Script directory
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_color() {
    local color="$1"
    shift
    echo -e "${color}$*${COLOR_RESET}"
}

print_info() {
    print_color "$COLOR_CYAN" "  ℹ️  $1"
}

print_success() {
    print_color "$COLOR_GREEN" "  ✅ $1"
}

echo ""
print_color "$COLOR_MAGENTA" "Stopping MagicSaaS System-∞ + Pétala Fashion..."
echo ""

# Stop Pétala Fashion
print_info "Stopping Pétala Fashion..."
cd "${SCRIPT_DIR}/petalas/fashion"
docker compose down 2>/dev/null || docker-compose down 2>/dev/null || true
print_success "Pétala Fashion stopped"

# Stop MagicSaaS
print_info "Stopping MagicSaaS System-∞..."
cd "${SCRIPT_DIR}/infrastructure/docker"
docker compose -f docker-compose.dev.yml down 2>/dev/null || docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
print_success "MagicSaaS System-∞ stopped"

echo ""
print_color "$COLOR_GREEN" "All services stopped successfully!"
echo ""
