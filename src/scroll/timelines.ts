// Gatilhos de scroll por seção. São refeitos a cada montagem do DOM e desligados com o portal aberto.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { S } from '../content/store';
import { onRender, onBeforeRender } from '../app';
import { reducedMotion } from '../ui';
import { CITIES } from '../sections/where';
import { startLenis, stopLenis, scrollToEl } from './lenis';
import { buildProgress, onSection, SECTIONS } from './progress';
import { story, emitStory } from './story';

const EASE = 'expo.out';
const KM = 730;
/** Quantas telas de scroll cada seção presa ocupa. */
const PINNED: Record<string, number> = { servicos: 2.4, localizacao: 3.2, etapas: 3 };

function pickActive(list: NodeListOf<HTMLElement>, p: number): number {
  const i = Math.min(list.length - 1, Math.floor(p * list.length));
  list.forEach((el, k) => el.classList.toggle('is-active', k === i));
  return i;
}

/** O que muda no DOM conforme o avanço de cada seção. */
function apply(id: string, el: HTMLElement, p: number): void {
  if (id === 'servicos') story.svc = pickActive(el.querySelectorAll<HTMLElement>('.row'), p);
  if (id === 'etapas') story.step = pickActive(el.querySelectorAll<HTMLElement>('.step'), p);
  if (id === 'localizacao') {
    (el.querySelector('.km-fill') as HTMLElement).style.transform = `scaleX(${p})`;
    (el.querySelector('.km-count b') as HTMLElement).textContent = String(Math.round(p * KM));
    el.querySelectorAll<HTMLElement>('.km span').forEach((s, i) => s.classList.toggle('passed', p >= CITIES[i].at - .004));
  }
}

/** Uma seção: avanço 0..1 com scrub; presa na tela quando está na lista e cabe na altura da janela. */
function track(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  const len = PINNED[id];
  let pin = false;
  if (len) {
    el.classList.add('is-pinned');
    pin = el.scrollHeight <= innerHeight;
    if (!pin) el.classList.remove('is-pinned');
  }
  if (id === 'localizacao') (el.querySelector('.km-count') as HTMLElement).hidden = false;
  const proxy = { p: 0 };
  gsap.to(proxy, {
    p: 1, ease: 'none',
    scrollTrigger: pin
      ? { trigger: el, start: 'top top', end: `+=${len * 100}%`, pin: true, scrub: 1, anticipatePin: 1 }
      : { trigger: el, start: 'top 60%', end: 'bottom 40%', scrub: 1 },
    onUpdate() { story.p[id] = proxy.p; apply(id, el, proxy.p); emitStory(); },
  });
  apply(id, el, 0);
}

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
  document.querySelectorAll('.is-pinned').forEach((e) => e.classList.remove('is-pinned'));
}

function build(): void {
  teardown();
  story.p = {}; story.svc = 0; story.step = 0;
  if (S.admin) { stopLenis(); emitStory(); return; }   // editando: página parada, sem pins nem scroll suave
  startLenis();
  if (reducedMotion()) {
    // sem scrub nem pin: cada seção vale como um quadro parado, já no fim do seu movimento
    SECTIONS.forEach((s) => { story.p[s.id] = 1; });
    document.querySelectorAll<HTMLElement>('.km-fill').forEach((e) => { e.style.transform = 'scaleX(1)'; });
    document.querySelectorAll('.km span').forEach((e) => e.classList.add('passed'));
  } else {
    SECTIONS.forEach((s) => track(s.id));
    buildReveals();
  }
  buildProgress();
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  emitStory();
}

export function initScroll(): void {
  onBeforeRender(teardown);
  onRender(build);
  onSection((id) => { story.sec = id; emitStory(); });
  // âncoras passam pelo mesmo scroll, com desconto da barra do topo
  document.addEventListener('click', (e) => {
    if (S.admin) return;
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    const el = a && document.getElementById(a.getAttribute('href')!.slice(1));
    if (!a || !el) return;
    e.preventDefault(); scrollToEl(el, true);
    history.replaceState(null, '', a.getAttribute('href'));
  });
  void document.fonts?.ready.then(() => ScrollTrigger.refresh());
  let w = innerWidth;
  addEventListener('resize', () => { if (innerWidth !== w) { w = innerWidth; build(); } });
}
