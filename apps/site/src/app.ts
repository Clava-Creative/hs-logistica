// Renderização da página no navegador e ganchos para o que depende do DOM montado.
import { S } from './content/store';
import { renderApp } from './sections';

type Hook = () => void;
const after: Hook[] = [], before: Hook[] = [], themed: Hook[] = [];
/** Roda depois de cada montagem do DOM (mapa, scroll). */
export const onRender = (fn: Hook): void => { after.push(fn); };
/** Roda antes de o DOM ser trocado (desfazer pins e gatilhos de scroll). */
export const onBeforeRender = (fn: Hook): void => { before.push(fn); };
export const onTheme = (fn: Hook): void => { themed.push(fn); };

export function applyTheme(): void {
  const s = document.documentElement.style, t = S.C.theme;
  s.setProperty('--accent', t.accent); s.setProperty('--ink', t.ink); s.setProperty('--paper', t.paper);
  document.body.classList.toggle('editing', S.editing);
  themed.forEach((f) => f());
}

/** Troca o DOM pelo conteúdo atual. `fresh=false` aproveita o HTML que já veio pronto do servidor. */
export function render(fresh = true): void {
  if (fresh) {
    before.forEach((f) => f());
    (document.getElementById('app') as HTMLElement).innerHTML = renderApp(S.C);
  }
  applyTheme();
  after.forEach((f) => f());
}

const editHooks: Array<(on: boolean) => void> = [];
/** Avisado quando a prévia ao vivo do CMS liga: o scroll guiado e a cena pausam, como no antigo modo edição. */
export const onEditing = (fn: (on: boolean) => void): void => { editHooks.push(fn); };
export function setEditing(on: boolean): void {
  S.editing = on;
  editHooks.forEach((f) => f(on));
  render();
}
