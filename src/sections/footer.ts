import { T, LOCK, type Ctx } from './html';

export const footer = (_: Ctx): string =>
  `<footer><div class="wrap">${T('footer')}<button class="portal-link" data-act="portal">${LOCK}Portal do cliente</button></div></footer>`;
