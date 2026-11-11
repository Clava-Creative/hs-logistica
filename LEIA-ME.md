# Site HS Logística & Armazenagem

- `index.html`: o site inteiro (home + portal do cliente).
- `server.js`: servidor que guarda as alterações do portal e os pedidos de cotação. Não precisa instalar nada além do Node.js.

## Colocar no ar

```bash
ADMIN_PASSWORD="escolha-uma-senha" node server.js
```

Abra `http://localhost:3000`. O portal fica no botão **Portal** ou em `/#portal`.
Sem `ADMIN_PASSWORD`, uma senha é gerada e mostrada no terminal na primeira execução.
Os dados ficam na pasta `data/` (conteúdo, pedidos e senha criptografada). Faça cópia dela.
Em produção, publique atrás de HTTPS (Render, Railway, VPS com Nginx/Caddy etc.).

## Só para ver

Abrir `index.html` direto no navegador funciona em modo demonstração: as alterações ficam só naquele navegador e a senha é `hs2013`.
