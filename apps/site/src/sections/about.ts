import { esc, type Ctx } from './html'

export const about = ({ c }: Ctx): string => `
<section id="empresa" class="veil-full"><div class="wrap about">
  <div class="txt"><h2>${esc(c.about.title)}</h2><p class="lead">${esc(c.about.text)}</p></div>
  <div class="facts">${c.about.facts.map((f) => `<div><span class="k">${esc(f.k)}</span><span>${esc(f.v)}</span></div>`).join('')}</div>
</div></section>`
