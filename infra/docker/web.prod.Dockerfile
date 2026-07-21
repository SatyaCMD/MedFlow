# Stage 1: Build Workspace
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm

# Copy workspace blueprints
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.json .eslintrc.cjs ./
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

# Install build dependencies
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @medicore360/shared build
RUN pnpm --filter @medicore360/web build

# Stage 2: Next.js Standalone runner image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy next built bundles
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
