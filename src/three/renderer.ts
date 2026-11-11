// Renderer e laço de desenho sob demanda: só desenha quando algo mudou.
import { WebGLRenderer, PCFSoftShadowMap, SRGBColorSpace } from 'three';
import { BUDGET, type Tier } from './quality';

export function createRenderer(canvas: HTMLCanvasElement, tier: Tier): WebGLRenderer {
  const r = new WebGLRenderer({ canvas, antialias: tier === 'alto', powerPreference: 'high-performance', alpha: false, stencil: false });
  r.setPixelRatio(Math.min(devicePixelRatio || 1, BUDGET[tier].dpr));
  r.outputColorSpace = SRGBColorSpace;
  r.shadowMap.enabled = BUDGET[tier].shadows;
  r.shadowMap.type = PCFSoftShadowMap;
  return r;
}

/** `frame` devolve true enquanto ainda houver movimento; quando devolve false o laço para até o próximo invalidate(). */
export class Loop {
  /** Seções com animação contínua (fluxo na rota, pulso das pontes) mantêm o laço ligado. */
  live = false;
  private raf = 0;
  private last = 0;
  private paused = false;
  constructor(private frame: (dt: number, t: number) => boolean) {}

  invalidate(): void { if (!this.raf && !this.paused) this.raf = requestAnimationFrame(this.tick); }
  setPaused(v: boolean): void {
    this.paused = v;
    if (v) { cancelAnimationFrame(this.raf); this.raf = 0; } else { this.last = 0; this.invalidate(); }
  }
  get running(): boolean { return this.raf !== 0; }
  dispose(): void { this.setPaused(true); }

  private tick = (ms: number): void => {
    this.raf = 0;
    const dt = this.last ? Math.min(.25, (ms - this.last) / 1000) : 1 / 60;   // aparelho lento: passos maiores, sem perder o ritmo
    this.last = ms;
    const more = this.frame(dt, ms / 1000);
    if (more || this.live) this.invalidate(); else this.last = 0;
  };
}
