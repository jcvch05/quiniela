import { NextResponse } from 'next/server';
import { getCollection, getDocument, createDocument, updateDocument } from '@/lib/firebase';
import { fetchFinishedMatches, toSpanish } from '@/lib/footballApi';
import { PARTIDOS_GRUPOS } from '@/lib/partidos';
import { recalcularTodos } from '@/lib/recalcularPuntos';

const SYNC_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutos entre syncs

const LOOKUP = new Map<string, string>(
  PARTIDOS_GRUPOS.map(p => [`${p.local}|${p.visitante}`, p.id])
);

async function syncResultados(): Promise<number> {
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

    try {
      const existing = await getDocument('resultados', partidoId) as Record<string, unknown>;
      if (Number(existing.golesLocal) === gl && Number(existing.golesVisitante) === gv) continue;
      await updateDocument('resultados', partidoId, { golesLocal: gl, golesVisitante: gv, jugado: true });
    } catch {
      await createDocument('resultados', partidoId, { golesLocal: gl, golesVisitante: gv, jugado: true });
    }
    updated++;
  }

  if (updated > 0) await recalcularTodos();
  return updated;
}

export async function GET() {
  // Auto-sync si hay API key y pasaron más de 2 minutos desde el último sync
  if (process.env.FOOTBALL_DATA_API_KEY) {
    try {
      let lastSync = 0;
      try {
        const cfg = await getDocument('config', 'sync') as Record<string, unknown>;
        lastSync = Number(cfg.lastSync ?? 0);
      } catch { /* primera vez, no existe */ }

      if (Date.now() - lastSync > SYNC_COOLDOWN_MS) {
        // Actualizar timestamp ANTES del sync para que requests concurrentes no dupliquen
        const now = Date.now();
        try {
          await updateDocument('config', 'sync', { lastSync: now });
        } catch {
          await createDocument('config', 'sync', { lastSync: now });
        }
        await syncResultados();
      }
    } catch (e) {
      console.error('Auto-sync error:', e);
    }
  }

  try {
    const resultados = await getCollection('resultados');
    return NextResponse.json(resultados, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
