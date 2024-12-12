FROM oven/bun:slim AS base
WORKDIR /home/bun/app/

FROM base AS install
RUN mkdir -p /temp/dep/
COPY package.json bun.lockb /temp/dep/
RUN cd /temp/dep/ && bun install --frozen-lockfile

FROM base AS build
COPY --from=install /temp/dep/node_modules/ node_modules/
COPY . .
ENV NODE_ENV=production
RUN bun run build

FROM base
COPY --from=build /home/bun/app/.output .output/
CMD ["bun", "run", ".output/server/index.mjs"]