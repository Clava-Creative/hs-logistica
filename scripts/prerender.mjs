// Depois do build: monta dist/index.html com o conteúdo padrão já escrito no HTML
// e guarda dist/template.html para o servidor montar a página com o conteúdo salvo.
import { readFileSync, writeFileSync } from 'node:fs';
import { renderPage } from '../dist-server/ssr.js';

const template = readFileSync('dist/index.html', 'utf8');
if (!template.includes('<!--app-->')) throw new Error('dist/index.html sem o marcador <!--app-->');
writeFileSync('dist/template.html', template);
const { html } = renderPage(null);
writeFileSync('dist/index.html', template.replace('<!--app-->', html).replace('<!--state-->', '').replace('<!--head-->', ''));
console.log('prerender: dist/index.html com ' + html.length + ' caracteres de conteúdo');
