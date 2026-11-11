import { T, X, ADD, type Ctx } from './html';

export const steps = ({ c }: Ctx): string => `
<section id="etapas"><div class="wrap">
  <div class="head">${T('steps.title', 'h2')}</div>
  <ol class="steps">${c.steps.items.map((_, i) => `<li class="step">${X('steps.items', i)}${T(`steps.items.${i}.t`, 'h3')}${T(`steps.items.${i}.d`, 'p')}</li>`).join('')}</ol>
  ${ADD('steps.items')}
</div></section>`;
