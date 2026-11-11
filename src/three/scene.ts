// Cena base: câmera, luzes, neblina, chão e rios. Também guarda os materiais, todos compartilhados.
import {
  Scene, PerspectiveCamera, Color, FogExp2, HemisphereLight, DirectionalLight, Mesh, PlaneGeometry,
  MeshStandardMaterial, type Material,
} from 'three';
import { BUDGET, type Tier } from './quality';

const mat = (o: ConstructorParameters<typeof MeshStandardMaterial>[0] = {}): MeshStandardMaterial =>
  new MeshStandardMaterial({ flatShading: true, roughness: .9, metalness: 0, ...o });

export function createMaterials() {
  return {
    ground: mat(), river: mat({ roughness: .5 }), road: mat(), yard: mat(),
    route: mat({ emissiveIntensity: .9 }), branch: mat({ emissiveIntensity: .5 }), flow: mat({ emissiveIntensity: 1.4 }),
    wall: mat(), roof: mat(), door: mat(), dark: mat(), cold: mat(), pin: mat({ emissiveIntensity: .6 }),
    pallet: mat(), container: mat(),
  };
}
export type Mats = ReturnType<typeof createMaterials>;

const WHITE = new Color('#ffffff'), BLACK = new Color('#000000'), RIVER = new Color('#7fb4e6');
const mix = (a: Color, b: Color, k: number): Color => a.clone().lerp(b, k);

/** Deriva todas as cores da cena das duas cores da marca; chamado de novo quando o portal troca as cores. */
export function applyPalette(m: Mats, scene: Scene, inkHex: string, accentHex: string): void {
  const ink = new Color(inkHex), acc = new Color(accentHex);
  (scene.background as Color).copy(ink);
  (scene.fog as FogExp2).color.copy(ink);
  m.ground.color.copy(mix(ink, BLACK, .12));
  m.river.color.copy(mix(ink, RIVER, .42));
  m.road.color.copy(mix(ink, WHITE, .14));
  m.yard.color.copy(mix(ink, WHITE, .05));
  m.wall.color.set('#E9EEF6'); m.cold.color.set('#C5CEDD'); m.pallet.color.set('#D9E0EC'); m.container.color.set('#ffffff');
  m.roof.color.copy(mix(ink, WHITE, .36));
  m.dark.color.copy(mix(ink, BLACK, .3));
  m.door.color.copy(acc);
  for (const k of ['route', 'branch', 'flow', 'pin'] as const) { m[k].color.copy(acc); m[k].emissive.copy(acc); }
}

export function createScene(tier: Tier) {
  const scene = new Scene();
  scene.background = new Color();
  scene.fog = new FogExp2(0x000000, .0055);
  const camera = new PerspectiveCamera(38, innerWidth / innerHeight, .5, 700);

  scene.add(new HemisphereLight(0xdfe7ff, 0x0b1630, 1.05));
  const sun = new DirectionalLight(0xffffff, 1.9);
  sun.position.set(40, 60, 30);
  if (BUDGET[tier].shadows) {          // a única luz com sombra, só no nível alto
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    const c = sun.shadow.camera;
    c.left = -45; c.right = 45; c.top = 45; c.bottom = -45; c.near = 10; c.far = 160;
    sun.shadow.bias = -.0015;
  }
  scene.add(sun, sun.target);

  const mats = createMaterials();
  const flat = (w: number, d: number, m: Material, x: number, y: number, z: number): Mesh => {
    const g = new Mesh(new PlaneGeometry(w, d), m);
    g.rotation.x = -Math.PI / 2; g.position.set(x, y, z); g.receiveShadow = true;
    scene.add(g); return g;
  };
  flat(1300, 800, mats.ground, 180, 0, 0);
  flat(14, 700, mats.river, -38, .04, 0);       // rio Paraná: separa o Brasil do Paraguai
  flat(700, 10, mats.river, 312, .04, 40);      // rio Iguaçu: separa o Brasil da Argentina

  return { scene, camera, sun, mats };
}
