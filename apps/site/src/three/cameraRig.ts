// Câmera dirigida pelo scroll: cada seção define um enquadramento {pos, look, fov} em função do avanço dentro dela.
// A câmera real persegue esse alvo com amortecimento, então a passagem entre seções nunca dá salto.
import { Vector3, type PerspectiveCamera, type Curve } from 'three';
import { SITE } from './warehouse';

interface Shot { pos: Vector3; look: Vector3; fov: number; fog: number; shift: number; drop: number }
const v = (x: number, y: number, z: number): Vector3 => new Vector3(x, y, z);
const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));
const ease = (t: number): number => t * t * (3 - 2 * t);
const mixN = (a: number, b: number, k: number): number => a + (b - a) * k;

const HERO_A = v(34, 78, 58), HERO_B = v(28, 62, 50), HERO_LOOK = v(-12, 0, 6);
const ZONE_LOOK = [v(SITE.dock.x, 1, 0), v(SITE.shed.x, 1, SITE.shed.z), v(SITE.yard.x, 1, SITE.yard.z)];
const MAX_TILT = 3 * Math.PI / 180;     // parallax do mouse: no máximo ±3°

export function createRig(camera: PerspectiveCamera, curve: Curve<Vector3>, parallax: boolean) {
  const want: Shot = { pos: HERO_A.clone(), look: HERO_LOOK.clone(), fov: 36, fog: .0055, shift: .2, drop: 0 };
  const cur: Shot = { pos: HERO_A.clone(), look: HERO_LOOK.clone(), fov: 36, fog: .0055, shift: .2, drop: 0 };
  const c = new Vector3(), tan = new Vector3(), zoneLook = ZONE_LOOK[0].clone();
  let rate = 3.2, mx = 0, my = 0, tx = 0, ty = 0, tiltOn = false, vw = 0, vh = 0, appliedShift = NaN;

  /** Define o enquadramento desejado para a seção `sec` no avanço `p`. */
  function target(sec: string, p: number, svc: number): void {
    rate = 3.2; tiltOn = false; want.fog = .0055; want.fov = 38; want.shift = .2; want.drop = 0;
    switch (sec) {
      case 'servicos': {
        const k = ease(clamp01(p * 2.4));
        want.pos.lerpVectors(HERO_B, v(24, 19, 36), k); want.pos.x += (p - .5) * 12 * k;
        zoneLook.lerp(ZONE_LOOK[svc % 3], .5);                 // a mira desliza para a área do serviço ativo
        want.look.lerpVectors(HERO_LOOK, v(0, 2, -6), k).lerp(zoneLook, .45 * k);
        break;
      }
      case 'localizacao': {                                     // voo pela rodovia, logo atrás do caminhão
        curve.getPointAt(clamp01(p), c); curve.getTangentAt(clamp01(p), tan);
        want.pos.copy(c).addScaledVector(tan, -24).add(v(0, 13, 13));
        want.look.copy(c).addScaledVector(tan, 9);
        want.fov = 46; want.shift = 0; rate = 5.5;
        break;
      }
      case 'etapas':
        want.pos.lerpVectors(v(12, 12, 27), v(0, 14, 29), p); want.look.set(-5, 1.5, -2); want.fov = 35; want.shift = .22;
        break;
      case 'empresa':
        want.pos.lerpVectors(v(30, 40, 70), v(48, 58, 96), p); want.look.set(0, 0, 0); want.fog = mixN(.008, .012, p); want.shift = .16;
        break;
      case 'duvidas':
        want.pos.set(50, 60, 100); want.look.set(0, 0, 0); want.fog = .012; want.shift = .16;
        break;
      case 'contato':
        want.pos.lerpVectors(v(-2, 28, 54), v(-8, 19, 46), p); want.look.set(-16, 0, 10); want.fov = 40; want.fog = .0048; want.shift = 0;
        break;
      default:
        want.pos.lerpVectors(HERO_A, HERO_B, p); want.look.copy(HERO_LOOK); want.fov = 36; tiltOn = parallax;
    }
    if (vw < vh) {                       // tela em pé: sem deslocamento lateral e câmera mais afastada
      want.shift = 0;
      if (sec === 'localizacao') want.drop = .2;        // o texto ocupa o alto da tela: o caminhão desce para a faixa livre
      want.pos.sub(want.look).multiplyScalar(1.35).add(want.look);
    }
  }

  function resize(w: number, h: number): void { vw = w; vh = h; camera.aspect = w / h; appliedShift = NaN; }
  function pointer(nx: number, ny: number): void { tx = nx; ty = ny; }

  /** Avança a câmera em direção ao alvo. Devolve true enquanto ainda estiver se movendo. */
  function update(dt: number, snap: boolean): boolean {
    const k = snap ? 1 : 1 - Math.exp(-dt * rate);
    cur.pos.lerp(want.pos, k); cur.look.lerp(want.look, k);
    cur.fov = mixN(cur.fov, want.fov, k); cur.fog = mixN(cur.fog, want.fog, k); cur.shift = mixN(cur.shift, want.shift, k); cur.drop = mixN(cur.drop, want.drop, k);
    const gx = tiltOn ? tx : 0, gy = tiltOn ? ty : 0;
    mx = mixN(mx, gx, snap ? 1 : 1 - Math.exp(-dt * 4)); my = mixN(my, gy, snap ? 1 : 1 - Math.exp(-dt * 4));
    camera.position.copy(cur.pos); camera.lookAt(cur.look);
    camera.rotateY(-mx * MAX_TILT); camera.rotateX(-my * MAX_TILT);
    camera.fov = cur.fov;
    if (Math.abs(cur.shift + cur.drop * 7 - appliedShift) > .0005 || Number.isNaN(appliedShift)) {
      appliedShift = cur.shift + cur.drop * 7;
      // desloca o quadro para o assunto ficar à direita, fora da coluna de texto
      if (appliedShift > .001) camera.setViewOffset(vw, vh, -cur.shift * vw, -cur.drop * vh, vw, vh); else camera.clearViewOffset();
    }
    camera.updateProjectionMatrix();
    return cur.pos.distanceToSquared(want.pos) > .0004 || cur.look.distanceToSquared(want.look) > .0004
      || Math.abs(cur.fov - want.fov) > .01 || Math.abs(mx - gx) > .002 || Math.abs(my - gy) > .002 || Math.abs(cur.shift - want.shift) > .001 || Math.abs(cur.drop - want.drop) > .001;
  }
  return { target, update, resize, pointer, get fog(): number { return cur.fog; } };
}
export type Rig = ReturnType<typeof createRig>;
