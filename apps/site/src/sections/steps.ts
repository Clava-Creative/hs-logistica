import { esc, type Ctx } from './html'

export const steps = ({ c }: Ctx): string => `
<section id="etapas"><div class="wrap">
  <div class="head"><h2>${esc(c.steps.title)}</h2></div>
  <ol class="steps">${c.steps.items.map((s) => `<li class="step"><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join('')}</ol>
</div></section>`
