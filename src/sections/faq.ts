import { T, X, ADD, type Ctx } from './html';

export const faq = ({ c, admin }: Ctx): string => `
<section id="duvidas" class="flush"><div class="wrap">
  <div class="head">${T('faq.title', 'h2')}</div>
  <div class="faq">${c.faq.items.map((_, i) => `<details class="qa"${admin ? ' open' : ''}>${X('faq.items', i)}<summary>${T(`faq.items.${i}.q`, 'h3')}</summary>${T(`faq.items.${i}.a`, 'p')}</details>`).join('')}</div>
  ${ADD('faq.items')}
</div></section>`;
