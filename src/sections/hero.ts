import { T, img, tools, ARROW, type Ctx } from './html';
import { poster } from './poster';

export const hero = ({ c }: Ctx): string => {
  const photo = img(c.hero.photo);
  return `
<div class="hero" id="inicio">
  <div class="hero-text">
    <h1>${T('hero.title')} ${T('hero.title2', 'span', 'hl')}</h1>
    ${T('hero.sub', 'p', 'sub')}
    <div class="cta"><a class="btn btn-primary" href="#contato">${T('hero.cta1')}${ARROW}</a><a class="btn btn-line" href="#servicos">${T('hero.cta2')}</a></div>
    <div class="fact">${c.hero.facts.map((_, i) => `<b>${T(`hero.facts.${i}`)}</b>`).join('')}</div>
  </div>
  <div class="panel">
    ${photo
      ? `<img class="cover" src="${photo}" alt="Operação da HS Logística em Foz do Iguaçu">`
      : poster(c)}
    ${tools('hero.photo', photo)}
  </div>
</div>`;
};
