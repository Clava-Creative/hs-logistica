// Caminhão em caixas, que anda sobre uma curva: pela BR-277 na seção de localização e até a doca na de etapas.
import { Group, Mesh, BoxGeometry, CatmullRomCurve3, Vector3, type Curve } from 'three';
import type { Mats } from './scene';

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const ease = (t: number): number => t * t * (3 - 2 * t);

export function buildTruck(mats: Mats, shadows: boolean) {
  const group = new Group(), box = new BoxGeometry(1, 1, 1);
  const part = (m: Mats[keyof Mats], x: number, y: number, z: number, sx: number, sy: number, sz: number): void => {
    const mesh = new Mesh(box, m);
    mesh.position.set(x, y, z); mesh.scale.set(sx, sy, sz); mesh.castShadow = shadows; group.add(mesh);
  };
  // a frente do caminhão aponta para +z
  part(mats.wall, 0, 2.15, -1.3, 2.5, 2.7, 6.4);        // baú
  part(mats.door, 0, 1.05, -1.3, 2.54, .3, 6.44);       // faixa da marca
  part(mats.door, 0, 1.75, 3.1, 2.4, 2.1, 1.9);         // cabine
  part(mats.dark, 0, 2.3, 4.06, 2, .8, .06);            // para-brisa
  for (const z of [-3.6, -2.2, 2.9]) for (const x of [-1.15, 1.15]) part(mats.dark, x, .5, z, .5, 1, 1);

  // saída da rodovia até encostar na doca (termina de frente para a plataforma)
  const dockPath = new CatmullRomCurve3([
    new Vector3(2, .2, 6), new Vector3(-3.2, .2, 6.6), new Vector3(-6.6, .2, 6.2), new Vector3(-7, .2, 4.4), new Vector3(-7, .2, 2.6),
  ]);
  const p = new Vector3(), t = new Vector3();
  function place(curve: Curve<Vector3>, u: number): void {
    const k = clamp01(u);
    curve.getPointAt(k, p); curve.getTangentAt(k, t);
    group.position.set(p.x, 0, p.z); group.lookAt(p.x + t.x, 0, p.z + t.z);
  }
  /** Na seção de etapas: chega no primeiro quarto, fica encostado e sai no fim. */
  const dockT = (stepP: number): number => stepP < .5 ? ease(clamp01(stepP / .22)) : 1 - ease(clamp01((stepP - .9) / .1));
  return { group, dockPath, place, dockT };
}
export type Truck = ReturnType<typeof buildTruck>;
