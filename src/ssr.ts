// Entrada usada fora do navegador: o prerender do build e o server.cjs montam o HTML com ela.
import { DEFAULT, type Content } from './content/default';
import { merge } from './content/store';
import { renderApp } from './sections';
import { headTags } from './seo';

export function renderPage(saved: unknown, siteUrl = ''): { html: string; head: string; content: Content } {
  const content = merge(DEFAULT, saved || {});
  return { html: renderApp(content, false), head: headTags(content, siteUrl), content };
}
export { DEFAULT };
