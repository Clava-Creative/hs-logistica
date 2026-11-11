// Decide se a cena 3D roda neste aparelho e com que nível de detalhe. Não importa o three: é lido antes dele.
export type Tier = 'alto' | 'medio' | 'baixo';
export interface Quality { tier: Tier; webgl: boolean; saveData: boolean; allow: boolean }

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

export function detect(): Quality {
  const n = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const cores = n.hardwareConcurrency || 4, mem = n.deviceMemory ?? 8, saveData = !!n.connection?.saveData;
  const webgl = hasWebGL();
  let tier: Tier = 'alto';
  if (cores <= 4 || mem <= 4 || saveData || innerWidth < 768) tier = 'baixo';
  else if (cores <= 8 || innerWidth < 1200) tier = 'medio';
  // economia de dados ligada: o visitante pediu para não baixar o que é opcional
  return { tier, webgl, saveData, allow: webgl && !saveData };
}

export const BUDGET: Record<Tier, { pallets: number; stock: number; containers: number; flow: number; dpr: number; shadows: boolean; parallax: boolean }> = {
  alto: { pallets: 24, stock: 60, containers: 44, flow: 60, dpr: 1.75, shadows: true, parallax: true },
  medio: { pallets: 24, stock: 40, containers: 28, flow: 40, dpr: 1.25, shadows: false, parallax: true },
  baixo: { pallets: 16, stock: 16, containers: 12, flow: 16, dpr: 1, shadows: false, parallax: false },
};
