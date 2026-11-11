// Formulário de cotação e seta de serviço que já deixa o serviço escolhido.
import { S, LS, api } from './content/store';

type Hook = () => void;
const sent: Hook[] = [];
/** Avisado quando um pedido de cotação é gravado (o portal atualiza a lista, a cena solta um pallet). */
export const onQuoteSent = (fn: Hook): void => { sent.push(fn); };

const byId = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;

async function submitQuote(f: HTMLFormElement): Promise<void> {
  const d = Object.fromEntries(new FormData(f)) as Record<string, string>;
  const out = byId('q-out'), en = byId('e-name'), ec = byId('e-contact');
  en.textContent = d.name.trim() ? '' : 'Escreva seu nome ou o da empresa.';
  ec.textContent = d.contact.trim() ? '' : 'Escreva um telefone ou e-mail para retorno.';
  out.textContent = '';
  if (en.textContent || ec.textContent) { byId(en.textContent ? 'q-name' : 'q-contact').focus(); return; }
  try {
    if (S.mode === 'server') await api('leads', { method: 'POST', body: JSON.stringify(d) });
    else {
      const l = LS.get<unknown[]>('hs_leads') || [];
      l.unshift({ ...d, id: Date.now(), at: new Date().toISOString() });
      LS.set('hs_leads', l);
    }
    f.reset(); out.className = 'msg ok'; out.textContent = 'Pedido de cotação recebido. Entraremos em contato.';
    sent.forEach((fn) => fn());
  } catch {
    out.className = 'msg bad'; out.textContent = 'O pedido não foi enviado. Tente de novo ou ligue para nós.';
  }
}

export function initForms(): void {
  document.addEventListener('submit', (e) => {
    const f = e.target as HTMLFormElement;
    if (f.id !== 'quote') return;
    e.preventDefault(); void submitQuote(f);
  });
  document.addEventListener('click', (e) => {
    const svc = (e.target as HTMLElement).closest<HTMLElement>('[data-svc]');
    if (svc && !S.admin) { const s = document.getElementById('q-service') as HTMLSelectElement | null; if (s) s.selectedIndex = Number(svc.dataset.svc); }
  });
}
