import { getCollection, updateDocument } from './firebase';

// D01 y D04 sin apuestas; D02 y D03 tienen apuestas recuperadas
const EXCLUIDOS_DIECISEISAVOS = new Set(['D01', 'D04']);

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
  pronosticosOctavos?: Record<string, Pred>;
  pronosticosCuartos?: Record<string, Pred>;
  pronosticosSemis?: Record<string, Pred>;
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
    let ptsOctavos = 0;

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

    for (const [pid, pred] of Object.entries(p.pronosticosOctavos ?? {})) {
      const res = resMap[pid];
      if (!res || res.golesLocal === undefined || res.golesVisitante === undefined) continue;
      ptsOctavos += ptsElim(res.golesLocal, res.golesVisitante, Number(pred.golesLocal), Number(pred.golesVisitante));
    }

    let ptsCuartos = 0;
    for (const [pid, pred] of Object.entries(p.pronosticosCuartos ?? {})) {
      const res = resMap[pid];
      if (!res || res.golesLocal === undefined || res.golesVisitante === undefined) continue;
      ptsCuartos += ptsElim(res.golesLocal, res.golesVisitante, Number(pred.golesLocal), Number(pred.golesVisitante));
    }

    let ptsSemis = 0;
    for (const [pid, pred] of Object.entries(p.pronosticosSemis ?? {})) {
      const res = resMap[pid];
      if (!res || res.golesLocal === undefined || res.golesVisitante === undefined) continue;
      ptsSemis += ptsElim(res.golesLocal, res.golesVisitante, Number(pred.golesLocal), Number(pred.golesVisitante));
    }

    const especiales = (p.desglose?.especiales ?? 0) as number;
    const total = ptsGrupos + ptsDieciseisavos + ptsOctavos + ptsCuartos + ptsSemis + especiales;

    await updateDocument('participantes', p.id, {
      puntos: total,
      desglose: { grupos: ptsGrupos, dieciseisavos: ptsDieciseisavos, octavos: ptsOctavos, cuartos: ptsCuartos, semis: ptsSemis, especiales },
    });
  }
}
