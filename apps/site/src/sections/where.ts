import { T, X, ADD, type Ctx } from './html';

// Posição de cada cidade ao longo da BR-277, em fração do percurso Paranaguá → Foz.
export const CITIES = [
  { name: 'Paranaguá', at: 0 }, { name: 'Curitiba', at: 0.13 }, { name: 'Guarapuava', at: 0.47 },
  { name: 'Cascavel', at: 0.8 }, { name: 'Foz do Iguaçu', at: 1 },
];

export const where = ({ c }: Ctx): string => `
<section class="where" id="localizacao"><div class="wrap">
  <div class="head col">${T('where.title', 'h2')}${T('where.lead', 'p', 'lead')}</div>
  <div class="routes">${c.where.items.map((_, i) => `<div class="route">${X('where.items', i)}${T(`where.items.${i}.t`, 'h3')}${T(`where.items.${i}.d`, 'p')}</div>`).join('')}</div>
  ${ADD('where.items')}
  <div class="km" aria-hidden="true"><div class="km-fill"></div>${CITIES.map((x, i) => `<span class="${i === 0 ? '' : i === CITIES.length - 1 ? 'end' : 'mid'}" style="left:${x.at * 100}%">${x.name}${i === CITIES.length - 1 ? ' · HS' : ''}</span>`).join('')}<i style="left:0">km 0</i><i style="right:0">km 730</i><div class="km-count" hidden><small>km</small><b>0</b></div></div>
</div></section>`;
