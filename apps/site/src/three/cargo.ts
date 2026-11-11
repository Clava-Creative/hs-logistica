// Carga: estoque fixo no galpão coberto, a remessa que o caminhão traz (na cor da marca) e os containers do pátio.
// Tudo em InstancedMesh; a remessa é posicionada só pelo avanço da seção de etapas, então o scroll pode ir e voltar.
import { Group, InstancedMesh, BoxGeometry, Object3D, Vector3, Color, Mesh } from 'three';
import type { Mats } from './scene';
import { SITE } from './warehouse';

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const seg = (p: number, a: number, b: number): number => clamp01((p - a) / (b - a));
const ease = (t: number): number => t * t * (3 - 2 * t);

/** Ponto de onde a remessa sai e para onde volta: a carroceria do caminhão encostado. */
export const TRAILER = new Vector3(-7, 1.9, 3.4);

export function buildCargo(mats: Mats, n: { pallets: number; stock: number; containers: number }) {
  const group = new Group(), d = new Object3D();
  const palletGeo = new BoxGeometry(1.4, 1, 1.4);
  const s = SITE.shed;

  // estoque que já está no armazém: fileiras do fundo do galpão coberto
  const stockCount = Math.min(n.stock, 45);
  const stock = new InstancedMesh(palletGeo, mats.pallet, stockCount);
  for (let i = 0; i < stockCount; i++) {
    const col = i % 5, row = Math.floor(i / 5) % 3, layer = Math.floor(i / 15);
    d.position.set(s.x - 4.6 + col * 2.3, .68 + layer * 1.06, s.z - 4.8 + row * 1.9);
    d.rotation.y = ((i * 37) % 7 - 3) * .02; d.updateMatrix(); stock.setMatrixAt(i, d.matrix);
  }
  stock.castShadow = stock.receiveShadow = true; group.add(stock);

  // remessa: caminhão → doca → estoque → caminhão
  const N = n.pallets;
  const B: Vector3[] = [], C: Vector3[] = [];
  for (let i = 0; i < N; i++) {
    B.push(new Vector3(-2.6 + (i % 6) * 1.9, .68, -.6 + Math.floor(i / 6) % 2 * 1.9 + Math.floor(i / 12) * .01).setY(.68 + Math.floor(i / 12) * 1.06));
    C.push(new Vector3(s.x - 3.5 + (i % 4) * 2.3, .68 + Math.floor(i / 8) * 1.06, s.z + 2.2 + Math.floor(i / 4) % 2 * 1.9));
  }
  const ship = new InstancedMesh(palletGeo, mats.door, N);
  ship.castShadow = true; ship.frustumCulled = false; group.add(ship);
  const pos = new Vector3();
  /** p = avanço da seção de etapas (0..1). Antes dela a remessa ainda não chegou; depois, já saiu. */
  function update(p: number): void {
    for (let i = 0; i < N; i++) {
      const k = i / N;
      const w = (a: number, b: number): number => ease(seg(p, a + (b - a) * .5 * k, a + (b - a) * (.5 + .5 * k)));
      const u1 = w(.24, .5), u2 = w(.5, .75), u3 = w(.75, .9);
      let scale = 0;
      if (u3 > 0) { pos.lerpVectors(C[i], TRAILER, u3); pos.y += Math.sin(u3 * Math.PI) * 2.4; scale = 1 - u3; }
      else if (u2 > 0) { pos.lerpVectors(B[i], C[i], u2); pos.y += Math.sin(u2 * Math.PI) * 3; scale = 1; }
      else if (u1 > 0) { pos.lerpVectors(TRAILER, B[i], u1); pos.y += Math.sin(u1 * Math.PI) * 1.6; scale = .2 + .8 * u1; }
      d.position.copy(pos); d.rotation.set(0, 0, 0); d.scale.setScalar(scale); d.updateMatrix();
      ship.setMatrixAt(i, d.matrix);
    }
    ship.instanceMatrix.needsUpdate = true;
  }
  d.scale.setScalar(1);

  // containers do pátio, empilhados, em três cores
  const cont = new InstancedMesh(new BoxGeometry(6, 2.5, 2.5), mats.container, n.containers);
  const tones = [new Color('#ffffff'), new Color('#9FB0CC'), mats.door.color.clone()];
  for (let i = 0; i < n.containers; i++) {
    const col = i % 2, row = Math.floor(i / 2) % 5, layer = Math.floor(i / 10);
    d.position.set(SITE.yard.x - 3.4 + col * 6.8, 1.4 + layer * 2.55, SITE.yard.z - 6 + row * 2.9);
    d.rotation.set(0, 0, 0); d.scale.setScalar(1); d.updateMatrix();
    cont.setMatrixAt(i, d.matrix); cont.setColorAt(i, tones[(i * 5 + layer) % 3]);
  }
  cont.castShadow = cont.receiveShadow = true; group.add(cont);
  const recolor = (): void => {
    tones[2].copy(mats.door.color);
    for (let i = 0; i < n.containers; i++) cont.setColorAt(i, tones[(i * 5 + Math.floor(i / 10)) % 3]);
    if (cont.instanceColor) cont.instanceColor.needsUpdate = true;
  };

  // microinteração do formulário: um pallet sai da doca e segue pela pista
  const out = new Mesh(palletGeo, mats.door); out.visible = false; group.add(out);
  let outT = -1;
  const launch = (): void => { outT = 0; out.visible = true; };
  function tick(dt: number): boolean {
    if (outT < 0) return false;
    outT += dt / 2.2;
    const a = ease(seg(outT, 0, .45)), b = ease(seg(outT, .4, 1));
    out.position.set(-b * 30, .7 + Math.sin(a * Math.PI) * 1.8, -1 + a * 7);
    out.scale.setScalar(1 - seg(outT, .8, 1));
    if (outT >= 1) { outT = -1; out.visible = false; }
    return true;
  }

  update(0);
  return { group, update, launch, tick, recolor };
}
export type Cargo = ReturnType<typeof buildCargo>;
