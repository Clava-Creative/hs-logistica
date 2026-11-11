// Monta a página inicial a partir do conteúdo. Roda igual no navegador (prévia ao vivo) e no servidor.
import type { Content } from '../content/model'
import type { Ctx } from './html'
import { nav } from './nav'
import { hero } from './hero'
import { services } from './services'
import { photos } from './photos'
import { where } from './where'
import { steps } from './steps'
import { about } from './about'
import { blog } from './blog'
import { faq } from './faq'
import { contact } from './contact'
import { footer } from './footer'

export function renderApp(c: Content): string {
  const x: Ctx = { c }
  return `${nav(x)}
<main>${hero(x)}${services(x)}${photos(x)}${where(x)}${steps(x)}${about(x)}${blog(x)}${faq(x)}${contact(x)}</main>
${footer(x)}`
}
