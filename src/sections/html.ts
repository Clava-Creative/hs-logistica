// Peças comuns às seções. Todo texto que vem do conteúdo passa por esc().
import type { Content } from '../content/default';

export interface Ctx { c: Content; admin: boolean }
let cur: Ctx;
export const setCtx = (x: Ctx): void => { cur = x; };

export const esc = (s: unknown): string =>
  String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] as string));

const at = (p: string): unknown => p.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], cur.c);

/** Texto editável no portal: o caminho em data-p diz qual campo do conteúdo ele altera. */
export const T = (p: string, tag = 'span', cls = '', ph = 'Clique para escrever'): string =>
  `<${tag}${cls ? ` class="${cls}"` : ''} data-p="${p}" data-ph="${ph}">${esc(at(p))}</${tag}>`;
export const X = (list: string, i: number): string =>
  `<button class="x" data-del="${list}" data-i="${i}" aria-label="Remover item">×</button>`;
export const ADD = (list: string): string => `<button class="add" data-add="${list}">+ Adicionar item</button>`;

/** Só aceita imagem embutida (data URL) nos formatos que o portal grava. */
export const img = (s: unknown): string =>
  typeof s === 'string' && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(s) ? s : '';
export const logoSrc = (c: Content): string => img(c.brand.logo) || 'logo.png';
export const wa = (n: string): string => 'https://wa.me/' + n.replace(/\D/g, '').replace(/^(?!55)/, '55');

export const tools = (path: string, has: string): string => cur.admin
  ? `<div class="photo-tools"><button class="tool" data-act="pick" data-path="${path}">${has ? 'Trocar foto' : 'Enviar foto'}</button>${has ? `<button class="tool" data-act="unpick" data-path="${path}">Remover</button>` : ''}</div>`
  : '';

const svg = (d: string): string =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
export const ARROW = svg('<path d="M5 12h14M13 6l6 6-6 6"/>');
export const LOCK = svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>');
