import { NextRequest, NextResponse } from 'next/server';
import { updateDocument } from '@/lib/firebase';

const ALLOWED_UID = 'wc9HNaAOGzYwTSjASuGfiJhYpK72';

export async function POST(req: NextRequest) {
  const { uid, pronosticosGrupos } = await req.json();
  if (uid !== ALLOWED_UID) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  await updateDocument('participantes', ALLOWED_UID, { pronosticosGrupos });
  return NextResponse.json({ ok: true });
}
