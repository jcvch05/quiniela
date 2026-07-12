import { NextRequest, NextResponse } from 'next/server';
import { getCollection, updateDocument, createDocument, getDocument } from '@/lib/firebase';
import { recalcularTodos } from '@/lib/recalcularPuntos';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'vilaseca2026';

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-password') === ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { partidoId, golesLocal, golesVisitante, video } = await req.json();
  if (!partidoId || typeof partidoId !== 'string' || !/^[A-Z0-9]{2,4}$/.test(partidoId)) {
    return NextResponse.json({ error: 'partidoId inválido' }, { status: 400 });
  }
  const gl = Number(golesLocal), gv = Number(golesVisitante);
  if (isNaN(gl) || isNaN(gv) || gl < 0 || gl > 20 || gv < 0 || gv > 20) {
    return NextResponse.json({ error: 'Marcador inválido (0-20)' }, { status: 400 });
  }

  const dataToSave: Record<string, unknown> = { golesLocal: gl, golesVisitante: gv, jugado: true };
  if (video && typeof video === 'string' && video.startsWith('http')) dataToSave.video = video;

  // Guardar resultado en Firestore
  try {
    await getDocument('resultados', partidoId);
    await updateDocument('resultados', partidoId, dataToSave);
  } catch {
    await createDocument('resultados', partidoId, dataToSave);
  }

  // Recalcular en segundo plano sin bloquear la respuesta (evita timeout en Vercel Hobby)
  recalcularTodos().catch(() => {});

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const resultados = await getCollection('resultados');
  return NextResponse.json(resultados);
}
