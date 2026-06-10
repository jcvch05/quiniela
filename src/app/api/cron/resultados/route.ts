import { NextRequest, NextResponse } from 'next/server';
import { PARTIDOS_GRUPOS } from '@/lib/partidos';
import { getDocument, createDocument, updateDocument } from '@/lib/firebase';
import { fetchFinishedMatches, toSpanish } from '@/lib/footballApi';
import { recalcularTodos } from '@/lib/recalcularPuntos';

// Lookup: "España|Cabo Verde" → "G43"
const LOOKUP = new Map<string, string>(
  PARTIDOS_GRUPOS.map(p => [`${p.local}|${p.visitante}`, p.id])
);

export async function GET(req: NextRequest) {
  // Vercel Cron envía Authorization: Bearer <CRON_SECRET>
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  if (!process.env.FOOTBALL_DATA_API_KEY) {
    return NextResponse.json({ ok: false, error: 'FOOTBALL_DATA_API_KEY no configurada' });
  }

  const matches = await fetchFinishedMatches();
  let updated = 0;

  for (const match of matches) {
    const localEs = toSpanish(match.homeTeam.name);
    const visitanteEs = toSpanish(match.awayTeam.name);
    const partidoId = LOOKUP.get(`${localEs}|${visitanteEs}`);

    if (!partidoId) continue;
    const gl = match.score.fullTime.home;
    const gv = match.score.fullTime.away;
    if (gl === null || gv === null) continue;

    // Solo actualizar si cambió
    try {
      const existing = await getDocument('resultados', partidoId) as Record<string, unknown>;
      if (Number(existing.golesLocal) === gl && Number(existing.golesVisitante) === gv) continue;
      await updateDocument('resultados', partidoId, { golesLocal: gl, golesVisitante: gv, jugado: true });
    } catch {
      await createDocument('resultados', partidoId, { golesLocal: gl, golesVisitante: gv, jugado: true });
    }
    updated++;
  }

  if (updated > 0) {
    await recalcularTodos();
  }

  return NextResponse.json({
    ok: true,
    checked: matches.length,
    updated,
    timestamp: new Date().toISOString(),
  });
}
