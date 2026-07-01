import { getCollection, updateDocument } from './firebase';

// D01-D04 se jugaron antes de que abrieran los pronósticos, no cuentan para puntos
const EXCLUIDOS_DIECISEISAVOS = new Set(['D01', 'D02', 'D03', 'D04']);

function ptsGrupo(gl: number, gv: number, pl: number, pv: number): number {
  if (gl === pl && gv === pv) return 8;
  if (gl - gv === pl - pv) return 5;
  if (gl !== gv && (gl > gv) === (pl > pv)) return 3;
  return 0;
}

function ptsElim(gl: number, gv: number, pl: number, pv: number): number {
  if (gl === pl && gv === pv) return 10;
  if (gl - gv === pl - pv) return 5;
  if (gl !== gv && (gl > gv) === (pl > pv)) return 3;
  return 0;
}

interface Resultado { id: string; golesLocal?: number; golesVisitante?: number; jugado?: boolean }
interface Pred { golesLocal: number; golesVisitante: number }
interface Participante {
  id: string;
  pronosticosGrupos?: Record<string, Pred>;
  pronosticosDieciseisavos?: Record<string, Pred>;
  desglose?: { especiales?: number; [k: string]: unknown };
}

export async function recalcularTodos() {
  const [participantes, resultados] = await Promise.all([
    getCollection('participantes'),
    getCollection('resultados'),
  ]);

  const resMap = Object.fromEntries(
    (resultados as Resultado[]).filter(r => r.jugado).map(r => [r.id, r])
  );

  for (const p of participantes as Participante[]) {
    let ptsGrupos = 0;
    let ptsDieciseisavos = 0;

    for (const [pid, pred] of Object.entries(p.pronosticosGrupos ?? {})) {
      const res = resMap[pid];
      if (!res || res.golesLocal === undefined || res.golesVisitante === undefined) continue;
      ptsGrupos += ptsGrupo(res.golesLocal, res.golesVisitante, Number(pred.golesLocal), Number(pred.golesVisitante));
    }

    for (const [pid, pred] of Object.entries(p.pronosticosDieciseisavos ?? {})) {
      if (EXCLUIDOS_DIECISEISAVOS.has(pid)) continue;
      const res = resMap[pid];
      if (!res || res.golesLocal === undefined || res.golesVisitante === undefined) continue;
      ptsDieciseisavos += ptsElim(res.golesLocal, res.golesVisitante, Number(pred.golesLocal), Number(pred.golesVisitante));
    }

    const especiales = (p.desglose?.especiales ?? 0) as number;
    const total = ptsGrupos + ptsDieciseisavos + especiales;

    await updateDocument('participantes', p.id, {
      puntos: total,
      desglose: { grupos: ptsGrupos, dieciseisavos: ptsDieciseisavos, especiales },
    });
  }
}
