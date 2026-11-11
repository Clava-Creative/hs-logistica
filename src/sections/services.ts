import { T, X, ADD, esc, ARROW, type Ctx } from './html';

export const services = ({ c }: Ctx): string => `
<section id="servicos"><div class="wrap svc-layout">
  <div class="head">${T('services.title', 'h2')}${T('services.lead', 'p', 'lead')}</div>
  <div><div class="rows">${c.services.items.map((s, i) => `<div class="row">${X('services.items', i)}${T(`services.items.${i}.t`, 'h3')}${T(`services.items.${i}.d`, 'p')}<a class="go" href="#contato" data-svc="${i}" aria-label="Pedir cotação de ${esc(s.t)}">${ARROW}</a></div>`).join('')}</div>${ADD('services.items')}</div>
</div></section>`;
