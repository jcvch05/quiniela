import { NextRequest, NextResponse } from 'next/server';
import { getCollection, updateDocument, createDocument, getDocument } from '@/lib/firebase';
import { calcularPuntosPartido } from '@/lib/puntuacion';
import { Participante, Partido } from '@/types';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'vilaseca2026';

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-password') === ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { partidoId, golesLocal, golesVisitante } = await req.json();
  if (!partidoId) return NextResponse.json({ error: 'partidoId requerido' }, { status: 400 });

  // Guardar resultado en Firestore
  try {
    await getDocument('resultados', partidoId);
    await updateDocument('resultados', partidoId, { golesLocal, golesVisitante, jugado: true });
  } catch {
    await createDocument('resultados', partidoId, { golesLocal, golesVisitante, jugado: true });
  }

  // Recalcular puntos de todos los participantes
  const [participantes, resultados] = await Promise.all([
    getCollection('participantes'),
    getCollection('resultados'),
  ]);

  const resultadosMap = Object.fromEntries(
    (resultados as Partido[]).map(r => [r.id, r])
  );

  for (const participante of participantes as Participante[]) {
    let puntosGrupos = 0;
    const pronosticos = participante.pronosticosGrupos ?? {};
    for (const [pId, resultado] of Object.entries(resultadosMap)) {
      const pron = (pronosticos as Record<string, { golesLocal: number; golesVisitante: number }>)[pId];
      if (pron) {
        puntosGrupos += calcularPuntosPartido(pron, { ...resultado, id: pId, fase: 'grupos', local: '', visitante: '', fecha: '', jugado: true });
      }
    }

    const totalPuntos = puntosGrupos +
      (participante.desglose?.octavos ?? 0) +
      (participante.desglose?.cuartos ?? 0) +
      (participante.desglose?.semis ?? 0) +
      (participante.desglose?.especiales ?? 0);

    await updateDocument('participantes', participante.id, {
      puntos: totalPuntos,
      desglose: {
        ...(participante.desglose ?? {}),
        grupos: puntosGrupos,
      },
    });
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const resultados = await getCollection('resultados');
  return NextResponse.json(resultados);
}
