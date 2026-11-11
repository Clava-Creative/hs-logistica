// Estado e armazenamento: servidor (server.cjs) quando existe, senão este navegador.
import { DEFAULT, type Content, type Lead } from './default';

export const S = {
  C: structuredClone(DEFAULT) as Content,
  mode: 'local' as 'local' | 'server',
  admin: false,
  token: null as string | null,
  leads: [] as Lead[],
  /** true quando o HTML servido já foi montado com este mesmo conteúdo */
  prerendered: false,
};

export const LS = {
  get<T>(k: string): T | null { try { return JSON.parse(localStorage.getItem(k) as string) as T; } catch { return null; } },
  set(k: string, v: unknown): boolean { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
};

/** Sobrepõe o conteúdo salvo ao padrão, campo a campo; listas são trocadas inteiras. */
export function merge<T>(d: T, s: unknown): T {
  if (Array.isArray(d)) return (Array.isArray(s) ? s : d) as T;
  if (d && typeof d === 'object') {
    const o: Record<string, unknown> = {};
    for (const k in d) o[k] = merge((d as Record<string, unknown>)[k], s ? (s as Record<string, unknown>)[k] : undefined);
    return o as T;
  }
  return (s === undefined || s === null ? d : s) as T;
}

export async function api<T = Record<string, unknown>>(path: string, opt: RequestInit = {}): Promise<T> {
  const r = await fetch('api/' + path, {
    ...opt,
    headers: { 'Content-Type': 'application/json', ...(S.token ? { Authorization: 'Bearer ' + S.token } : {}) },
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j as { error?: string }).error || 'Erro ' + r.status);
  return j as T;
}

declare global { interface Window { __HS__?: { content: unknown } } }

export async function load(): Promise<void> {
  let saved: unknown = null;
  if (window.__HS__) {                       // conteúdo injetado pelo servidor junto com o HTML
    S.mode = 'server'; saved = window.__HS__.content; S.prerendered = true;
  } else {
    try { saved = (await api<{ content: unknown }>('content')).content; S.mode = 'server'; }
    catch { S.mode = 'local'; saved = LS.get('hs_content_v2'); }
    S.prerendered = !saved;
  }
  S.C = merge(DEFAULT, saved || {});
}

let saveT: ReturnType<typeof setTimeout>;
export function save(notify: (m: string) => void): void {
  clearTimeout(saveT);
  saveT = setTimeout(async () => {
    try {
      if (S.mode === 'server') await api('content', { method: 'PUT', body: JSON.stringify({ content: S.C }) });
      else if (!LS.set('hs_content_v2', S.C)) throw new Error('sem espaço neste navegador. Use fotos menores.');
      notify('Alterações salvas');
    } catch (e) { notify('Não foi possível salvar: ' + (e as Error).message); }
  }, 500);
}

export const get = (p: string): unknown => p.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], S.C);
export function set(p: string, v: unknown): void {
  const ks = p.split('.'), l = ks.pop() as string;
  (ks.reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], S.C) as Record<string, unknown>)[l] = v;
}
