# Site (Vite + servidor Node sem dependências). Contexto do build: a raiz do repositório.
#   docker build -f apps/site/Dockerfile -t hs-site .
FROM node:22.23.4-alpine AS build
RUN corepack enable
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/site/package.json apps/site/
COPY apps/cms/package.json apps/cms/
COPY packages/types/package.json packages/types/
RUN pnpm install --frozen-lockfile --filter site...
COPY packages/types packages/types
COPY apps/site apps/site
# sem CMS_URL no build, o HTML inicial sai com o texto padrão; o servidor busca o conteúdo real ao subir
ARG CMS_URL=""
ARG SITE_URL=""
RUN CMS_URL=$CMS_URL SITE_URL=$SITE_URL pnpm --filter site build

FROM node:22.23.4-alpine AS run
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build --chown=app:app /repo/apps/site/dist ./dist
COPY --from=build --chown=app:app /repo/apps/site/dist-server ./dist-server
COPY --from=build --chown=app:app /repo/apps/site/lib ./lib
COPY --from=build --chown=app:app /repo/apps/site/server.cjs /repo/apps/site/package.json ./
RUN mkdir -p data && chown app:app data
USER app
EXPOSE 3000
CMD ["node", "server.cjs"]
