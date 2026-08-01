FROM node:20-alpine
RUN npm install -g pnpm
WORKDIR /workspace
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/config/package.json ./packages/config/
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile || pnpm install
COPY . .
RUN pnpm --filter shared build
EXPOSE 3000
CMD ["pnpm", "--filter", "web", "dev"]
