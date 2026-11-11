// Instância única do Lenis, no mesmo relógio do GSAP para o ScrollTrigger enxergar cada quadro.
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reducedMotion } from '../ui';

gsap.registerPlugin(ScrollTrigger);
let lenis: Lenis | null = null;
const tick = (t: number): void => { lenis?.raf(t * 1000); };

export function startLenis(): void {
  if (lenis || reducedMotion()) return;
  lenis = new Lenis({ autoRaf: false, anchors: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
}
export function stopLenis(): void {
  if (!lenis) return;
  gsap.ticker.remove(tick); lenis.destroy(); lenis = null;
}

const headerOffset = (): number => (document.querySelector<HTMLElement>('.nav-bar')?.offsetHeight ?? 0) + 8;

/** Rola até um elemento descontando a barra do topo. Sem Lenis (movimento reduzido ou portal), usa o scroll nativo. */
export function scrollToEl(el: HTMLElement, focus = false): void {
  const done = (): void => { if (focus) { el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); } };
  if (lenis) lenis.scrollTo(el, { offset: -headerOffset(), duration: 1.2, onComplete: done });
  else {
    scrollTo({ top: el.getBoundingClientRect().top + scrollY - headerOffset(), behavior: reducedMotion() ? 'auto' : 'smooth' });
    done();
  }
}
