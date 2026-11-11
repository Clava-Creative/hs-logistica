# HS Logística e Armazenagem (v3)

Monorepo com dois serviços e um pacote de tipos:

| Pasta | O que é |
|---|---|
| `apps/site` | o site (Vite + TypeScript, cena 3D, scroll guiado) e o `server.cjs`, que monta as páginas com o conteúdo do CMS |
| `apps/cms` | o CMS (Payload v3 + Next): painel em `/admin` e API em `/api` |
| `packages/types` | `payload-types.ts`, gerado pelo CMS e usado pelo site |

O cliente edita tudo no painel: página inicial, marca e cores, blog, pedidos de cotação e usuários.
O site não busca conteúdo no navegador: o HTML já sai pronto do servidor, que guarda as páginas em memória
e as refaz quando o CMS avisa que algo mudou.

## Rodar no seu computador

```bash
pnpm install
```

```bash
docker compose up -d
```

```bash
cp apps/cms/.env.example apps/cms/.env
```

```bash
cp apps/site/.env.example apps/site/.env
```

Preencha os três segredos (`REVALIDATE_SECRET`, `PREVIEW_SECRET`, `QUOTE_PROXY_SECRET`) com os mesmos valores nos dois
arquivos, e `ADMIN_EMAIL` / `ADMIN_PASSWORD` no do CMS. Depois, em dois terminais:

```bash
pnpm dev:cms
```

```bash
cd apps/site && set -a && . ./.env && set +a && pnpm build && node server.cjs
```

Painel em `http://localhost:3001/admin`, site em `http://localhost:3000`.

## Trazer o conteúdo da v2

```bash
pnpm import:v2
```

Sem variáveis, grava o texto padrão da v2. Para trazer o que estava no site antigo:

```bash
V2_CONTENT=caminho/content.json V2_LEADS=caminho/leads.json pnpm import:v2
```

`V2_CONTENT` aceita o `data/content.json` do servidor antigo ou um backup copiado do portal antigo. Fotos e logo em
base64 viram imagens no CMS; os pedidos antigos viram cotações com situação "novo" (rodar duas vezes não duplica).
Para importar em produção, rode o mesmo comando no seu computador com `DATABASE_URI` e as variáveis `S3_*` de produção.

## Deploy no Railway (3 serviços)

1. **postgres**: o Postgres do Railway.
2. **cms**: este repositório, com o arquivo de configuração `apps/cms/railway.json` (usa `apps/cms/Dockerfile`).
3. **site**: este repositório, com `apps/site/railway.json` (usa `apps/site/Dockerfile`).

Os dois Dockerfiles usam a raiz do repositório como contexto. Na primeira partida o CMS cria as tabelas
(migrações em `apps/cms/src/migrations`) e o usuário administrador.

### Variáveis

| Variável | cms | site | Para quê |
|---|---|---|---|
| `DATABASE_URI` | sim | | endereço do Postgres |
| `PAYLOAD_SECRET` | sim | | segredo do Payload (texto longo e aleatório) |
| `CMS_URL` | sim | sim | endereço público do CMS, sem barra no fim |
| `SITE_URL` | sim | sim | endereço público do site, sem barra no fim |
| `REVALIDATE_SECRET` | sim | sim | o CMS avisa o site de que o conteúdo mudou |
| `PREVIEW_SECRET` | sim | sim | prévia ao vivo (token e leitura de rascunhos) |
| `QUOTE_PROXY_SECRET` | sim | sim | só o site consegue registrar cotações no CMS |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | sim | | primeiro administrador; depois de criado, podem ser removidas |
| `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL` | sim | | imagens num bucket; sem elas, as imagens somem a cada deploy |
| `QUOTE_NOTIFY_TO`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | opcional | | e-mail a cada cotação nova |
| `QUOTE_WEBHOOK_URL` | opcional | | aviso de cotação para n8n ou WhatsApp |

No serviço `site`, `CMS_URL` e `SITE_URL` também podem ser passados como argumentos de build, para o HTML inicial
já sair com o conteúdo real; sem isso, o servidor busca o conteúdo ao subir.

### Depois do deploy

- Entrar em `CMS_URL/admin` com o administrador e trocar a senha.
- Rodar a importação da v2 (acima).
- Salvar a página inicial no painel e conferir que o site muda em segundos.
- Enviar uma cotação pelo site e conferir que aparece em "Pedidos de cotação".

## Como as partes conversam

| De | Para | O quê |
|---|---|---|
| site (servidor) | cms | lê `globals/home`, `globals/site-settings`, posts publicados, categorias e redirecionamentos |
| cms | site | `POST /api/revalidate` com `x-revalidate-secret`, a cada mudança publicada |
| navegador | site | `POST /api/quote`; o servidor limita a 5 envios por IP a cada 10 minutos e repassa ao CMS |
| painel | site | prévia ao vivo em `/preview`, com token de 2 horas assinado pelo CMS |

Rotas do site: `/`, `/blog`, `/blog/pagina/N`, `/blog/categoria/:slug`, `/blog/:slug`, `/blog/feed.xml`, `/sitemap.xml`,
`/robots.txt`. Se o CMS estiver fora do ar, o site segue com a última leitura boa (guardada em `apps/site/data/site.json`).

## Depois de mudar campos no CMS

```bash
pnpm types
```

```bash
pnpm --filter cms payload migrate:create nome-da-mudanca
```

O primeiro atualiza `packages/types`; o segundo cria a migração que o deploy aplica.
