// Entrada do portal do cliente. Este pedaço só é baixado quando alguém abre o portal.
import '../styles/admin.css';
import { S, api } from '../content/store';
import type { Lead } from '../content/default';
import { onRender, setAdmin } from '../app';
import { onQuoteSent } from '../forms';
import { toast } from '../ui';
import { closeUI, renderBar } from './drawer';
import { loginModal, doLogin, passDrawer, changePass } from './login';
import { loadLeads, leadsDrawer, delLead } from './leads';
import { backupDrawer, copyBk, restoreBk, askReset } from './backup';
import { lookDrawer, resetTheme, initThemeInputs } from './theme';
import { makeEditable, initEditing, pick, unpick } from './editable';

type Act = (b: HTMLElement) => void | Promise<void>;
const ACT: Record<string, Act> = {
  close: closeUI, pick, unpick, look: lookDrawer, resetTheme, leads: leadsDrawer, delLead,
  backup: backupDrawer, copyBk, restoreBk, askReset, pass: passDrawer,
  logout() {
    S.token = null; try { sessionStorage.removeItem('hs_tok'); } catch { /* sem sessionStorage */ }
    closeUI(); setAdmin(false); toast('Você saiu do portal');
  },
};

let ready = false;
function init(): void {
  if (ready) return; ready = true;
  initEditing(); initThemeInputs();
  onRender(makeEditable); onRender(renderBar);
  onQuoteSent(() => { if (S.admin) void loadLeads(); });
  document.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'portal') { if (S.admin) toast('Você já está no portal'); return; }
    void ACT[b.dataset.act as string]?.(b);
  });
  document.addEventListener('submit', (e) => {
    const f = e.target as HTMLFormElement;
    if (f.id !== 'login' && f.id !== 'pass') return;
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f)) as Record<string, string>;
    if (f.id === 'login') void doLogin(d.password, enter); else void changePass(d);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeUI(); });
}

async function enter(): Promise<void> {
  await loadLeads(); setAdmin(true); toast('Você entrou no portal');
}

export function openPortal(): void { init(); loginModal(); }

/** Retoma a sessão guardada nesta aba, se o servidor ainda aceitar o token. */
export async function resume(): Promise<boolean> {
  init();
  S.token = sessionStorage.getItem('hs_tok');
  try { S.leads = (await api<{ leads: Lead[] }>('leads')).leads; setAdmin(true); return true; }
  catch { S.token = null; return false; }
}
