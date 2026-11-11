// Rótulos de cidade em HTML, posicionados pela projeção do ponto 3D na tela. São decorativos (aria-hidden):
// a mesma informação já está no texto da seção.
import { Vector3, type PerspectiveCamera } from 'three';

export function createLabels(names: string[]) {
  const el = document.createElement('div');
  el.className = 'labels'; el.setAttribute('aria-hidden', 'true');
  const spans = names.map((n) => { const s = document.createElement('span'); s.textContent = n; el.appendChild(s); return s; });
  const p = new Vector3();

  function update(points: Vector3[], camera: PerspectiveCamera, show: (i: number) => boolean, w: number, h: number): void {
    points.forEach((pt, i) => {
      p.copy(pt).project(camera);
      const dist = camera.position.distanceTo(pt);
      const on = show(i) && p.z < 1 && Math.abs(p.x) < 1.05 && Math.abs(p.y) < 1.05 && dist < 190;
      spans[i].classList.toggle('on', on);
      if (on) spans[i].style.transform = `translate(${((p.x + 1) / 2 * w).toFixed(1)}px,${((1 - p.y) / 2 * h).toFixed(1)}px) translate(-50%,-140%)`;
    });
  }
  return { el, update, hide: (): void => spans.forEach((s) => s.classList.remove('on')) };
}
