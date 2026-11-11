// Pedidos de cotação recebidos pelo formulário do site.
import { S, LS, api } from '../content/store';
import type { Lead } from '../content/default';
import { esc } from '../sections/html';
import { toast } from '../ui';
import { drawer, renderBar } from './drawer';

export async function loadLeads(): Promise<void> {
  try { S.leads = S.mode === 'server' ? (await api<{ leads: Lead[] }>('leads')).leads : (LS.get<Lead[]>('hs_leads') || []); }
  catch { S.leads = []; }
  renderBar();
}

export function leadsDrawer(): void {
  drawer(`<h2>Pedidos de cotação</h2>${S.leads.length ? S.leads.map((l) => `<div class="leadc">
      <button class="x" data-act="delLead" data-id="${esc(l.id)}" aria-label="Apagar pedido de ${esc(l.name)}">×</button>
      <b>${esc(l.name)}</b><span>${esc(l.contact)}</span><span>${esc(l.service || '')}</span><span>${esc(l.message || '')}</span>
      <time>${esc(new Date(l.at).toLocaleString('pt-BR'))}</time></div>`).join('') : '<p>Nenhum pedido ainda. Os pedidos enviados pelo formulário do site aparecem aqui.</p>'}`);
}

export async function delLead(b: HTMLElement): Promise<void> {
  const id = b.dataset.id as string;
  try {
    if (S.mode === 'server') await api('leads/' + encodeURIComponent(id), { method: 'DELETE' });
    else LS.set('hs_leads', (LS.get<Lead[]>('hs_leads') || []).filter((l) => String(l.id) !== id));
    await loadLeads(); leadsDrawer();
  } catch (e) { toast((e as Error).message); }
}
