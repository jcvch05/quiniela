import { NextRequest, NextResponse } from 'next/server';
import { getCollection, updateDocument, createDocument, getDocument } from '@/lib/firebase';
import { recalcularTodos } from '@/lib/recalcularPuntos';
import { verifyAdmin } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await req.json();
  const { partidoId, golesLocal, golesVisitante, video } = body;

  if (!partidoId || typeof partidoId !== 'string' || !/^[A-Z0-9]{2,4}$/.test(partidoId)) {
    return NextResponse.json({ error: 'partidoId inválido' }, { status: 400 });
  }

  const gl = Number(golesLocal), gv = Number(golesVisitante);
  if (isNaN(gl) || isNaN(gv) || gl < 0 || gl > 20 || gv < 0 || gv > 20) {
    return NextResponse.json({ error: 'Marcador inválido (0-20)' }, { status: 400 });
  }

  // Detectar si es dieciseisavos por el primer carácter: D (G=grupos)
  const firstChar = partidoId.charAt(0);
  const collection = firstChar === 'D' ? 'resultados-dieciseisavos' : 'resultados';

  try {
    await getDocument(collection, partidoId);
    await updateDocument(collection, partidoId, { golesLocal: gl, golesVisitante: gv, jugado: true, ...(video ? { video } : {}) });
  } catch {
    await createDocument(collection, partidoId, { golesLocal: gl, golesVisitante: gv, jugado: true, ...(video ? { video } : {}) });
  }

  // Recalcular puntos de todos
  await recalcularTodos();

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const [grupos, dieciseisavos] = await Promise.all([
    getCollection('resultados'),
    getCollection('resultados-dieciseisavos').catch(() => []),
  ]);
  return NextResponse.json({ grupos, dieciseisavos });
}
