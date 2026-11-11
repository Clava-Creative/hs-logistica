// Estado do site no navegador. O conteúdo já vem escrito no HTML e embutido pelo servidor: não há busca em tempo de uso.
import type { Content } from './model'
import { fallbackContent } from './fromCms'

declare global { interface Window { __HS__?: { content: Content; preview?: { token: string; kind: string } } } }

export const S = {
  C: fallbackContent(),
  /** true na prévia ao vivo do CMS: página parada, sem scroll guiado, e redesenhada a cada mudança no painel */
  editing: false,
}

export function load(): void {
  if (window.__HS__?.content) S.C = window.__HS__.content
}
