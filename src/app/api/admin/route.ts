import { NextRequest, NextResponse } from 'next/server';
import { getCollection, updateDocument } from '@/lib/firebase';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'vilaseca2026';

function checkAuth(req: NextRequest) {
  const auth = req.headers.get('x-admin-password');
  return auth === ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const participantes = await getCollection('participantes');
  return NextResponse.json(participantes);
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id, ...data } = await req.json();
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });
  await updateDocument('participantes', id, data);
  return NextResponse.json({ ok: true });
}
