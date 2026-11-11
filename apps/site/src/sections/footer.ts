import { esc, safeUrl, type Ctx } from './html'

export const footer = ({ c }: Ctx): string =>
  `<footer><div class="wrap"><span>${esc(c.footer)}</span>${safeUrl(c.cmsUrl) ? `<a class="admin-link" href="${esc(c.cmsUrl)}/admin" rel="nofollow noopener">Área do cliente</a>` : ''}</div></footer>`
