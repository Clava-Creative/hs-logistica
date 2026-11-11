import { esc, ARROW, type Ctx } from './html'

export const services = ({ c }: Ctx): string => `
<section id="servicos"><div class="wrap"><div class="col">
  <div class="head"><h2>${esc(c.services.title)}</h2><p class="lead">${esc(c.services.lead)}</p></div>
  <div class="rows">${c.services.items.map((s, i) => `<div class="row"><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p><a class="go" href="#contato" data-svc="${i}" aria-label="Pedir cotação de ${esc(s.t)}">${ARROW}</a></div>`).join('')}</div>
</div></div></section>`
