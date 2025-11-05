FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Expose port (Sofia doesn't expose HTTP, but for health checks)
EXPOSE 9000

# Start Sofia AI
CMD ["pnpm", "dev"]
