// Prévia ao vivo: a página inicial é redesenhada enquanto o cliente digita no painel do CMS.
// Só é baixado na rota /preview, que o servidor só entrega com um token assinado pelo CMS.
import { ready, subscribe } from '@payloadcms/live-preview';
import type { Home, SiteSetting } from '@hs/types';
import { S } from './content/store';
import { fromCms } from './content/fromCms';
import { render, setEditing } from './app';

export interface PreviewState { token: string; kind: string; home: Home | null; settings: SiteSetting | null }

/** As leituras da prévia passam pelo servidor do site, que confere o token e fala com o CMS. */
export const previewRequest = (token: string) => ({ endpoint, data }: { endpoint: string; data: unknown }): Promise<Response> =>
  fetch('/api/preview-data?token=' + encodeURIComponent(token), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint, data }) });

export function startHomePreview(p: PreviewState): void {
  const serverURL = S.C.cmsUrl;
  let home = p.home, settings = p.settings;
  setEditing(true);                       // página parada: sem Lenis, sem pins, cena pausada
  subscribe<Record<string, unknown>>({
    serverURL, depth: 1, initialData: (home || {}) as Record<string, unknown>, requestHandler: previewRequest(p.token),
    callback: (doc) => {
      if (doc.globalType === 'site-settings') settings = doc as unknown as SiteSetting;
      else if (doc.globalType === 'home') home = doc as unknown as Home;
      else return;
      S.C = fromCms(home, settings, S.C.latest, serverURL);
      render();
    },
  });
  ready({ serverURL });
}
