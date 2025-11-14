# ==================== DIRECTUS EXTENSION DOCKERFILE ====================
# Pétala: healthcare
# Industry-Specific Extension for MagicSaaS System-∞
# Powered by Sofia AI v4.0

FROM directus/directus:10-alpine

# Metadata
LABEL maintainer="MagicSaaS Team"
LABEL petala="healthcare"
LABEL version="4.0.0"

WORKDIR /directus

# Copy pétala-specific extensions
COPY extensions/  ./extensions/
COPY shared/ ./shared/

# Install pétala-specific dependencies if package.json exists
COPY package*.json* ./
RUN if [ -f package.json ]; then npm ci --only=production; fi

# Sofia AI integration
ENV SOFIA_AI_ENABLED=true
ENV PETALA_NAME=healthcare
ENV PETALA_VERSION=4.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8055/server/health || exit 1

# Expose Directus port
EXPOSE 8055

# Start Directus with pétala extension
CMD ["npx", "directus", "start"]
