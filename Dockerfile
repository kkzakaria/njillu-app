# Production-ready multi-stage Dockerfile for Next.js application
# Optimized for security, performance, and minimal attack surface

# Stage 1: Base image with security hardening
FROM node:20-alpine AS base
LABEL maintainer="njillu-app" \
      version="1.0.0" \
      description="Client Management System - Production Container"

# Install security updates and required packages
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates && \
    rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set security-focused environment variables
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    NPM_CONFIG_CACHE=/tmp/.npm \
    PNPM_HOME=/usr/local/bin

# Install pnpm globally
RUN npm install -g pnpm@latest

# Stage 2: Dependencies installation
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Install dependencies with production optimizations
RUN --mount=type=cache,target=/root/.pnpm \
    pnpm config set store-dir /root/.pnpm && \
    pnpm install --frozen-lockfile --prod=false

# Stage 3: Build the application
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY . .

# Build application with production optimizations
RUN pnpm build

# Stage 4: Production runtime
FROM base AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Create directory for health checks
RUN mkdir -p /app/health && \
    chown nextjs:nodejs /app/health

# Security hardening
RUN chmod -R 750 /app && \
    chmod -R 640 /app/.next && \
    chmod +x /app/server.js

# Switch to non-root user
USER nextjs

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Expose port
EXPOSE 3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]