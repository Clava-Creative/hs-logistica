// Onde o visitante está na história: seção ativa e o avanço dentro de cada seção.
// O scroll escreve aqui; a cena 3D e o DOM leem.
export const story = {
  sec: 'inicio',
  p: {} as Record<string, number>,   // avanço 0..1 por seção
  svc: 0,                            // serviço ativo
  step: 0,                           // etapa ativa
};
type L = () => void;
const ls = new Set<L>();
export const onStory = (fn: L): (() => void) => { ls.add(fn); return () => ls.delete(fn); };
export const emitStory = (): void => ls.forEach((f) => f());
