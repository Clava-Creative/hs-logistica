// Ordem de partida: conteúdo → DOM → scroll → 3D (só depois do primeiro paint).
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/ibm-plex-sans/latin-400.css';
import '@fontsource/ibm-plex-sans/latin-500.css';
import '@fontsource/ibm-plex-sans/latin-600.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/sections/nav.css';
import './styles/sections/hero.css';
import './styles/sections/services.css';
import './styles/sections/photos.css';
import './styles/sections/where.css';
import './styles/sections/steps.css';
import './styles/sections/about.css';
import './styles/sections/faq.css';
import './styles/sections/contact.css';
import './styles/sections/footer.css';
import { S, load } from './content/store';
import { render, onRender } from './app';
import { initForms } from './forms';
import { startMap } from './sections/map2d';

const admin = () => import('./admin/portal');

async function boot(): Promise<void> {
  await load();
  onRender(startMap);
  initForms();
  // O portal é um pedaço separado: só baixa quando alguém clica em "Portal" ou já tem sessão aberta.
  document.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('[data-act="portal"]');
    if (b && !S.admin) void admin().then((m) => m.openPortal());
  });
  let resumed = false;
  try {
    if (S.mode === 'server' && sessionStorage.getItem('hs_tok')) resumed = await (await admin()).resume();
  } catch { /* sem sessão */ }
  if (!resumed) render(!S.prerendered);
  setTimeout(() => document.body.classList.add('entered'), 1600);
  if (location.hash === '#portal' && !S.admin) void admin().then((m) => m.openPortal());
}
void boot();
