import { NextRequest, NextResponse } from 'next/server';
import { updateDocument } from '@/lib/firebase';
import { DEADLINE_DIECISEISAVOS } from '@/lib/partidos';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  if (new Date() > new Date(DEADLINE_DIECISEISAVOS)) {
    return NextResponse.json({ error: 'Plazo de apuestas cerrado' }, { status: 403 });
  }

  const { pronosticosDieciseisavos, uid } = await req.json();
  if (!uid || typeof pronosticosDieciseisavos !== 'object') {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  // Garantizar que los goles se guardan como enteros, nunca como strings
  const pronosticosInt: Record<string, { golesLocal: number; golesVisitante: number }> = {};
  for (const [pid, pred] of Object.entries(pronosticosDieciseisavos as Record<string, { golesLocal: unknown; golesVisitante: unknown }>)) {
    pronosticosInt[pid] = {
      golesLocal: Number(pred.golesLocal),
      golesVisitante: Number(pred.golesVisitante),
    };
  }

  await updateDocument('participantes', uid, { pronosticosDieciseisavos: pronosticosInt }, token);
  return NextResponse.json({ ok: true });
}
