# Site HS Logística e Armazenagem (v2)

Landing em Vite + TypeScript, com scroll guiado (GSAP ScrollTrigger + Lenis) e uma cena 3D (Three.js)
que conta a viagem da carga pela BR-277 até o armazém. Tem portal para o cliente editar o conteúdo.

## Rodar

```bash
npm install
```

```bash
npm run build
```

```bash
ADMIN_PASSWORD="escolha-uma-senha" SITE_URL="https://www.seudominio.com.br" node server.cjs
```

Abra `http://localhost:3000`. O portal fica no botão **Portal** ou em `/#portal`.

- Sem `ADMIN_PASSWORD`, uma senha é gerada e mostrada no terminal na primeira execução.
- `SITE_URL` é opcional: com ele, os metadados de compartilhamento e o JSON-LD levam o endereço completo.
- Os dados ficam em `data/` (conteúdo, pedidos de cotação e senha criptografada). Faça cópia dessa pasta.
- Em produção, publique atrás de HTTPS.

Para desenvolver: `node server.cjs` num terminal e `npm run dev` em outro (o Vite repassa `/api` para a porta 3000).

## Como está organizado

| Pasta | O que tem |
|---|---|
| `src/content` | modelo de conteúdo (`default.ts`) e armazenamento: API ou, sem servidor, este navegador (`store.ts`) |
| `src/sections` | uma função por seção, que devolve o HTML; `map2d.ts` é o mapa usado quando não há WebGL |
| `src/admin` | portal do cliente; só é baixado quando alguém abre o portal |
| `src/scroll` | Lenis, progresso e indicador de seções, gatilhos por seção e o estado da "história" |
| `src/three` | cena 3D; só é baixada depois do primeiro paint e se o aparelho der conta (`quality.ts`) |
| `src/ssr.ts`, `scripts/prerender.mjs` | montam o HTML com o texto já escrito, no build e a cada pedido ao servidor |
| `legacy/index.html` | a versão anterior, em arquivo único |

O contrato da API (`/api/content`, `/api/leads`, `/api/leads/:id`, `/api/login`, `/api/password`) e o formato
do backup são os mesmos da versão em arquivo único.

## Sem o servidor

`dist/` também funciona em hospedagem estática. Nesse caso o portal entra em modo demonstração:
as alterações ficam só no navegador de quem editou e a senha é `hs2013`.
