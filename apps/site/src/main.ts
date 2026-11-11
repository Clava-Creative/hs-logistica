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
import './styles/scroll.css';
import { S, load } from './content/store';
import { render, onRender } from './app';
import { initForms } from './forms';
import { startMap } from './sections/map2d';
import { detect } from './three/quality';
import { reducedMotion } from './ui';
import { initScroll } from './scroll/timelines';

const admin = () => import('./admin/portal');

async function boot(): Promise<void> {
  await load();
  initForms();
  initScroll();
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

/** Sem WebGL: o pôster fica e o mapa 2D animado entra por cima dele, na mesma janela da abertura. */
function fallback2D(): void {
  const mountMap = (): void => {
    const panel = document.querySelector('.panel');
    if (!panel || panel.querySelector('.cover')) return;
    if (!document.getElementById('map')) panel.insertAdjacentHTML('beforeend', '<canvas id="map" aria-hidden="true"></canvas>');
    startMap();
  };
  onRender(mountMap); mountMap();
}

/** A cena 3D entra depois do primeiro paint e só se o aparelho der conta. */
function schedule3D(): void {
  const q = detect();
  if (!q.webgl) { if (!reducedMotion()) fallback2D(); return; }
  if (!q.allow) return;                               // economia de dados: fica só o pôster
  const go = (): void => { void import('./three').then((m) => m.mount(q)).catch(fallback2D); };   // falhou ao montar: fica o 2D
  if (q.tier === 'baixo') {
    // aparelho modesto: a cena só é baixada quando o visitante começa a usar a página
    const evs = ['pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll'] as const;
    const once = (): void => { evs.forEach((e) => removeEventListener(e, once)); go(); };
    evs.forEach((e) => addEventListener(e, once, { passive: true }));
  } else if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 2500 });
  else setTimeout(go, 1200);
}

void boot().then(schedule3D);
