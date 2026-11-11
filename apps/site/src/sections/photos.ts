import { picture, type Ctx } from './html'

/** Fotos da operação enviadas pelo CMS. Sem fotos, a faixa não aparece. */
export const photos = ({ c }: Ctx): string => (c.photos.length
  ? `<div class="wrap photos">${c.photos.map((p) => `<div class="photo">${picture(p, '(max-width: 700px) 100vw, 33vw')}</div>`).join('')}</div>`
  : '')
