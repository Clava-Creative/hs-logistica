// Metadados do <head> de cada página: título, descrição, canonical, Open Graph/Twitter e JSON-LD.
import type { Content, Img, Post } from './content/model'
import { esc, safeUrl } from './sections/html'

export interface Head { title: string; tags: string }
const ld = (o: unknown): string => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`
const abs = (base: string, path: string): string => (base ? base + path : path)
const ogImage = (m: Img | null | undefined, base: string): string => safeUrl(m?.sizes.og?.url || m?.url) || abs(base, '/og.jpg')

function common(o: { title: string; description: string; path: string; image: string; type: string }, base: string): string {
  return [
    `<meta name="description" content="${esc(o.description)}">`,
    base ? `<link rel="canonical" href="${esc(base + o.path)}">` : '',
    `<meta property="og:type" content="${o.type}">`, `<meta property="og:locale" content="pt_BR">`,
    `<meta property="og:site_name" content="HS Logística e Armazenagem">`,
    `<meta property="og:title" content="${esc(o.title)}">`, `<meta property="og:description" content="${esc(o.description)}">`,
    base ? `<meta property="og:url" content="${esc(base + o.path)}">` : '',
    `<meta property="og:image" content="${esc(o.image)}">`,
    `<meta name="twitter:card" content="summary_large_image">`, `<meta name="twitter:title" content="${esc(o.title)}">`,
    `<meta name="twitter:description" content="${esc(o.description)}">`, `<meta name="twitter:image" content="${esc(o.image)}">`,
    `<link rel="alternate" type="application/rss+xml" title="Blog da HS Logística" href="${esc(abs(base, '/blog/feed.xml'))}">`,
  ].filter(Boolean).join('\n')
}
const fact = (c: Content, key: string): string => c.about.facts.find((f) => f.k.toLowerCase() === key)?.v ?? ''

/** `base` é o endereço público do site (SITE_URL), sem barra no fim. */
export function homeHead(c: Content, base: string): Head {
  const phone = c.contact.phone.replace(/\D/g, '')
  const biz: Record<string, unknown> = {
    '@context': 'https://schema.org', '@type': 'LocalBusiness',
    name: fact(c, 'razão social') || `${c.brand.name} ${c.brand.tag}`, description: c.seo.description,
    address: { '@type': 'PostalAddress', streetAddress: c.contact.address, addressLocality: 'Foz do Iguaçu', addressRegion: 'PR', addressCountry: 'BR' },
    areaServed: ['Foz do Iguaçu', 'Paraguai', 'Argentina'],
  }
  if (phone) biz.telephone = '+55' + phone
  if (c.contact.email) biz.email = c.contact.email
  if (fact(c, 'cnpj')) biz.taxID = fact(c, 'cnpj')
  if (c.contact.hours) biz.openingHours = c.contact.hours
  if (base) { biz.url = base + '/'; biz.image = ogImage(c.seo.image, base); biz.logo = safeUrl(c.brand.logo?.url) || base + '/logo.png' }
  return { title: c.seo.title, tags: common({ title: c.seo.title, description: c.seo.description, path: '/', image: ogImage(c.seo.image, base), type: 'website' }, base) + '\n' + ld(biz) }
}

export function listHead(c: Content, base: string, o: { path: string; category?: string; page: number; prev?: string; next?: string }): Head {
  const title = `${o.category ? o.category + ' | ' : ''}Blog${o.page > 1 ? `, página ${o.page}` : ''} | ${c.brand.name}`
  const description = o.category ? `Posts sobre ${o.category} no blog da ${c.brand.name} ${c.brand.tag}.` : `Logística, armazenagem e fronteira: o blog da ${c.brand.name} ${c.brand.tag}, de Foz do Iguaçu.`
  const crumbs = [{ name: 'Início', item: abs(base, '/') }, { name: 'Blog', item: abs(base, '/blog') }]
  if (o.category) crumbs.push({ name: o.category, item: abs(base, o.path) })
  return {
    title,
    tags: [common({ title, description, path: o.path, image: ogImage(c.seo.image, base), type: 'website' }, base),
      o.prev ? `<link rel="prev" href="${esc(abs(base, o.prev))}">` : '', o.next ? `<link rel="next" href="${esc(abs(base, o.next))}">` : '',
      ld(breadcrumb(crumbs))].filter(Boolean).join('\n'),
  }
}

const breadcrumb = (list: { name: string; item: string }[]): unknown => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: list.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.name, item: x.item })),
})

export function postHead(c: Content, p: Post, base: string): Head {
  const path = '/blog/' + p.slug, image = ogImage(p.seo.image, base), title = `${p.seo.title} | ${c.brand.name}`
  const article = {
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.seo.description, image: [image],
    datePublished: p.date, dateModified: p.updated, mainEntityOfPage: abs(base, path),
    author: p.author ? { '@type': 'Person', name: p.author } : { '@type': 'Organization', name: `${c.brand.name} ${c.brand.tag}` },
    publisher: { '@type': 'Organization', name: `${c.brand.name} ${c.brand.tag}`, logo: { '@type': 'ImageObject', url: safeUrl(c.brand.logo?.url) || abs(base, '/logo.png') } },
  }
  return {
    title,
    tags: [common({ title: p.seo.title, description: p.seo.description, path, image, type: 'article' }, base),
      `<meta property="article:published_time" content="${esc(p.date)}">`, `<meta property="article:modified_time" content="${esc(p.updated)}">`,
      ld(article), ld(breadcrumb([{ name: 'Início', item: abs(base, '/') }, { name: 'Blog', item: abs(base, '/blog') }, { name: p.title, item: abs(base, path) }]))].join('\n'),
  }
}
