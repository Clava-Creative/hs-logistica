// Edição direto na página: textos (data-p), itens de lista, fotos e logo.
import { S, get, set, save } from '../content/store';
import { resetMapLogo } from '../sections/map2d';
import { render } from '../app';
import { toast } from '../ui';
import { lookDrawer } from './theme';

const NEW: Record<string, object> = {
  'services.items': { t: 'Novo serviço', d: 'Descreva o serviço.' },
  'where.items': { t: 'Novo destino', d: 'Descreva a rota.' },
  'steps.items': { t: 'Nova etapa', d: 'Descreva a etapa.' },
  'about.facts': { k: 'Dado', v: 'Valor' },
  'faq.items': { q: 'Nova pergunta?', a: 'Resposta.' },
};
const field = (t: EventTarget | null): HTMLElement | null => (t as HTMLElement | null)?.closest?.('[data-p]') ?? null;

/** Liga a edição nos textos do DOM atual. Chamado depois de cada montagem, com o portal aberto. */
export function makeEditable(): void {
  if (!S.admin) return;
  document.querySelectorAll<HTMLElement>('#app [data-p]').forEach((el) => {
    el.setAttribute('contenteditable', 'plaintext-only');
    if (el.contentEditable !== 'plaintext-only') el.setAttribute('contenteditable', 'true');
  });
}

let pickPath: string | null = null;
export function pick(b: HTMLElement): void { pickPath = b.dataset.path as string; (document.getElementById('file') as HTMLInputElement).click(); }
export function unpick(b: HTMLElement): void {
  const p = b.dataset.path as string;
  set(p, ''); resetMapLogo(); save(toast); render(); if (p === 'brand.logo') lookDrawer();
}

/** A imagem é reduzida no navegador antes de salvar: 1600 px nas fotos, 480 px no logo. */
async function onFile(input: HTMLInputElement): Promise<void> {
  const f = input.files?.[0]; input.value = '';
  if (!f || !pickPath) return;
  try {
    const bmp = await createImageBitmap(f), isLogo = pickPath === 'brand.logo', max = isLogo ? 480 : 1600;
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height)), cv = document.createElement('canvas');
    cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k);
    (cv.getContext('2d') as CanvasRenderingContext2D).drawImage(bmp, 0, 0, cv.width, cv.height);
    set(pickPath, isLogo ? cv.toDataURL('image/png') : cv.toDataURL('image/jpeg', .82));
    resetMapLogo(); save(toast); render(); if (isLogo) lookDrawer();
  } catch { toast('Este arquivo não é uma imagem que o navegador consiga abrir.'); }
}

export function initEditing(): void {
  document.addEventListener('focusout', (e) => {
    const el = field(e.target); if (!el || !S.admin) return;
    const v = el.innerText.replace(/ /g, ' ').trim(), p = el.dataset.p as string;
    if (v !== get(p)) { set(p, v); el.textContent = v; save(toast); }
  });
  document.addEventListener('keydown', (e) => {
    const el = e.target as HTMLElement;
    if (S.admin && e.key === 'Enter' && !e.shiftKey && el.matches?.('[data-p]') && el.dataset.p !== 'about.text') { e.preventDefault(); el.blur(); }
  });
  // dentro de <summary>, a barra de espaço abriria/fecharia a pergunta em vez de escrever
  document.addEventListener('keyup', (e) => { if (S.admin && (e.target as HTMLElement).closest?.('summary [data-p]')) e.preventDefault(); });
  document.addEventListener('paste', (e) => {
    if (!field(e.target)) return;
    e.preventDefault(); document.execCommand('insertText', false, e.clipboardData?.getData('text/plain') ?? '');
  });
  document.addEventListener('click', (e) => {
    if (!S.admin) return;
    const t = e.target as HTMLElement;
    // com o portal aberto, links e perguntas não navegam: o clique serve para editar
    if (t.closest('#app') && (t.closest('a') || t.closest('summary')) && !t.closest('.x')) e.preventDefault();
    const del = t.closest<HTMLElement>('[data-del]'), add = t.closest<HTMLElement>('[data-add]');
    if (del) { e.preventDefault(); (get(del.dataset.del as string) as unknown[]).splice(Number(del.dataset.i), 1); save(toast); render(); }
    if (add) { const k = add.dataset.add as string; (get(k) as unknown[]).push({ ...NEW[k] }); save(toast); render(); }
  });
  const file = document.getElementById('file') as HTMLInputElement;
  file.addEventListener('change', () => void onFile(file));
}
