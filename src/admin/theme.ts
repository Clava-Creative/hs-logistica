// Logo e cores da marca.
import { S, save } from '../content/store';
import { DEFAULT, type Content } from '../content/default';
import { esc, img, logoSrc } from '../sections/html';
import { applyTheme } from '../app';
import { toast } from '../ui';
import { drawer } from './drawer';

export function lookDrawer(): void {
  const t = S.C.theme;
  drawer(`<h2>Logo e cores</h2>
    <div class="logo-row"><img src="${logoSrc(S.C)}" alt="Logo atual">
      <button class="btn btn-line btn-sm" data-act="pick" data-path="brand.logo">Trocar logo</button>${img(S.C.brand.logo) ? '<button class="btn btn-line btn-sm" data-act="unpick" data-path="brand.logo">Voltar ao original</button>' : ''}</div>
    <p>As cores mudam no site inteiro assim que você escolhe.</p>
    <div class="swatches">
      <label for="t-accent">Verde de destaque<input id="t-accent" type="color" data-theme="accent" value="${esc(t.accent)}"></label>
      <label for="t-ink">Azul da marca<input id="t-ink" type="color" data-theme="ink" value="${esc(t.ink)}"></label>
      <label for="t-paper">Fundo<input id="t-paper" type="color" data-theme="paper" value="${esc(t.paper)}"></label>
    </div>
    <button class="btn btn-line btn-sm" data-act="resetTheme">Voltar às cores da marca</button>`);
}

export function resetTheme(): void { S.C.theme = { ...DEFAULT.theme }; applyTheme(); save(toast); lookDrawer(); }

export function initThemeInputs(): void {
  document.addEventListener('input', (e) => {
    const el = e.target as HTMLInputElement, k = el.dataset?.theme as keyof Content['theme'] | undefined;
    if (!k || !/^#[0-9a-f]{6}$/i.test(el.value)) return;
    S.C.theme[k] = el.value; applyTheme(); save(toast);
  });
}
