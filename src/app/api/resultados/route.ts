import { NextRequest, NextResponse } from 'next/server';
import { getCollection, updateDocument, createDocument, getDocument } from '@/lib/firebase';
import { recalcularTodos } from '@/lib/recalcularPuntos';
import { verifyAdmin } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { partidoId, golesLocal, golesVisitante, video } = await req.json();
  if (!partidoId || typeof partidoId !== 'string' || !/^[A-Z0-9]{2,4}$/.test(partidoId)) {
    return NextResponse.json({ error: 'partidoId inválido' }, { status: 400 });
  }
  const gl = Number(golesLocal), gv = Number(golesVisitante);
  if (isNaN(gl) || isNaN(gv) || gl < 0 || gl > 20 || gv < 0 || gv > 20) {
    return NextResponse.json({ error: 'Marcador inválido (0-20)' }, { status: 400 });
  }

  // Guardar resultado en Firestore
  try {
    await getDocument('resultados', partidoId);
    await updateDocument('resultados', partidoId, { golesLocal, golesVisitante, jugado: true, ...(video ? { video } : {}) });
  } catch {
    await createDocument('resultados', partidoId, { golesLocal, golesVisitante, jugado: true, ...(video ? { video } : {}) });
  }

  // Recalcular puntos de todos los participantes
  await recalcularTodos();

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const resultados = await getCollection('resultados');
  return NextResponse.json(resultados);
}
