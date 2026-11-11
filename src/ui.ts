export function toast(m: string): void {
  const t = document.getElementById('toast') as HTMLElement & { _t?: ReturnType<typeof setTimeout> };
  t.textContent = m; t.classList.add('on');
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2200);
}
export const $ = <T extends HTMLElement = HTMLElement>(sel: string): T | null => document.querySelector<T>(sel);
export const reducedMotion = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;
