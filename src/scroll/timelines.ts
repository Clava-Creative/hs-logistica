// Gatilhos de scroll por seção. São refeitos a cada montagem do DOM e desligados com o portal aberto.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { S } from '../content/store';
import { onRender, onBeforeRender } from '../app';
import { reducedMotion } from '../ui';
import { startLenis, stopLenis, scrollToEl } from './lenis';
import { buildProgress } from './progress';

const EASE = 'expo.out';

/** Entradas simples, uma vez só, de quem está abaixo da primeira tela. */
function buildReveals(): void {
  gsap.utils.toArray<HTMLElement>('main section h2').forEach((h) => {
    gsap.from(h, { clipPath: 'inset(0 0 100% 0)', y: 28, duration: 1, ease: EASE, scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
  });
  const facts = gsap.utils.toArray<HTMLElement>('.facts > div');
  if (facts.length) gsap.from(facts, { y: 18, opacity: 0, duration: .7, ease: EASE, stagger: .07, scrollTrigger: { trigger: '.facts', start: 'top 85%', once: true } });
}

function teardown(): void {
  ScrollTrigger.getAll().forEach((t) => t.kill());
  gsap.killTweensOf('main *');
  gsap.set('main section h2, .facts > div', { clearProps: 'all' });
}

function build(): void {
  teardown();
  if (S.admin) { stopLenis(); return; }       // editando: página parada, sem pins nem scroll suave
  startLenis();
  buildProgress();
  if (!reducedMotion()) buildReveals();
  ScrollTrigger.refresh();
}

export function initScroll(): void {
  onBeforeRender(teardown);
  onRender(build);
  // âncoras passam pelo mesmo scroll, com desconto da barra do topo
  document.addEventListener('click', (e) => {
    if (S.admin) return;
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    const el = a && document.getElementById(a.getAttribute('href')!.slice(1));
    if (!a || !el) return;
    e.preventDefault(); scrollToEl(el, true);
    history.replaceState(null, '', a.getAttribute('href'));
  });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
