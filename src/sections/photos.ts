import { img, tools, type Ctx } from './html';

/** Fotos da operação enviadas pelo portal. Para o visitante, só aparece o que tem foto. */
export const photos = ({ c, admin }: Ctx): string => {
  const list = c.photos.map(img);
  if (!admin && !list.some(Boolean)) return '';
  return `<div class="wrap photos">${list.map((p, i) => (p || admin
    ? `<div class="photo ${p ? '' : 'slot'}">${p ? `<img src="${p}" alt="Foto da operação da HS Logística" loading="lazy">` : 'Envie uma foto do armazém, da frota ou da equipe.'}${tools('photos.' + i, p)}</div>`
    : '')).join('')}</div>`;
};
