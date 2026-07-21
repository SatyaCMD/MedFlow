# Stage 1: Build Workspace
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm

# Copy workspace blueprints
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.json .eslintrc.cjs ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Install build dependencies
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @medicore360/shared build
RUN pnpm --filter @medicore360/api build

# Prune devDependencies to keep image size small
RUN pnpm prune --prod --no-optional

# Stage 2: Production Execution Image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install running binary bindings (e.g. argon2 requirements)
RUN apk add --no-cache libc6-compat

# Copy assets and dependencies from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]
