// Armazém da HS em low-poly, feito só de primitivas: galpão, telhado em duas águas, docas, galpão de estoque,
// pátio e as duas pontes. As três "zonas" são placas no chão que acendem quando um serviço está ativo.
import {
  Group, Mesh, BoxGeometry, CylinderGeometry, TorusGeometry, MeshStandardMaterial, type Material, type BufferGeometry,
} from 'three';
import type { Mats } from './scene';

/** Pontos de referência usados também pela carga e pelo caminhão. */
export const SITE = {
  dock: { x: 0, z: -1.2 },          // em frente às portas
  shed: { x: -19, z: -10 },         // estoque coberto
  yard: { x: 19, z: -10 },          // pátio de containers
  truckDock: { x: 7.5, z: 1.4 },    // onde o caminhão encosta
};

export function buildWarehouse(mats: Mats, shadows: boolean) {
  const group = new Group();
  const box = new BoxGeometry(1, 1, 1);
  const add = (g: BufferGeometry, m: Material, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1, cast = true): Mesh => {
    const mesh = new Mesh(g, m);
    mesh.position.set(x, y, z); mesh.scale.set(sx, sy, sz);
    mesh.castShadow = shadows && cast; mesh.receiveShadow = shadows;
    group.add(mesh); return mesh;
  };

  add(box, mats.yard, 0, .06, -7, 64, .12, 24, false);                    // pátio
  add(box, mats.wall, 0, 3.2, -10, 20, 6.4, 12);                          // galpão
  add(box, mats.door, 0, 5.6, -3.98, 20, .7, .1, false);                  // faixa na cor da marca
  // telhado em duas águas: um prisma triangular deitado ao longo do galpão
  const roof = add(new CylinderGeometry(7.4, 7.4, 21, 3, 1, false, Math.PI / 2), mats.roof, 0, 6.4 + .92, -10);
  roof.rotation.z = Math.PI / 2; roof.scale.set(.25, 1, 1);
  add(box, mats.cold, 0, .6, -3.2, 20, 1.2, 1.8);                         // plataforma de doca
  for (let i = 0; i < 4; i++) add(box, i % 2 ? mats.dark : mats.door, -6.6 + i * 4.4, 2.9, -3.95, 3, 3.4, .16, false);

  // estoque coberto: laje sobre quatro pilares, aberto para a carga aparecer
  const s = SITE.shed;
  add(box, mats.roof, s.x, 6, s.z, 13, .45, 13);
  add(box, mats.cold, s.x, .12, s.z, 13, .12, 13, false);
  for (const [dx, dz] of [[-6, -6], [6, -6], [-6, 6], [6, 6]]) add(box, mats.cold, s.x + dx, 3, s.z + dz, .5, 6, .5);

  // Ponte da Amizade (Paraguai): tabuleiro com dois arcos
  add(box, mats.cold, -38, .55, 6, 26, .5, 4);
  const arch = new TorusGeometry(11, .32, 5, 14, Math.PI);
  add(arch, mats.wall, -38, .6, 4.1); add(arch, mats.wall, -38, .6, 7.9);
  for (let i = -2; i <= 2; i++) for (const z of [4.1, 7.9]) add(box, mats.wall, -38 + i * 3.6, .6 + Math.sqrt(121 - (i * 3.6) ** 2) / 2, z, .14, Math.sqrt(121 - (i * 3.6) ** 2), .14, false);
  // Ponte Tancredo Neves (Argentina): viga reta sobre pilares, com guarda-corpos
  add(box, mats.cold, -12, .55, 40, 3.6, .5, 20);
  for (const dx of [-1.7, 1.7]) add(box, mats.wall, -12 + dx, 1.1, 40, .12, .6, 20, false);
  for (const dz of [-6, 0, 6]) add(box, mats.cold, -12, .2, 40 + dz, 1.4, .5, 1.4, false);

  // zonas que acendem com o serviço ativo: doca, estoque, pátio
  const zone = (x: number, z: number, w: number, d: number): MeshStandardMaterial => {
    const m = mats.route.clone(); m.transparent = true; m.opacity = 0; m.depthWrite = false;
    add(box, m, x, .2, z, w, .06, d, false).renderOrder = 2;
    return m;
  };
  const zones = [zone(0, 1.2, 22, 7), zone(s.x, s.z, 14, 14), zone(SITE.yard.x, SITE.yard.z, 16, 16)];

  return { group, zones };
}
export type Warehouse = ReturnType<typeof buildWarehouse>;
