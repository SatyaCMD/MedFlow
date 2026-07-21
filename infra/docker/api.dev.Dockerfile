FROM node:20-alpine
RUN npm install -g pnpm
WORKDIR /workspace
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/config/package.json ./packages/config/
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile || pnpm install
COPY . .
EXPOSE 4000
CMD ["pnpm", "--filter", "api", "dev"]
