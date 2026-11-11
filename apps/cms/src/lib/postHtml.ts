// Texto rico (Lexical) → HTML, com o conversor oficial. O site recebe o HTML pronto e não precisa de biblioteca.
// O conversor escapa todo texto; aqui só se trocam imagem e link pelos formatos que o site usa.
import { convertLexicalToHTML, LinkHTMLConverter, type HTMLConvertersFunction } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

const esc = (s: unknown): string => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
interface Size { url?: string | null; width?: number | null; height?: number | null }
interface MediaDoc { url?: string | null; alt?: string | null; width?: number | null; height?: number | null; sizes?: Record<string, Size | undefined> }

const converters: HTMLConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  // links para outros posts viram endereço do próprio site
  ...LinkHTMLConverter({
    internalDocToHref: ({ linkNode }) => {
      const doc = linkNode.fields.doc
      const slug = doc && typeof doc.value === 'object' ? (doc.value as { slug?: string }).slug : ''
      return doc?.relationTo === 'posts' && slug ? `/blog/${slug}` : '/blog'
    },
  }),
  // imagem: os tamanhos gerados pelo CMS em srcset, carregada só quando chega perto da tela
  upload: ({ node }) => {
    const m = node.value as MediaDoc | number | string
    if (!m || typeof m !== 'object' || !m.url) return ''
    const sizes = ['thumb', 'card', 'hero'].map((k) => m.sizes?.[k]).filter((s): s is Size => !!s?.url && !!s.width)
    const best = sizes[sizes.length - 1]
    const srcset = sizes.map((s) => `${esc(s.url)} ${s.width}w`).join(', ')
    return `<figure><img src="${esc(best?.url || m.url)}"${srcset ? ` srcset="${srcset}" sizes="(max-width: 760px) 100vw, 720px"` : ''} alt="${esc(m.alt)}" width="${best?.width || m.width || ''}" height="${best?.height || m.height || ''}" loading="lazy" decoding="async"></figure>`
  },
})

export function postHtml(content: unknown): string {
  if (!content || typeof content !== 'object') return ''
  try { return convertLexicalToHTML({ data: content as SerializedEditorState, converters, disableContainer: true }) }
  catch { return '' }
}

/** Tempo de leitura em minutos, a 200 palavras por minuto. */
export function readingMinutes(html: string): number {
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
