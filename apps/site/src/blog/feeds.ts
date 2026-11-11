// RSS do blog e sitemap do site inteiro.
import type { Content, Post, Cat } from '../content/model'
import { esc } from '../sections/html'
import { PER_PAGE } from './pages'

const day = (iso: string): string => new Date(iso).toISOString().slice(0, 10)

export function feed(c: Content, posts: Post[], base: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>Blog da ${esc(c.brand.name)} ${esc(c.brand.tag)}</title>
<link>${esc(base)}/blog</link>
<description>Logística, armazenagem e fronteira, de Foz do Iguaçu.</description>
<language>pt-BR</language>
<atom:link href="${esc(base)}/blog/feed.xml" rel="self" type="application/rss+xml"/>
${posts.slice(0, 30).map((p) => `<item>
<title>${esc(p.title)}</title>
<link>${esc(base)}/blog/${esc(p.slug)}</link>
<guid isPermaLink="true">${esc(base)}/blog/${esc(p.slug)}</guid>
<pubDate>${new Date(p.date).toUTCString()}</pubDate>
<description>${esc(p.excerpt)}</description>
${p.categories.map((k) => `<category>${esc(k.title)}</category>`).join('')}
</item>`).join('\n')}
</channel></rss>`
}

export function sitemap(posts: Post[], categories: Cat[], base: string): string {
  const u = (path: string, mod?: string): string => `<url><loc>${esc(base + path)}</loc>${mod ? `<lastmod>${day(mod)}</lastmod>` : ''}</url>`
  const pages = Math.ceil(posts.length / PER_PAGE)
  const used = new Set(posts.flatMap((p) => p.categories.map((k) => k.slug)))
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[u('/'), u('/blog', posts[0]?.updated),
    ...Array.from({ length: Math.max(0, pages - 1) }, (_, i) => u(`/blog/pagina/${i + 2}`)),
    ...categories.filter((k) => used.has(k.slug)).map((k) => u('/blog/categoria/' + k.slug)),
    ...posts.map((p) => u('/blog/' + p.slug, p.updated))].join('\n')}
</urlset>`
}
