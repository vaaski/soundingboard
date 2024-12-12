FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /home/app/

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