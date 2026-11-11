import { esc, type Ctx } from './html'

export const faq = ({ c }: Ctx): string => `
<section id="duvidas" class="veil-full"><div class="wrap">
  <div class="head"><h2>${esc(c.faq.title)}</h2></div>
  <div class="faq">${c.faq.items.map((f) => `<details class="qa"><summary><h3>${esc(f.q)}</h3></summary><p>${esc(f.a)}</p></details>`).join('')}</div>
</div></section>`
