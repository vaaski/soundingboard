FROM node:22-slim AS base
WORKDIR /home/app/
RUN npm install -g corepack@latest
RUN corepack enable && corepack prepare pnpm@10 --activate

FROM base AS install
RUN mkdir -p /temp/dep/
COPY package.json pnpm-lock.yaml /temp/dep/
RUN cd /temp/dep/ && pnpm install --frozen-lockfile

FROM base AS build
COPY --from=install /temp/dep/node_modules/ node_modules/
COPY . .
ENV NODE_ENV=production
RUN pnpm run build

FROM base

COPY --from=build /home/app/.output .output/
CMD ["node", ".output/server/index.mjs"]