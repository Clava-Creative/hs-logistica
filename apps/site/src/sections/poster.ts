// Pôster estático da abertura: a mesma vista aérea da fronteira que a primeira câmera da cena 3D mostra.
// É SVG escrito direto no HTML, então aparece antes de qualquer JavaScript e some quando a cena fica pronta.
import { logoSrc } from './html';
import type { Content } from '../content/default';

const city = (x: number, y: number, name: string, dx: number, dy: number): string =>
  `<circle cx="${x}" cy="${y}" r="5" fill="#fff"/><text x="${x + dx}" y="${y + dy}" font-size="14" font-weight="500" style="fill:var(--fg)">${name}</text>`;

export const poster = (c: Content): string => `
<svg class="poster" viewBox="0 0 552 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
  <g fill="none" stroke-linecap="round">
    <path d="M210 -20C150 180 222 330 172 468S138 560 128 620" stroke="rgba(140,190,235,.26)" stroke-width="19"/>
    <path d="M572 372C442 468 320 408 172 468" stroke="rgba(140,190,235,.26)" stroke-width="13"/>
    <path d="M88 282L182 291L287 300L397 216M259 516L276 420L287 300" stroke="rgba(255,255,255,.5)" stroke-width="1.5" stroke-dasharray="5 7"/>
    <path d="M574 120L397 216" style="stroke:var(--accent)" stroke-width="3.5"/>
  </g>
  <g font-weight="800" font-size="32" fill="rgba(255,255,255,.12)" style="font-family:var(--display)">
    <text x="22" y="96">PARAGUAI</text><text x="331" y="60">BRASIL</text><text x="287" y="570">ARGENTINA</text>
  </g>
  ${city(287, 300, 'Foz do Iguaçu', 12, 22)}${city(88, 282, 'Ciudad del Este', -10, -16)}${city(259, 516, 'Puerto Iguazú', 14, 5)}
  <text x="530" y="94" text-anchor="end" font-size="14" font-weight="500" style="fill:var(--accent)">BR-277 para Paranaguá</text>
  <circle cx="397" cy="216" r="58" fill="none" style="stroke:var(--accent)" stroke-width="2" opacity=".55"/>
  <rect x="342" y="182" width="110" height="68" rx="10" fill="#fff"/>
  <image href="${logoSrc(c)}" x="354" y="192" width="86" height="49" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
