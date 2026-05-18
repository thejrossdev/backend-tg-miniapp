# syntax=docker/dockerfile:1.7

# Define default Node.js version, overridable at build time
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine AS base

# Configure PNPM environment and update PATH
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk update --no-cache && \
    apk upgrade --no-cache && \
    apk add --no-cache ca-certificates && \
    update-ca-certificates

# Install PNPM via corepack and add required Alpine Linux compatibility library
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apk add --no-cache libc6-compat

# Set workdir
WORKDIR /app

FROM base as development

ENV PATH="$PNPM_HOME/bin:$PATH"

# Install nestjs cli for debugging
RUN pnpm add -g @nestjs/cli

# Set development environment variables
ENV NODE_ENV=development

# Configurable application port with default 3000
ENV PORT=3000

# Document the default listening port (actual port is controlled by ENV PORT)
EXPOSE ${PORT} 9229

# Development command with hot-reload
CMD ["sh", "-c", "pnpm run start:debug"]

# === Installer + Builder stage ===
FROM base AS builder

# Copy dependency files first for better Docker layer caching
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY package.json ./package.json

# Copy source code
COPY . .

# Install dependencies using PNPM cache for faster subsequent builds
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Build the application
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm run build

# === Runner (production) ===
FROM base AS runner
WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production

# Configurable application port with default 3000
ENV PORT=3000

# Create a non-root user and group for security best practices
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

# Switch to the non-root user
USER nestjs

# Document the default listening port (actual port is controlled by ENV PORT)
EXPOSE ${PORT}

# Start the compiled NestJS application
CMD ["node", "dist/main.js"]
