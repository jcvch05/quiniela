import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/firebase';

export async function GET(req: NextRequest) {
  // El middleware ya verifica que el usuario esté logueado
  // Solo verificamos que venga con cookie de sesión
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const start = Date.now();

  const [participantes, resultados, emailLogs] = await Promise.all([
    getCollection('participantes').catch(() => []),
    getCollection('resultados').catch(() => []),
    getCollection('logs_email').catch(() => []),
  ]);

  const firestoreMs = Date.now() - start;

  const parts = participantes as Record<string, unknown>[];
  const logs = emailLogs as Record<string, unknown>[];

  const pagados = parts.filter(p => p.pagado);
  const conFase1 = parts.filter(p => p.pronosticosGrupos && Object.keys(p.pronosticosGrupos as object).length > 0);
  const conOctavos = parts.filter(p => p.octavos && (p.octavos as string[]).length > 0);
  const conCuartos = parts.filter(p => p.cuartos && (p.cuartos as string[]).length > 0);
  const conSemis = parts.filter(p => p.semis && (p.semis as string[]).length > 0);

  const emailsOk = logs.filter(l => l.ok === true).length;
  const emailsFail = logs.filter(l => l.ok === false).length;

  const ultimoResultado = (resultados as Record<string, unknown>[])
    .sort((a, b) => String(b.id ?? '').localeCompare(String(a.id ?? '')))
    .at(0);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    sistema: {
      firestoreMs,
      firestoreOk: firestoreMs < 5000,
      partidos_cargados: resultados.length,
      ultimo_resultado: ultimoResultado?.id ?? null,
    },
    stats: {
      total: parts.length,
      pagados: pagados.length,
      pendientes_pago: parts.length - pagados.length,
      pozo_bs: pagados.length * 100,
      con_fase1: conFase1.length,
      con_octavos: conOctavos.length,
      con_cuartos: conCuartos.length,
      con_semis: conSemis.length,
    },
    emails: {
      total: logs.length,
      enviados_ok: emailsOk,
      fallidos: emailsFail,
      recientes: logs
        .sort((a, b) => String(b.timestamp ?? '').localeCompare(String(a.timestamp ?? '')))
        .slice(0, 20)
        .map(l => ({
          id: l.id, to: l.to, nombre: l.nombre,
          fase: l.fase, ok: l.ok, error: l.error,
          timestamp: l.timestamp,
        })),
    },
    participantes: parts
      .sort((a, b) => (b.puntos as number ?? 0) - (a.puntos as number ?? 0))
      .map(p => ({
        id: p.id, nombre: p.nombre, telefono: p.telefono, email: p.email,
        pagado: p.pagado, puntos: p.puntos ?? 0,
        fechaRegistro: p.fechaRegistro,
        fases: {
          f1: !!(p.pronosticosGrupos && Object.keys(p.pronosticosGrupos as object).length > 0),
          f2: !!(p.octavos && (p.octavos as string[]).length > 0),
          f3: !!(p.cuartos && (p.cuartos as string[]).length > 0),
          f4: !!(p.semis && (p.semis as string[]).length > 0),
        },
        campeon: (p.pronosticosEspeciales as Record<string, unknown>)?.campeon ?? '-',
      })),
  }, { headers: { 'Cache-Control': 'no-store' } });
}
