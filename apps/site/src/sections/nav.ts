import { T, esc, logoSrc, LOCK, type Ctx } from './html';

export const nav = ({ c }: Ctx): string => `
<header class="nav-bar"><div class="wrap nav">
  <a class="logo" href="#inicio"><img src="${logoSrc(c)}" alt="HS" width="77" height="44"><span>${T('brand.name')}<small>${T('brand.tag')}</small></span></a>
  <nav aria-label="Seções"><a href="#servicos">Serviços</a><a href="#localizacao">Localização</a><a href="#empresa">Empresa</a><a href="#duvidas">Dúvidas</a></nav>
  <button class="portal-link" data-act="portal" aria-label="Portal do cliente">${LOCK}Portal</button>
  <a class="btn btn-primary btn-sm" href="#contato">${esc(c.hero.cta1)}</a>
</div></header>`;
