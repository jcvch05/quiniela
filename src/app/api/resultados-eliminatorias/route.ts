import { NextRequest, NextResponse } from 'next/server';
import { updateDocument, createDocument, getDocument, getCollection } from '@/lib/firebase';
import { verifyAdmin } from '@/lib/adminAuth';
import { getPartidoDieciseisavos, determinarGanador } from '@/lib/eliminatorias';
import { recalcularEliminatorias } from '@/lib/recalcularEliminatorias';

export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { partidoId, ganador, fase } = await req.json();

  if (!partidoId || typeof partidoId !== 'string') {
    return NextResponse.json({ error: 'partidoId requerido' }, { status: 400 });
  }

  if (!ganador || typeof ganador !== 'string') {
    return NextResponse.json({ error: 'ganador requerido' }, { status: 400 });
  }

  // Determinar fase por ID si no se proporciona
  let determinedFase = fase;
  if (!determinedFase) {
    if (partidoId.startsWith('D')) determinedFase = 'dieciseisavos';
    else if (partidoId.startsWith('O')) determinedFase = 'octavos';
    else if (partidoId.startsWith('C')) determinedFase = 'cuartos';
    else if (partidoId.startsWith('S')) determinedFase = 'semis';
    else if (partidoId.startsWith('F')) determinedFase = 'final';
    else {
      return NextResponse.json({ error: 'No se pudo determinar la fase' }, { status: 400 });
    }
  }

  try {
    // Guardar o actualizar resultado
    try {
      await getDocument('resultados-eliminatorias', partidoId);
      await updateDocument('resultados-eliminatorias', partidoId, {
        fase: determinedFase,
        ganador,
      });
    } catch {
      await createDocument('resultados-eliminatorias', partidoId, {
        fase: determinedFase,
        ganador,
      });
    }

    // Recalcular puntos de todos
    await recalcularEliminatorias();

    return NextResponse.json({ ok: true, fase: determinedFase });
  } catch (error) {
    console.error('Error guardando resultado eliminatoria:', error);
    return NextResponse.json({ error: 'Error guardando resultado' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const resultados = await getCollection('resultados-eliminatorias');
    return NextResponse.json(resultados || []);
  } catch {
    return NextResponse.json([]);
  }
}
