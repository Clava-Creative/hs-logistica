// Backup e restauração do conteúdo. O formato é o próprio objeto de conteúdo em JSON, igual ao da versão antiga.
import { S, merge, save } from '../content/store';
import { DEFAULT } from '../content/default';
import { esc } from '../sections/html';
import { resetMapLogo } from '../sections/map2d';
import { render } from '../app';
import { toast } from '../ui';
import { drawer, closeUI } from './drawer';

export function backupDrawer(): void {
  drawer(`<h2>Backup</h2><p>Copie o texto abaixo para guardar todo o conteúdo do site. Para restaurar, cole um backup e clique em Restaurar.</p>
    <label for="bk">Conteúdo do site<textarea id="bk" class="code">${esc(JSON.stringify(S.C, null, 1))}</textarea></label>
    <div class="modal-actions"><button class="btn btn-primary btn-sm" data-act="copyBk">Copiar backup</button><button class="btn btn-line btn-sm" data-act="restoreBk">Restaurar backup</button><button class="btn btn-line btn-sm" data-act="askReset">Voltar ao conteúdo original</button></div><p class="msg" id="bk-out" role="status"></p>`);
}

export async function copyBk(): Promise<void> {
  const t = document.getElementById('bk') as HTMLTextAreaElement;
  try { await navigator.clipboard.writeText(t.value); toast('Backup copiado'); } catch { t.select(); }
}

function replaceContent(saved: unknown): void {
  S.C = merge(DEFAULT, saved); resetMapLogo(); save(toast); closeUI(); render();
}

export function restoreBk(): void {
  try { replaceContent(JSON.parse((document.getElementById('bk') as HTMLTextAreaElement).value)); }
  catch {
    const o = document.getElementById('bk-out') as HTMLElement;
    o.className = 'msg bad'; o.textContent = 'Este texto não é um backup válido. Cole o backup inteiro, sem cortar.';
  }
}

/** Pede um segundo clique antes de apagar tudo. */
export function askReset(b: HTMLElement): void {
  if (b.dataset.sure) replaceContent({});
  else { b.dataset.sure = '1'; b.textContent = 'Clique de novo para confirmar'; }
}
