// Leitura do CMS e preenchimento das cascas de página. Usado pelo servidor e pelo prerender do build.
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/** JSON para dentro de <script>: nada no conteúdo consegue fechar a tag. */
const inline = (v) => JSON.stringify(v).replace(/</g, '\\u003c').replace(/[\u2028\u2029]/g, (c) => '\\u' + c.charCodeAt(0).toString(16));

async function get(cmsUrl, path, headers = {}) {
  const r = await fetch(cmsUrl + '/api/' + path, { headers, signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.json();
}

/** Busca globals, posts publicados e categorias, e converte tudo para o formato do site. */
async function loadSite(ssr, cmsUrl) {
  const [home, settings, posts, categories, redirects] = await Promise.all([
    get(cmsUrl, 'globals/home?depth=1'),
    get(cmsUrl, 'globals/site-settings?depth=1'),
    get(cmsUrl, 'posts?depth=1&limit=1000&sort=-publishedAt&where[_status][equals]=published'),
    get(cmsUrl, 'categories?depth=0&limit=200&sort=title'),
    get(cmsUrl, 'redirects?depth=1&limit=500').catch(() => ({ docs: [] })),
  ]);
  const site = ssr.buildSite({ home, settings, posts: posts.docs, categories: categories.docs }, cmsUrl);
  site.redirects = redirects.docs.map((r) => ({
    from: String(r.from || '').replace(/\/$/, '') || '/',
    to: r.to?.type === 'reference' && r.to.reference?.value?.slug ? '/blog/' + r.to.reference.value.slug : String(r.to?.url || ''),
  })).filter((r) => r.from.startsWith('/') && /^(\/(?!\/)|https?:\/\/)/.test(r.to));
  return site;
}

/** Preenche uma casca com o HTML da página, o <head> e o estado que o JavaScript do navegador lê. */
function fill(template, page, state) {
  return template
    .replace(/<title>[^<]*<\/title>/, () => `<title>${esc(page.head.title)}</title>`)
    .replace('<!--head-->', () => page.head.tags)
    .replace('<!--app-->', () => page.html)
    .replace('<!--state-->', () => (state ? `<script>window.__HS__=${inline(state)}</script>` : ''));
}

module.exports = { loadSite, fill, get, esc };
