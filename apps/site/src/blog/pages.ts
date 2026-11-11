// Páginas do blog em HTML, montadas no servidor. São páginas de leitura: sem cena 3D e sem scroll guiado.
import type { Content, Post, PostCard, Cat } from '../content/model'
import { esc, picture, fmtDate, ARROW, type Ctx } from '../sections/html'
import { nav } from '../sections/nav'
import { footer } from '../sections/footer'
import { postCard } from '../sections/blog'

export const PER_PAGE = 9
const shell = (c: Content, inner: string): string => { const x: Ctx = { c }; return `${nav(x, '/')}\n<main class="blog">${inner}</main>\n${footer(x)}` }

export const listPath = (category: string | undefined, page: number): string =>
  `/blog${category ? '/categoria/' + category : ''}${page > 1 ? '/pagina/' + page : ''}`

export function blogList(c: Content, o: { cards: PostCard[]; page: number; pages: number; categories: Cat[]; category?: Cat }): string {
  const slug = o.category?.slug
  const chip = (label: string, href: string, on: boolean): string => `<a href="${href}"${on ? ' aria-current="page"' : ''}>${esc(label)}</a>`
  return shell(c, `
<div class="wrap">
  <header class="blog-head">
    <h1>${o.category ? esc(o.category.title) : 'Blog da HS Logística'}</h1>
    <p class="lead">${o.category ? `Posts da categoria ${esc(o.category.title)}.` : 'Logística, armazenagem e fronteira, por quem opera em Foz do Iguaçu.'}</p>
    ${o.categories.length ? `<nav class="chips" aria-label="Categorias">${chip('Todos', '/blog', !slug)}${o.categories.map((k) => chip(k.title, '/blog/categoria/' + esc(k.slug), k.slug === slug)).join('')}</nav>` : ''}
  </header>
  ${o.cards.length ? `<div class="post-grid">${o.cards.map((p) => postCard(p, 'h2')).join('')}</div>` : '<p class="empty">Ainda não há posts publicados aqui.</p>'}
  ${o.pages > 1 ? `<nav class="pager" aria-label="Páginas">
    ${o.page > 1 ? `<a class="btn btn-line btn-sm" rel="prev" href="${listPath(slug, o.page - 1)}">Posts mais novos</a>` : '<span></span>'}
    <span>Página ${o.page} de ${o.pages}</span>
    ${o.page < o.pages ? `<a class="btn btn-line btn-sm" rel="next" href="${listPath(slug, o.page + 1)}">Posts mais antigos</a>` : '<span></span>'}
  </nav>` : ''}
</div>`)
}

export function blogPost(c: Content, p: Post, related: PostCard[], siteUrl: string): string {
  const url = encodeURIComponent((siteUrl || '') + '/blog/' + p.slug), text = encodeURIComponent(p.title)
  return shell(c, `
<article class="post">
  <header class="post-head wrap">
    <nav class="crumbs" aria-label="Você está em"><a href="/">Início</a><span aria-hidden="true">/</span><a href="/blog">Blog</a></nav>
    <h1>${esc(p.title)}</h1>
    ${p.excerpt ? `<p class="lead">${esc(p.excerpt)}</p>` : ''}
    <p class="post-meta">
      <time datetime="${esc(p.date)}">${esc(fmtDate(p.date))}</time><span>${p.minutes} min de leitura</span>${p.author ? `<span>Por ${esc(p.author)}</span>` : ''}
      ${p.categories.map((k) => `<a href="/blog/categoria/${esc(k.slug)}">${esc(k.title)}</a>`).join('')}
    </p>
  </header>
  ${p.cover ? `<div class="post-cover wrap">${picture(p.cover, '(max-width: 823px) 100vw, 775px', '', false)}</div>` : ''}
  <div class="prose">${p.html}</div>
  <footer class="post-foot">
    <div class="share"><span>Compartilhar</span>
      <a href="https://wa.me/?text=${text}%20${url}" target="_blank" rel="noopener">WhatsApp</a>
      <a href="https://www.linkedin.com/sharing/share-offsite/?url=${url}" target="_blank" rel="noopener">LinkedIn</a>
    </div>
    <div class="post-cta surface">
      <h2>${esc(c.contact.title)}</h2><p>${esc(c.contact.sub)}</p>
      <a class="btn btn-primary" href="/#contato">${esc(c.hero.cta1)}${ARROW}</a>
    </div>
  </footer>
</article>
${related.length ? `<section class="related"><div class="wrap"><h2>Posts relacionados</h2><div class="post-grid">${related.map((r) => postCard(r)).join('')}</div></div></section>` : ''}`)
}

/** Página simples de aviso (endereço que não existe), na mesma casca do blog. */
export const notice = (c: Content, title: string, text: string): string => shell(c, `
<div class="wrap"><header class="blog-head"><h1>${esc(title)}</h1><p class="lead">${esc(text)}</p>
<p><a class="btn btn-primary" href="/">Ir para a página inicial</a> <a class="btn btn-line" href="/blog">Ver o blog</a></p></header></div>`)
