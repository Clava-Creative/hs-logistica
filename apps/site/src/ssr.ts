// Entrada usada fora do navegador: o prerender do build e o server.cjs montam as páginas com ela.
import type { Home, SiteSetting, Post as CmsPost, Category } from '@hs/types'
import type { Content, Post, Cat } from './content/model'
import { fromCms, fallbackContent, post as mapPost, card } from './content/fromCms'
import { renderApp } from './sections'
import { homeHead, listHead, postHead, type Head } from './seo'
import { blogList, blogPost, listPath, notice, PER_PAGE } from './blog/pages'
import { feed, sitemap } from './blog/feeds'

/** Tudo o que o site precisa do CMS, já convertido. Montado na partida do servidor e a cada revalidate. */
export interface Site { content: Content; posts: Post[]; categories: Cat[] }
export interface Page { html: string; head: Head }

export function buildSite(raw: { home: Home | null; settings: SiteSetting | null; posts: CmsPost[]; categories: Category[] }, cmsUrl: string): Site {
  const posts = raw.posts.map(mapPost).filter((p): p is Post => !!p).sort((a, b) => b.date.localeCompare(a.date))
  const categories = raw.categories.filter((k) => !!k.slug).map((k) => ({ title: k.title, slug: k.slug as string }))
  return { content: fromCms(raw.home, raw.settings, posts.slice(0, 3).map(card), cmsUrl), posts, categories }
}
export const emptySite = (cmsUrl = ''): Site => ({ content: fallbackContent(cmsUrl), posts: [], categories: [] })

export const home = (s: Site, base: string): Page => ({ html: renderApp(s.content), head: homeHead(s.content, base) })

/** Lista do blog (com ou sem categoria). Devolve null quando a página ou a categoria não existem. */
export function list(s: Site, base: string, o: { category?: string; page: number }): Page | null {
  const category = o.category ? s.categories.find((k) => k.slug === o.category) : undefined
  if (o.category && !category) return null
  const all = category ? s.posts.filter((p) => p.categories.some((k) => k.slug === category.slug)) : s.posts
  const pages = Math.max(1, Math.ceil(all.length / PER_PAGE))
  if (!Number.isInteger(o.page) || o.page < 1 || o.page > pages) return null
  const used = new Set(s.posts.flatMap((p) => p.categories.map((k) => k.slug)))
  return {
    html: blogList(s.content, { cards: all.slice((o.page - 1) * PER_PAGE, o.page * PER_PAGE).map(card), page: o.page, pages, categories: s.categories.filter((k) => used.has(k.slug)), category }),
    head: listHead(s.content, base, {
      path: listPath(category?.slug, o.page), category: category?.title, page: o.page,
      prev: o.page > 1 ? listPath(category?.slug, o.page - 1) : undefined, next: o.page < pages ? listPath(category?.slug, o.page + 1) : undefined,
    }),
  }
}

export function postPage(s: Site, base: string, p: Post): Page {
  const mine = new Set(p.categories.map((k) => k.slug))
  const related = s.posts.filter((x) => x.id !== p.id && x.categories.some((k) => mine.has(k.slug))).slice(0, 3).map(card)
  return { html: blogPost(s.content, p, related, base), head: postHead(s.content, p, base) }
}
export const findPost = (s: Site, slug: string): Post | undefined => s.posts.find((p) => p.slug === slug)

/** Prévia ao vivo: converte um post ainda em rascunho, sem a exigência de estar publicado. */
export const draftPost = (raw: CmsPost): Post | null => mapPost({ ...raw, _status: 'published', slug: raw.slug || 'rascunho' } as CmsPost)

export const rss = (s: Site, base: string): string => feed(s.content, s.posts, base)
export const map = (s: Site, base: string): string => sitemap(s.posts, s.categories, base)

export const notFound = (s: Site): Page => ({
  html: notice(s.content, 'Página não encontrada', 'O endereço que você abriu não existe ou mudou de lugar.'),
  head: { title: `Página não encontrada | ${s.content.brand.name}`, tags: '<meta name="robots" content="noindex">' },
})
