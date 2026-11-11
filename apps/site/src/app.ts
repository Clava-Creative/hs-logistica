// Renderização da página no navegador e ganchos para o que depende do DOM montado.
import { S } from './content/store';
import { renderApp } from './sections';

type Hook = () => void;
const after: Hook[] = [], before: Hook[] = [], themed: Hook[] = [];
/** Roda depois de cada montagem do DOM (mapa, scroll, campos editáveis). */
export const onRender = (fn: Hook): void => { after.push(fn); };
/** Roda antes de o DOM ser trocado (desfazer pins e gatilhos de scroll). */
export const onBeforeRender = (fn: Hook): void => { before.push(fn); };
export const onTheme = (fn: Hook): void => { themed.push(fn); };

export function applyTheme(): void {
  const s = document.documentElement.style, t = S.C.theme;
  s.setProperty('--accent', t.accent); s.setProperty('--ink', t.ink); s.setProperty('--paper', t.paper);
  document.body.classList.toggle('admin', S.admin);
  themed.forEach((f) => f());
}

/** Troca o DOM pelo conteúdo atual. `fresh=false` aproveita o HTML que já veio pronto do servidor. */
export function render(fresh = true): void {
  if (fresh) {
    before.forEach((f) => f());
    (document.getElementById('app') as HTMLElement).innerHTML = renderApp(S.C, S.admin);
  }
  applyTheme();
  after.forEach((f) => f());
}

const adminHooks: Array<(on: boolean) => void> = [];
/** Avisado quando o portal entra ou sai do modo edição (o scroll guiado e a cena pausam). */
export const onAdmin = (fn: (on: boolean) => void): void => { adminHooks.push(fn); };
export function setAdmin(on: boolean): void {
  S.admin = on;
  adminHooks.forEach((f) => f(on));
  render();
}
