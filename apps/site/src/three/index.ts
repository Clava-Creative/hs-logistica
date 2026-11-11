// Entrada da cena 3D. Este arquivo (e o three inteiro) só é baixado depois do primeiro paint, por import().
import { S } from '../content/store';
import { onTheme, onEditing } from '../app';
import { onQuoteSent } from '../forms';
import { story, onStory } from '../scroll/story';
import { reducedMotion } from '../ui';
import { BUDGET, type Quality } from './quality';
import { createRenderer, Loop } from './renderer';
import { createScene, applyPalette } from './scene';
import { buildRoute, CITY_NAMES, CITY_T } from './route';
import { buildWarehouse } from './warehouse';
import { buildCargo } from './cargo';
import { buildTruck } from './truck';
import { createRig } from './cameraRig';
import { createLabels } from './labels';

/** Seções com animação contínua; nas outras a cena só desenha quando o scroll ou o mouse mudam algo. */
const LIVE = new Set(['inicio', 'localizacao', 'etapas', 'contato']);
const ORDER = ['inicio', 'servicos', 'localizacao', 'etapas', 'empresa', 'duvidas', 'contato'];

/** Devolve a vez ao navegador entre as etapas da montagem, para nenhuma delas virar uma tarefa longa. */
const breathe = (): Promise<void> => new Promise((r) => setTimeout(r));

export async function mount(q: Quality): Promise<() => void> {
  const budget = BUDGET[q.tier], still = reducedMotion();
  const canvas = document.createElement('canvas');
  canvas.className = 'scene'; canvas.setAttribute('aria-hidden', 'true');
  const renderer = createRenderer(canvas, q.tier);
  const { scene, camera, mats } = createScene(q.tier);
  await breathe();
  const route = buildRoute(mats, budget.flow);
  await breathe();
  const house = buildWarehouse(mats, budget.shadows);
  await breathe();
  const cargo = buildCargo(mats, budget);
  const truck = buildTruck(mats, budget.shadows);
  scene.add(route.group, house.group, cargo.group, truck.group);
  const rig = createRig(camera, route.curve, budget.parallax && !still);
  const labels = createLabels([...CITY_NAMES, 'Paraguai', 'Argentina']);
  const labelPoints = [...route.pins, ...route.borders];
  document.body.prepend(canvas, labels.el);

  const paint = (): void => { applyPalette(mats, scene, S.C.theme.ink, S.C.theme.accent); cargo.recolor(); };
  paint();

  let w = 0, h = 0, snap = true, time = 0;
  function resize(): void {
    w = innerWidth; h = innerHeight;
    renderer.setSize(w, h, false); rig.resize(w, h); snap = true; loop.invalidate();
  }

  function frame(dt: number, t: number): boolean {
    // a seção "Do blog" não tem enquadramento próprio: vale o mesmo plano parado da seção de dúvidas
    const sec = story.sec === 'blog' ? 'duvidas' : story.sec, p = story.p[sec] ?? 0, idx = ORDER.indexOf(sec);
    const live = LIVE.has(sec) && !still;
    if (live) time = t;
    rig.target(sec, p, story.svc);
    let moving = rig.update(dt, snap || still); snap = false;
    (scene.fog as { density: number }).density = rig.fog;

    // zonas do armazém: acende a do serviço ativo
    house.zones.forEach((z, i) => {
      const want = sec === 'servicos' && i === story.svc % 3 ? .5 : 0;
      z.opacity += (want - z.opacity) * (still ? 1 : Math.min(1, dt * 6)); z.visible = z.opacity > .01;
      if (Math.abs(want - z.opacity) > .01) moving = true;
    });

    // caminhão: pela rodovia até a seção de etapas, depois no trajeto da doca
    const stepP = story.p.etapas ?? 0;
    if (idx < ORDER.indexOf('etapas')) truck.place(route.curve, story.p.localizacao ?? 0);
    else truck.place(truck.dockPath, truck.dockT(stepP));
    cargo.update(stepP);
    if (cargo.tick(dt)) moving = true;

    if (live) route.updateFlow(time);
    mats.branch.emissiveIntensity = sec === 'contato' && !still ? .5 + .9 * (.5 + .5 * Math.sin(t * 2.6)) : .5;

    renderer.render(scene, camera);
    labels.update(labelPoints, camera, (i) => i >= CITY_T.length ? sec === 'contato' || sec === 'inicio' : sec === 'localizacao' || sec === 'inicio', w, h);
    return moving;
  }
  const loop = new Loop(frame);

  let lastSec = story.sec, fadeT = 0;
  const offStory = onStory(() => {
    loop.live = LIVE.has(story.sec) && !still && !S.editing;
    if (still && story.sec !== lastSec) {            // movimento reduzido: um quadro parado por seção, trocado com fade
      lastSec = story.sec; canvas.classList.add('is-fading'); clearTimeout(fadeT);
      fadeT = window.setTimeout(() => { snap = true; loop.invalidate(); canvas.classList.remove('is-fading'); }, 260);
      return;
    }
    lastSec = story.sec; loop.invalidate();
  });

  const onMove = (e: PointerEvent): void => { rig.pointer(e.clientX / w * 2 - 1, e.clientY / h * 2 - 1); if (story.sec === 'inicio') loop.invalidate(); };
  if (budget.parallax && !still) addEventListener('pointermove', onMove, { passive: true });
  const onVis = (): void => loop.setPaused(document.hidden || S.editing);
  document.addEventListener('visibilitychange', onVis);
  addEventListener('resize', resize);
  onTheme(() => { paint(); loop.invalidate(); });
  onEditing((on) => { loop.live = false; loop.setPaused(on || document.hidden); if (!on) loop.invalidate(); });
  onQuoteSent(() => { if (!still) { cargo.launch(); loop.invalidate(); } });
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); loop.setPaused(true); document.documentElement.classList.remove('has-3d'); canvas.classList.remove('is-ready'); });
  canvas.addEventListener('webglcontextrestored', () => { document.documentElement.classList.add('has-3d'); canvas.classList.add('is-ready'); loop.setPaused(false); });

  // os shaders compilam em paralelo quando o navegador permite, em vez de travar no primeiro quadro
  renderer.setSize(innerWidth, innerHeight, false);
  await breathe();
  try { await renderer.compileAsync(scene, camera); } catch { /* compila no primeiro quadro */ }
  resize();
  loop.live = LIVE.has(story.sec) && !still && !S.editing;
  loop.setPaused(S.editing || document.hidden);
  // primeiro quadro desenhado: troca o pôster pela cena com crossfade
  requestAnimationFrame(() => { document.documentElement.classList.add('has-3d'); canvas.classList.add('is-ready'); });

  return (): void => {
    loop.dispose(); offStory(); clearTimeout(fadeT);
    removeEventListener('pointermove', onMove); removeEventListener('resize', resize); document.removeEventListener('visibilitychange', onVis);
    scene.traverse((o) => { const m = o as { geometry?: { dispose(): void } }; m.geometry?.dispose(); });
    Object.values(mats).forEach((m) => m.dispose()); house.zones.forEach((z) => z.dispose());
    renderer.dispose(); canvas.remove(); labels.el.remove();
    document.documentElement.classList.remove('has-3d');
  };
}
