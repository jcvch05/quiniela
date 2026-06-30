import { NextRequest, NextResponse } from 'next/server';
import { getCollection, updateDocument, createDocument, getDocument } from '@/lib/firebase';
import { recalcularTodos } from '@/lib/recalcularPuntos';
import { verifyAdmin } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await req.json();
  const { partidoId, golesLocal, golesVisitante, video, ganador } = body;

  if (!partidoId || typeof partidoId !== 'string' || !/^[A-Z0-9]{2,4}$/.test(partidoId)) {
    return NextResponse.json({ error: 'partidoId inválido' }, { status: 400 });
  }

  // Detectar si es eliminatoria por el primer carácter: D, O, C, S, F (no G)
  const firstChar = partidoId.charAt(0);
  const esEliminatoria = ['D', 'O', 'C', 'S', 'F'].includes(firstChar);

  if (esEliminatoria) {
    // Manejar eliminatoria - requiere ganador
    if (!ganador || typeof ganador !== 'string') {
      return NextResponse.json({ error: 'ganador requerido para eliminatorias' }, { status: 400 });
    }

    const faseMap: Record<string, string> = {
      D: 'dieciseisavos', O: 'octavos', C: 'cuartos', S: 'semis', F: 'final'
    };
    const fase = faseMap[firstChar];

    try {
      await getDocument('resultados-eliminatorias', partidoId);
      await updateDocument('resultados-eliminatorias', partidoId, { fase, ganador });
    } catch {
      await createDocument('resultados-eliminatorias', partidoId, { fase, ganador });
    }
  } else {
    // Manejar grupo - requiere goles
    if (golesLocal === undefined || golesVisitante === undefined) {
      return NextResponse.json({ error: 'golesLocal y golesVisitante requeridos para grupos' }, { status: 400 });
    }

    const gl = Number(golesLocal), gv = Number(golesVisitante);
    if (isNaN(gl) || isNaN(gv) || gl < 0 || gl > 20 || gv < 0 || gv > 20) {
      return NextResponse.json({ error: 'Marcador inválido (0-20)' }, { status: 400 });
    }

    try {
      await getDocument('resultados', partidoId);
      await updateDocument('resultados', partidoId, { golesLocal: gl, golesVisitante: gv, jugado: true, ...(video ? { video } : {}) });
    } catch {
      await createDocument('resultados', partidoId, { golesLocal: gl, golesVisitante: gv, jugado: true, ...(video ? { video } : {}) });
    }
  }

  // Recalcular puntos de todos
  await recalcularTodos();

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const [grupos, eliminatorias] = await Promise.all([
    getCollection('resultados'),
    getCollection('resultados-eliminatorias').catch(() => []),
  ]);
  return NextResponse.json({ grupos, eliminatorias });
}
