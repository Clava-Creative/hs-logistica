// Entrada no portal e troca de senha.
import { S, LS, api } from '../content/store';
import { esc } from '../sections/html';
import { ui, closeUI, drawer } from './drawer';

const DEMO = 'hs2013';   // só vale sem servidor, quando tudo fica neste navegador

export function loginModal(err = ''): void {
  closeUI();
  ui().insertAdjacentHTML('beforeend', `<div class="scrim"><form class="modal" id="login">
    <h2>Portal do cliente</h2>
    <p>Entre para alterar textos, fotos, serviços, contatos e cores do site e ver os pedidos de cotação.</p>
    <label for="l-pass">Senha<input id="l-pass" name="password" type="password" required autocomplete="current-password">${err ? `<span class="err">${esc(err)}</span>` : ''}</label>
    <div class="modal-actions"><button class="btn btn-primary" type="submit">Entrar no portal</button><button class="btn btn-line" type="button" data-act="close">Cancelar</button></div>
    ${S.mode === 'local' ? `<p>Modo demonstração: as alterações ficam salvas só neste navegador. Senha inicial: <b>${DEMO}</b></p>` : ''}
  </form></div>`);
  (document.getElementById('l-pass') as HTMLElement).focus();
}

export async function doLogin(p: string, onOk: () => Promise<void>): Promise<void> {
  try {
    if (S.mode === 'server') {
      S.token = (await api<{ token: string }>('login', { method: 'POST', body: JSON.stringify({ password: p }) })).token;
      try { sessionStorage.setItem('hs_tok', S.token); } catch { /* sem sessionStorage */ }
    } else if (p !== (LS.get<string>('hs_pass') || DEMO)) throw new Error('Senha incorreta.');
    closeUI(); await onOk();
  } catch (e) { loginModal((e as Error).message); }
}

export function passDrawer(): void {
  drawer(`<h2>Senha do portal</h2><form id="pass" class="stack">
    <label for="p-old">Senha atual<input id="p-old" name="old" type="password" required autocomplete="current-password"></label>
    <label for="p-new">Nova senha (mínimo 8 caracteres)<input id="p-new" name="neu" type="password" required minlength="8" autocomplete="new-password"></label>
    <button class="btn btn-primary btn-sm" type="submit">Trocar senha</button><p class="msg" id="p-out" role="status"></p></form>`);
}

export async function changePass(d: Record<string, string>): Promise<void> {
  const o = document.getElementById('p-out') as HTMLElement;
  try {
    if (d.neu.length < 8) throw new Error('A nova senha precisa de pelo menos 8 caracteres.');
    if (S.mode === 'server') await api('password', { method: 'POST', body: JSON.stringify({ old: d.old, neu: d.neu }) });
    else { if (d.old !== (LS.get<string>('hs_pass') || DEMO)) throw new Error('A senha atual não confere.'); LS.set('hs_pass', d.neu); }
    o.className = 'msg ok'; o.textContent = 'Senha alterada.';
  } catch (e) { o.className = 'msg bad'; o.textContent = (e as Error).message; }
}
