import { T, X, ADD, type Ctx } from './html';

export const about = ({ c }: Ctx): string => `
<section id="empresa" class="veil-full"><div class="wrap about">
  <div class="txt">${T('about.title', 'h2')}${T('about.text', 'p', 'lead')}</div>
  <div><div class="facts">${c.about.facts.map((_, i) => `<div>${X('about.facts', i)}${T(`about.facts.${i}.k`, 'span', 'k')}${T(`about.facts.${i}.v`)}</div>`).join('')}</div>${ADD('about.facts')}</div>
</div></section>`;
