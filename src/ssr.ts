// Entrada usada fora do navegador: o prerender do build e o server.cjs montam o HTML com ela.
import { DEFAULT, type Content } from './content/default';
import { merge } from './content/store';
import { renderApp } from './sections';

export function renderPage(saved: unknown): { html: string; content: Content } {
  const content = merge(DEFAULT, saved || {});
  return { html: renderApp(content, false), content };
}
export { DEFAULT };
