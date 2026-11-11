// Peças comuns às seções. Todo texto que vem do conteúdo passa por esc().
import type { Content, Img } from '../content/model'

export interface Ctx { c: Content }

export const esc = (s: unknown): string =>
  String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] as string))

/** Só endereços http(s) ou do próprio site entram em src e href. */
export const safeUrl = (u: unknown): string => (typeof u === 'string' && /^(https?:\/\/|\/(?!\/))/.test(u) ? u : '')

export const logoSrc = (c: Content): string => safeUrl(c.brand.logo?.url) || '/logo.png'
export const wa = (n: string): string => 'https://wa.me/' + n.replace(/\D/g, '').replace(/^(?!55)/, '55')

/** <img> com os tamanhos gerados pelo CMS em srcset. `sizes` diz quanto da tela a imagem ocupa. */
export function picture(m: Img, sizes: string, cls = '', lazy = true): string {
  const list = (['thumb', 'card', 'hero'] as const).map((k) => m.sizes[k]).filter((s) => !!s && !!safeUrl(s.url))
  const best = list[list.length - 1]
  const srcset = list.map((s) => `${esc(s!.url)} ${s!.width}w`).join(', ')
  return `<img${cls ? ` class="${cls}"` : ''} src="${esc(safeUrl(best?.url || m.url))}"${srcset ? ` srcset="${srcset}" sizes="${sizes}"` : ''} alt="${esc(m.alt)}" width="${best?.width || m.width}" height="${best?.height || m.height}"${lazy ? ' loading="lazy" decoding="async"' : ''}>`
}

export const fmtDate = (iso: string): string => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' })
}

const svg = (d: string): string =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`
export const ARROW = svg('<path d="M5 12h14M13 6l6 6-6 6"/>')
