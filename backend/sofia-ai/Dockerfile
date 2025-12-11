# ═══════════════════════════════════════════════════════════════════════════
# SOFIA AI v3.0 - ENTERPRISE MULTI-STAGE DOCKERFILE
# Optimized for production: ~500MB → ~150MB (~70% reduction)
# ═══════════════════════════════════════════════════════════════════════════

# ═══════════════════════════════════════════════════════════════════════════
# STAGE 1: BUILDER
# ═══════════════════════════════════════════════════════════════════════════
FROM node:25-alpine AS builder

# Metadata
LABEL maintainer="Sofia Lotus AI <sofia@softwarelotus.com.br>"
LABEL description="Sofia AI v3.0 - The Brain of MagicSaaS System-∞"
LABEL version="3.1.0"

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Install pnpm globally
RUN npm install -g pnpm@9

# Copy package files for dependency resolution
COPY package.json pnpm-lock.yaml* ./

# Install ALL dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN pnpm build

# Prune dev dependencies for production
RUN pnpm prune --prod

# ═══════════════════════════════════════════════════════════════════════════
# STAGE 2: PRODUCTION RUNNER
# ═══════════════════════════════════════════════════════════════════════════
FROM node:25-alpine AS runner

# Metadata
LABEL maintainer="Sofia Lotus AI <sofia@softwarelotus.com.br>"
LABEL org.opencontainers.image.source="https://github.com/netbarros/Lotus"
LABEL org.opencontainers.image.description="Sofia AI v3.0 - Production Image"
LABEL org.opencontainers.image.licenses="PROPRIETARY"

# Install runtime dependencies only
RUN apk add --no-cache \
    dumb-init \
    curl

# Create non-root user for security
RUN addgroup --system --gid 1001 sofiaai && \
    adduser --system --uid 1001 --ingroup sofiaai sofiaai

# Set working directory
WORKDIR /app

# Copy built application from builder
COPY --from=builder --chown=sofiaai:sofiaai /app/dist ./dist
COPY --from=builder --chown=sofiaai:sofiaai /app/node_modules ./node_modules
COPY --from=builder --chown=sofiaai:sofiaai /app/package.json ./package.json

# Create logs directory
RUN mkdir -p /app/logs && chown -R sofiaai:sofiaai /app/logs

# Switch to non-root user
USER sofiaai

# Environment variables
ENV NODE_ENV=production \
    PORT=3003 \
    SOFIA_PORT=3003

# Expose Sofia AI port
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3003/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start Sofia AI in production mode
CMD ["node", "dist/index.js"]

# ═══════════════════════════════════════════════════════════════════════════
# BUILD ARGS (for CI/CD metadata)
# ═══════════════════════════════════════════════════════════════════════════
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION

LABEL org.opencontainers.image.created=$BUILD_DATE
LABEL org.opencontainers.image.revision=$VCS_REF
LABEL org.opencontainers.image.version=$VERSION
