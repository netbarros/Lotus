# ╔══════════════════════════════════════════════════════════════════════════╗
# ║ 🐳 ADMIN FRONTEND DOCKERFILE - Production Build                         ║
# ║ Multi-stage build for optimized production deployment                   ║
# ╚══════════════════════════════════════════════════════════════════════════╝

# ═══════════════════════════════════════════════════════════════════════════
# STAGE 1: BUILD
# ═══════════════════════════════════════════════════════════════════════════

FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build application
RUN npm run build

# ═══════════════════════════════════════════════════════════════════════════
# STAGE 2: PRODUCTION
# ═══════════════════════════════════════════════════════════════════════════

FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
