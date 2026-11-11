// Barra do modo edição, painel lateral e janela do portal.
import { S } from '../content/store';

export const ui = (): HTMLElement => document.getElementById('ui') as HTMLElement;
export function closeUI(): void { ui().querySelector('.scrim,.drawer')?.remove(); }

export function drawer(html: string): void {
  closeUI();
  ui().insertAdjacentHTML('beforeend', `<aside class="drawer surface" aria-label="Portal"><button class="closex" data-act="close" aria-label="Fechar">×</button>${html}</aside>`);
  ui().querySelector<HTMLElement>('.drawer button, .drawer input')?.focus();
}

export function renderBar(): void {
  document.querySelector('.bar')?.remove();
  if (!S.admin) return;
  ui().insertAdjacentHTML('beforeend', `<div class="bar">
    <span class="tip"><span class="dot"></span>Modo edição: clique em qualquer texto ou foto do site para alterar.</span>
    <button data-act="look">Logo e cores</button>
    <button data-act="leads">Pedidos<span class="badge">${S.leads.length}</span></button>
    <button data-act="backup">Backup</button>
    <button data-act="pass">Senha</button>
    <button data-act="logout">Sair</button></div>`);
}
