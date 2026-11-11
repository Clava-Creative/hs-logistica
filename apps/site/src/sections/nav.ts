import { esc, logoSrc, type Ctx } from './html'

/** `home` é o prefixo das âncoras: vazio na página inicial, "/" nas páginas do blog. */
export const nav = ({ c }: Ctx, home = ''): string => `
<header class="nav-bar"><div class="wrap nav">
  <a class="logo" href="${home || '#inicio'}"><img src="${esc(logoSrc(c))}" alt="HS" width="77" height="44"><span>${esc(c.brand.name)}<small>${esc(c.brand.tag)}</small></span></a>
  <nav aria-label="Seções"><a href="${home}#servicos">Serviços</a><a href="${home}#localizacao">Localização</a><a href="${home}#empresa">Empresa</a><a href="/blog">Blog</a><a href="${home}#duvidas">Dúvidas</a></nav>
  <a class="btn btn-primary btn-sm" href="${home}#contato">${esc(c.hero.cta1)}</a>
</div></header>`
