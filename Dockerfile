# Base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Alpine images need this for Prisma to run correctly
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy package info
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Build the app to generate standalone server
RUN npm run build

# Production image, copy all files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Prisma driver dependency for final layer
RUN apk add --no-cache openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy essential files
COPY --from=builder /app/public ./public
# Copy prisma if we need to retain the dev.db for testing purposes in container
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Note: In a real system, use a Postgres/MySQL remote database URL instead of SQLite
# The dev.db will be read-only if permissions aren't set, or reset on container restart
CMD ["node", "server.js"]
