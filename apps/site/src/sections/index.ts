// Monta a página inteira a partir do conteúdo. Roda igual no navegador e no servidor (prerender).
import type { Content } from '../content/default';
import { setCtx, type Ctx } from './html';
import { nav } from './nav';
import { hero } from './hero';
import { services } from './services';
import { photos } from './photos';
import { where } from './where';
import { steps } from './steps';
import { about } from './about';
import { faq } from './faq';
import { contact } from './contact';
import { footer } from './footer';

export function renderApp(c: Content, admin = false): string {
  const x: Ctx = { c, admin };
  setCtx(x);
  return `${nav(x)}
<main>${hero(x)}${services(x)}${photos(x)}${where(x)}${steps(x)}${about(x)}${faq(x)}${contact(x)}</main>
${footer(x)}`;
}
