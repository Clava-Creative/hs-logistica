// Mapa 2D da Tríplice Fronteira desenhado em canvas. É o que aparece quando o 3D não pode rodar.
import { S } from '../content/store';
import { logoSrc } from './html';
import { reducedMotion } from '../ui';

type Pt = [number, number];
let raf = 0, logoImg: HTMLImageElement | null = null;
export const resetMapLogo = (): void => { logoImg = null; };
export const stopMap = (): void => cancelAnimationFrame(raf);

const FOZ: Pt = [.52, .50], CDE: Pt = [.16, .47], PIG: Pt = [.47, .86], HS: Pt = [.72, .36], OUT: Pt = [1.04, .20];
const ROUTES: Pt[][] = [[CDE, [.33, .485], FOZ, HS], [PIG, [.50, .70], FOZ, HS], [OUT, HS]];

function along(pts: Pt[], t: number): Pt {
  const L: number[] = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  let d = t * tot;
  for (let i = 0; i < L.length; i++) {
    if (d <= L[i]) { const k = d / L[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]; }
    d -= L[i];
  }
  return pts[pts.length - 1];
}

export function startMap(): void {
  stopMap();
  const cv = document.getElementById('map') as HTMLCanvasElement | null;
  if (!cv) return;
  if (!logoImg) { logoImg = new Image(); logoImg.src = logoSrc(S.C); }
  const logo = logoImg, ctx = cv.getContext('2d') as CanvasRenderingContext2D, still = reducedMotion();

  function frame(ms: number): void {
    const r = cv!.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2), W = r.width, H = r.height, U = Math.min(W, H);
    if (!W) { raf = requestAnimationFrame(frame); return; }
    if (cv!.width !== Math.round(W * dpr) || cv!.height !== Math.round(H * dpr)) { cv!.width = Math.round(W * dpr); cv!.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const P = (p: Pt): Pt => [p[0] * W, p[1] * H], acc = S.C.theme.accent, t = ms / 1000;
    // rios Paraná e Iguaçu
    ctx.strokeStyle = 'rgba(140,190,235,.26)'; ctx.lineCap = 'round';
    ctx.lineWidth = U * .034; ctx.beginPath(); ctx.moveTo(.38 * W, -20); ctx.bezierCurveTo(.27 * W, .3 * H, .40 * W, .55 * H, .31 * W, .78 * H); ctx.bezierCurveTo(.28 * W, .88 * H, .25 * W, .95 * H, .23 * W, H + 20); ctx.stroke();
    ctx.lineWidth = U * .024; ctx.beginPath(); ctx.moveTo(W + 20, .62 * H); ctx.bezierCurveTo(.8 * W, .78 * H, .58 * W, .68 * H, .31 * W, .78 * H); ctx.stroke();
    // países
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.font = `800 ${U * .058}px "Archivo Variable", Arial, sans-serif`; ctx.textAlign = 'left';
    ctx.fillText('PARAGUAI', .04 * W, .16 * H); ctx.fillText('BRASIL', .60 * W, .10 * H); ctx.fillText('ARGENTINA', .52 * W, .95 * H);
    // rotas e cargas em movimento
    ROUTES.forEach((rt, i) => {
      ctx.strokeStyle = i === 2 ? acc : 'rgba(255,255,255,.5)'; ctx.lineWidth = i === 2 ? 3.5 : 1.5; ctx.setLineDash(i === 2 ? [] : [5, 7]);
      ctx.beginPath(); rt.forEach((p, j) => { const q = P(p); if (j) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }); ctx.stroke();
    });
    ctx.setLineDash([]);
    ROUTES.forEach((rt, i) => {
      for (let k = 0; k < 3; k++) {
        const u = still ? (k + .5) / 3 : ((t * .06 * (1 + i * .2) + k / 3) % 1), q = P(along(rt, i === 2 ? 1 - u : u));
        ctx.fillStyle = acc; ctx.beginPath(); ctx.roundRect(q[0] - 5, q[1] - 3.5, 10, 7, 2); ctx.fill();
      }
    });
    // cidades
    ctx.font = `500 ${Math.max(11, U * .026)}px "IBM Plex Sans", sans-serif`;
    ([[FOZ, 'Foz do Iguaçu', 12, 22], [CDE, 'Ciudad del Este', -10, -16], [PIG, 'Puerto Iguazú', 14, 5]] as [Pt, string, number, number][]).forEach(([p, n, dx, dy]) => {
      const q = P(p);
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(q[0], q[1], 5, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(242,245,250,.9)'; ctx.fillText(n, q[0] + dx, q[1] + dy);
    });
    ctx.fillStyle = acc; ctx.textAlign = 'right'; ctx.fillText('BR-277 para Paranaguá', .96 * W, .20 * H - 26); ctx.textAlign = 'left';
    // HS: o logo numa plaquinha branca
    const h = P(HS), pulse = still ? 0 : (t % 2.4) / 2.4, tw = U * .2, th = tw * .62;
    ctx.strokeStyle = acc; ctx.globalAlpha = 1 - pulse; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(h[0], h[1], tw * .5 + pulse * 34, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
    ctx.beginPath(); ctx.roundRect(h[0] - tw / 2, h[1] - th / 2, tw, th, 10); ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    if (logo.complete && logo.naturalWidth) { const iw = tw * .78, ih = iw * logo.naturalHeight / logo.naturalWidth; ctx.drawImage(logo, h[0] - iw / 2, h[1] - ih / 2, iw, ih); }
    if (!still) raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  if (still) { logo.onload = () => requestAnimationFrame(frame); void document.fonts?.ready.then(() => requestAnimationFrame(frame)); }
}
