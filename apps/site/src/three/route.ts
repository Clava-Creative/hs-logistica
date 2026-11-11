// BR-277 de Paranaguá a Foz: curva, pista, linha da rota com fluxo, pinos das cidades e os dois ramais de fronteira.
import {
  CatmullRomCurve3, Vector3, Mesh, TubeGeometry, Group, CylinderGeometry, SphereGeometry, InstancedMesh,
  BoxGeometry, Object3D, type Curve,
} from 'three';
import type { Mats } from './scene';

/** Fração do percurso em que cada cidade fica (a mesma da régua de km da página). */
export const CITY_T = [0, .13, .47, .8, 1];
export const CITY_NAMES = ['Paranaguá', 'Curitiba', 'Guarapuava', 'Cascavel', 'Foz do Iguaçu'];

const V = (x: number, z: number, y = .2): Vector3 => new Vector3(x, y, z);

export function buildRoute(mats: Mats, flowCount: number) {
  const group = new Group();
  // ~12 pontos estilizados: do litoral (leste) até a doca da HS em Foz (oeste)
  const curve = new CatmullRomCurve3([
    V(430, 14), V(390, 2), V(350, 15), V(310, 1), V(270, 13), V(230, -1), V(190, 11), V(150, 1), V(110, 10), V(70, 3), V(30, 7), V(2, 6),
  ]);
  const py = new CatmullRomCurve3([V(2, 6), V(-14, 6), V(-38, 6), V(-66, 5)]);          // Ponte da Amizade → Paraguai
  const ar = new CatmullRomCurve3([V(-6, 6), V(-10, 16), V(-12, 40), V(-13, 70)]);      // Ponte Tancredo Neves → Argentina

  const tube = (c: Curve<Vector3>, seg: number, r: number, m: Mats[keyof Mats], flatten = 1): Mesh => {
    const mesh = new Mesh(new TubeGeometry(c, seg, r, 6), m);
    mesh.scale.y = flatten; mesh.receiveShadow = flatten < 1;
    group.add(mesh); return mesh;
  };
  tube(curve, 420, 1.5, mats.road, .06);            // pista
  tube(py, 40, 1.3, mats.road, .06); tube(ar, 40, 1.3, mats.road, .06);
  tube(curve, 420, .22, mats.route).position.y = .25;   // linha da rota, na cor de destaque
  tube(py, 40, .2, mats.branch).position.y = .25;
  tube(ar, 40, .2, mats.branch).position.y = .25;

  // pinos das cidades; os nomes ficam em HTML, projetados sobre a cena
  const stem = new CylinderGeometry(.12, .12, 5, 5), head = new SphereGeometry(.7, 8, 6);
  const pins = CITY_T.map((t) => {
    const p = curve.getPointAt(t), g = new Group();
    if (t === 1) { p.x = -11; p.z = -1; }           // Foz: o pino fica no pátio da HS, fora do caminho da doca
    const s = new Mesh(stem, mats.cold); s.position.y = 2.5;
    const h = new Mesh(head, mats.pin); h.position.y = 5.4;
    g.add(s, h); g.position.set(p.x, 0, p.z - 3); group.add(g);
    return new Vector3(p.x, 6.6, p.z - 3);
  });

  // fluxo: pequenas cargas correndo pela rota, sempre no sentido de Foz
  const flow = new InstancedMesh(new BoxGeometry(1.1, .34, .34), mats.flow, flowCount);
  flow.frustumCulled = false; group.add(flow);
  const d = new Object3D(), ahead = new Vector3();
  function updateFlow(time: number): void {
    for (let i = 0; i < flowCount; i++) {
      const t = (time * .006 + i / flowCount) % 1;
      curve.getPointAt(t, d.position); d.position.y = .62;
      curve.getTangentAt(t, ahead); d.lookAt(ahead.add(d.position)); d.rotateY(Math.PI / 2);
      d.updateMatrix(); flow.setMatrixAt(i, d.matrix);
    }
    flow.instanceMatrix.needsUpdate = true;
  }
  updateFlow(0);

  const borders = [new Vector3(-58, 5, 5), new Vector3(-13, 5, 62)];   // onde ficam os rótulos Paraguai e Argentina
  return { group, curve, py, ar, pins, borders, updateFlow };
}
export type Route = ReturnType<typeof buildRoute>;
