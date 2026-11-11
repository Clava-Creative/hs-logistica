// Depois do build: monta dist/index.html com o conteúdo padrão já escrito no HTML
// e guarda dist/template.html para o servidor montar a página com o conteúdo salvo.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { renderPage } from '../dist-server/ssr.js';

let template = readFileSync('dist/index.html', 'utf8');
if (!template.includes('<!--app-->')) throw new Error('dist/index.html sem o marcador <!--app-->');
// a fonte do título é o maior texto da primeira tela: pede-se cedo, junto com o HTML
const font = readdirSync('dist/assets').find((f) => /^archivo-latin-wdth-normal-.*\.woff2$/.test(f));
if (font) template = template.replace('<!--head-->', `<link rel="preload" href="./assets/${font}" as="font" type="font/woff2" crossorigin>\n<!--head-->`);
// o CSS da página vai escrito no próprio HTML: a primeira tela pinta sem esperar outro arquivo
template = template.replace(/<link rel="stylesheet"[^>]*href="\.\/assets\/(index-[^"]+\.css)"[^>]*>/, (_, f) =>
  '<style>' + readFileSync('dist/assets/' + f, 'utf8').replace(/url\((["']?)\.\//g, 'url($1./assets/') + '</style>');
writeFileSync('dist/template.html', template);
const { html, head } = renderPage(null, process.env.SITE_URL || '');
writeFileSync('dist/index.html', template.replace('<!--app-->', () => html).replace('<!--state-->', '').replace('<!--head-->', () => head));
console.log('prerender: dist/index.html com ' + html.length + ' caracteres de conteúdo');
