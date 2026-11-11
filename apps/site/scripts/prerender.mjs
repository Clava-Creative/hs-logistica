// Depois do build: prepara as duas cascas de página (inicial e blog) que o servidor preenche,
// e grava dist/index.html com o conteúdo do CMS no momento do build (ou o padrão, se o CMS não responder).
import { readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { loadSite, fill } = require('../lib/pages.cjs');
const ssr = await import('../dist-server/ssr.js');

const assets = readdirSync('dist/assets');
const font = assets.find((f) => /^archivo-latin-wdth-normal-.*\.woff2$/.test(f));

function shell(file) {
  let t = readFileSync('dist/' + file, 'utf8');
  if (!t.includes('<!--app-->')) throw new Error(`dist/${file} sem o marcador <!--app-->`);
  // a fonte do título é o maior texto da primeira tela: pede-se cedo, junto com o HTML
  if (font) t = t.replace('<!--head-->', `<link rel="preload" href="/assets/${font}" as="font" type="font/woff2" crossorigin>\n<!--head-->`);
  // o CSS de cada página vai escrito no próprio HTML: a primeira tela pinta sem esperar outro arquivo
  t = t.replace(/<link rel="stylesheet"[^>]*href="\/assets\/([^"]+\.css)"[^>]*>/g, (_, f) =>
    '<style>' + readFileSync('dist/assets/' + f, 'utf8').replace(/url\((["']?)\.\//g, 'url($1/assets/') + '</style>');
  return t;
}
writeFileSync('dist/template.html', shell('index.html'));
writeFileSync('dist/template-blog.html', shell('blog.html'));
rmSync('dist/blog.html');

const cmsUrl = (process.env.CMS_URL || '').replace(/\/$/, ''), base = (process.env.SITE_URL || '').replace(/\/$/, '');
let site = ssr.emptySite(cmsUrl);
try { if (cmsUrl) site = await loadSite(ssr, cmsUrl); else console.warn('prerender: CMS_URL não definido; usando o conteúdo padrão'); }
catch (e) { console.warn('prerender: CMS não respondeu (' + e.message + '); usando o conteúdo padrão'); }
const page = ssr.home(site, base);
writeFileSync('dist/index.html', fill(readFileSync('dist/template.html', 'utf8'), page, { content: site.content }));
console.log(`prerender: dist/index.html com ${page.html.length} caracteres de conteúdo e ${site.posts.length} posts`);
