'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PARTIDOS_GRUPOS } from '@/lib/partidos';
import { Partido } from '@/types';

// ─── Constantes de fases eliminatorias ───────────────────────────────────────
const SEMIS: Partido[] = [
  { id: 'S01', fase: 'semis', local: 'Ganador C01', visitante: 'Ganador C02', fecha: '2026-07-14T21:00', sede: 'MetLife Stadium',    ciudad: 'Nueva York / NJ', jugado: false },
  { id: 'S02', fase: 'semis', local: 'Ganador C03', visitante: 'Ganador C04', fecha: '2026-07-15T21:00', sede: 'AT&T Stadium',       ciudad: 'Dallas',          jugado: false },
];
const TERCER: Partido = { id: 'T01', fase: 'semis',  local: 'Perdedor S01', visitante: 'Perdedor S02', fecha: '2026-07-18T16:00', sede: 'Hard Rock Stadium', ciudad: 'Miami',           jugado: false };
const FINAL:  Partido = { id: 'F01', fase: 'final',  local: 'Ganador S01',  visitante: 'Ganador S02',  fecha: '2026-07-19T16:00', sede: 'MetLife Stadium',   ciudad: 'Nueva York / NJ', jugado: false };
const OCTAVOS: Partido[] = Array.from({ length: 16 }, (_, i) => ({
  id: `O${String(i + 1).padStart(2, '0')}`, fase: 'octavos' as const,
  local: `Clasif. ${i * 2 + 1}`, visitante: `Clasif. ${i * 2 + 2}`,
  fecha: '2026-06-29', sede: 'Por confirmar', ciudad: '', jugado: false,
}));
const CUARTOS: Partido[] = Array.from({ length: 8 }, (_, i) => ({
  id: `C${String(i + 1).padStart(2, '0')}`, fase: 'cuartos' as const,
  local: `Gan. O${String(i * 2 + 1).padStart(2, '0')}`, visitante: `Gan. O${String(i * 2 + 2).padStart(2, '0')}`,
  fecha: '2026-07-04', sede: 'Por confirmar', ciudad: '', jugado: false,
}));

// ─── Utilidades de fecha ──────────────────────────────────────────────────────
const GRUPOS_LIST = ['A','B','C','D','E','F','G','H','I','J','K','L'];
const REFRESH = 30_000;

function soloFecha(fecha: string) { return fecha.split('T')[0]; }
function hora(fecha: string) { return fecha.includes('T') ? fecha.split('T')[1] + ' BOT' : ''; }
function labelFecha(fecha: string) {
  const d = new Date(soloFecha(fecha) + 'T12:00:00');
  return d.toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function labelFechaCorta(fecha: string) {
  const d = new Date(soloFecha(fecha) + 'T12:00:00');
  return d.toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ─── Cálculo de tabla de grupo ────────────────────────────────────────────────
interface Fila { equipo: string; pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; dg: number; pts: number; }

function calcularTabla(partidos: Partido[]): Fila[] {
  const equipos = new Set<string>();
  partidos.forEach(p => { equipos.add(p.local); equipos.add(p.visitante); });
  const stats: Record<string, Fila> = {};
  equipos.forEach(e => { stats[e] = { equipo: e, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 }; });
  partidos.forEach(p => {
    if (!p.jugado || p.golesLocal === undefined || p.golesVisitante === undefined) return;
    const L = stats[p.local], V = stats[p.visitante];
    L.pj++; V.pj++;
    L.gf += p.golesLocal;  L.gc += p.golesVisitante;
    V.gf += p.golesVisitante; V.gc += p.golesLocal;
    if (p.golesLocal > p.golesVisitante)      { L.pg++; L.pts += 3; V.pp++; }
    else if (p.golesLocal < p.golesVisitante) { V.pg++; V.pts += 3; L.pp++; }
    else                                       { L.pe++; L.pts++; V.pe++; V.pts++; }
  });
  return Object.values(stats)
    .map(f => ({ ...f, dg: f.gf - f.gc }))
    .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
}

// ─── Componentes ─────────────────────────────────────────────────────────────
function PartidoCard({ p, compact = false }: { p: Partido; compact?: boolean }) {
  return (
    <div className={`rounded-2xl border ${p.jugado ? 'bg-green-900/20 border-green-600/40' : 'bg-white/5 border-white/10'} ${compact ? 'p-3' : 'p-4 md:p-5'}`}>
      {p.grupo && !compact && <p className="text-xs text-green-400 font-bold uppercase tracking-widest mb-2">Grupo {p.grupo}</p>}
      <div className="flex items-center gap-3">
        <span className={`flex-1 text-right font-bold ${compact ? 'text-base' : 'text-lg md:text-xl'} leading-tight`}>{p.local}</span>
        <div className={`text-center shrink-0 ${compact ? 'min-w-[64px]' : 'min-w-[80px] md:min-w-[100px]'}`}>
          {p.jugado
            ? <span className={`bg-green-700/70 px-3 py-1.5 rounded-xl font-black ${compact ? 'text-xl' : 'text-2xl'}`}>{p.golesLocal} - {p.golesVisitante}</span>
            : <span className="text-gray-500 font-black text-xl">vs</span>}
        </div>
        <span className={`flex-1 text-left font-bold ${compact ? 'text-base' : 'text-lg md:text-xl'} leading-tight`}>{p.visitante}</span>
      </div>
      <div className="text-center mt-2 space-y-0.5">
        {!compact && (
          <p className="text-sm font-semibold text-gray-200 capitalize">
            {labelFecha(p.fecha)}
            {p.fecha.includes('T') && <span className="text-yellow-400 ml-2">· {hora(p.fecha)}</span>}
            {p.jugado && <span className="ml-2 text-green-400 font-bold">✓ Finalizado</span>}
          </p>
        )}
        {compact && p.fecha.includes('T') && (
          <p className="text-sm text-yellow-400 font-semibold">{hora(p.fecha)}{p.jugado && <span className="text-green-400 ml-2">✓</span>}</p>
        )}
        {(p.sede || p.ciudad) && (
          <p className="text-xs text-gray-500">📍 {p.sede}{p.ciudad ? `, ${p.ciudad}` : ''}</p>
        )}
      </div>
    </div>
  );
}

function TablaGrupo({ partidos }: { partidos: Partido[] }) {
  const tabla = calcularTabla(partidos);
  const hayDatos = partidos.some(p => p.jugado);
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mt-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wide">
            <th className="text-left px-3 py-2">#</th>
            <th className="text-left px-2 py-2">Equipo</th>
            <th className="px-2 py-2">PJ</th>
            <th className="px-2 py-2">PG</th>
            <th className="px-2 py-2">PE</th>
            <th className="px-2 py-2">PP</th>
            <th className="px-2 py-2">GF</th>
            <th className="px-2 py-2">GC</th>
            <th className="px-2 py-2">DG</th>
            <th className="px-2 py-2 text-yellow-400">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {tabla.map((f, i) => (
            <tr key={f.equipo} className={i < 2 ? 'bg-green-900/20' : ''}>
              <td className="px-3 py-2.5 text-gray-400 font-bold">{i + 1}</td>
              <td className="px-2 py-2.5 font-semibold truncate max-w-[120px]">
                {i < 2 && <span className="text-green-400 mr-1">→</span>}{f.equipo}
              </td>
              <td className="px-2 py-2.5 text-center text-gray-300">{hayDatos ? f.pj : '-'}</td>
              <td className="px-2 py-2.5 text-center text-gray-300">{hayDatos ? f.pg : '-'}</td>
              <td className="px-2 py-2.5 text-center text-gray-300">{hayDatos ? f.pe : '-'}</td>
              <td className="px-2 py-2.5 text-center text-gray-300">{hayDatos ? f.pp : '-'}</td>
              <td className="px-2 py-2.5 text-center text-gray-300">{hayDatos ? f.gf : '-'}</td>
              <td className="px-2 py-2.5 text-center text-gray-300">{hayDatos ? f.gc : '-'}</td>
              <td className="px-2 py-2.5 text-center text-gray-300">{hayDatos ? f.dg : '-'}</td>
              <td className="px-2 py-2.5 text-center font-black text-yellow-400">{hayDatos ? f.pts : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!hayDatos && <p className="text-center text-xs text-gray-600 py-2">La tabla se actualizará con los primeros resultados</p>}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
type Vista = 'grupos' | 'octavos' | 'cuartos' | 'semis' | 'final' | 'agenda';

const VISTAS: { id: Vista; label: string }[] = [
  { id: 'grupos',  label: '📊 Grupos' },
  { id: 'octavos', label: '⚔️ Octavos' },
  { id: 'cuartos', label: '🔥 Cuartos' },
  { id: 'semis',   label: '🌟 Semis' },
  { id: 'final',   label: '🏆 Final' },
  { id: 'agenda',  label: '📆 Agenda' },
];

export default function FixturePage() {
  const [vista, setVista] = useState<Vista>('grupos');
  const [grupoActivo, setGrupoActivo] = useState('A');
  const [resultados, setResultados] = useState<Record<string, { golesLocal: number; golesVisitante: number; video?: string }>>({});
  const [countdown, setCountdown] = useState(REFRESH / 1000);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // ── Fechas disponibles para la agenda ──
  const fechasDisponibles = useMemo(() => {
    const set = new Set(PARTIDOS_GRUPOS.map(p => soloFecha(p.fecha)));
    return Array.from(set).sort();
  }, []);
  const [fechaAgenda, setFechaAgenda] = useState(fechasDisponibles[0] ?? '');

  const fetchResultados = useCallback(async () => {
    try {
      const res = await fetch('/api/resultados-publicos', { cache: 'no-store' });
      const data: Array<{ id: string; golesLocal: number; golesVisitante: number }> = await res.json();
      const map: Record<string, { golesLocal: number; golesVisitante: number }> = {};
      for (const r of data) map[r.id] = { golesLocal: r.golesLocal, golesVisitante: r.golesVisitante };
      setResultados(map);
      setLastUpdate(new Date());
      setCountdown(REFRESH / 1000);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchResultados();
    const iv = setInterval(fetchResultados, REFRESH);
    return () => clearInterval(iv);
  }, [fetchResultados]);

  useEffect(() => {
    const tick = setInterval(() => setCountdown(c => c <= 1 ? REFRESH / 1000 : c - 1), 1000);
    return () => clearInterval(tick);
  }, []);

  function enrich(partidos: Partido[]): Partido[] {
    return partidos.map(p => {
      const r = resultados[p.id];
      return r ? { ...p, golesLocal: r.golesLocal, golesVisitante: r.golesVisitante, jugado: true } : p;
    });
  }

  const gruposByLetter = useMemo(() => PARTIDOS_GRUPOS.reduce<Record<string, Partido[]>>((acc, p) => {
    const g = p.grupo ?? 'X';
    if (!acc[g]) acc[g] = [];
    acc[g].push(p);
    return acc;
  }, {}), []);

  const partidosGrupo = enrich(gruposByLetter[grupoActivo] ?? []);

  // Partidos del día seleccionado (solo grupos)
  const partidosDelDia = useMemo(() =>
    enrich(PARTIDOS_GRUPOS.filter(p => soloFecha(p.fecha) === fechaAgenda))
      .sort((a, b) => a.fecha.localeCompare(b.fecha)),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [fechaAgenda, resultados]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-950 to-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-4">
          <h1 className="text-4xl md:text-5xl font-black mb-1">📅 Fixture 2026</h1>
          <p className="text-green-300 text-sm">Horarios en hora Bolivia (BOT = GMT-4)</p>
        </div>

        {/* Indicador en vivo */}
        <div className="flex items-center justify-center gap-2 mb-5 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
          <span>En vivo · actualiza en {countdown}s</span>
          {lastUpdate && <span>· {lastUpdate.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>}
          <button onClick={fetchResultados} className="text-green-400 hover:text-green-300 underline ml-1">↻</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {VISTAS.map(v => (
            <button key={v.id} onClick={() => setVista(v.id)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                vista === v.id ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}>
              {v.label}
            </button>
          ))}
        </div>

        {/* ── GRUPOS ── */}
        {vista === 'grupos' && (
          <>
            {/* Selector de grupo */}
            <div className="flex flex-wrap gap-2 mb-5">
              {GRUPOS_LIST.filter(g => gruposByLetter[g]).map(g => {
                const jugadosG = enrich(gruposByLetter[g] ?? []).filter(p => p.jugado).length;
                return (
                  <button key={g} onClick={() => setGrupoActivo(g)}
                    className={`w-11 h-11 rounded-xl font-black text-base transition-colors relative ${
                      grupoActivo === g ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}>
                    {g}
                    {jugadosG > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                        {jugadosG === (gruposByLetter[g]?.length ?? 0) ? '✓' : jugadosG}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <h2 className="text-2xl font-black text-green-400 mb-1">Grupo {grupoActivo}</h2>

            {/* Tabla de posiciones del grupo */}
            <TablaGrupo partidos={partidosGrupo} />

            {/* Partidos del grupo */}
            <div className="space-y-3 mt-5">
              {partidosGrupo.map(p => <PartidoCard key={p.id} p={p} />)}
            </div>
          </>
        )}

        {/* ── OCTAVOS ── */}
        {vista === 'octavos' && (
          <>
            <h2 className="text-2xl font-black text-yellow-400 mb-2">Octavos de Final</h2>
            <p className="text-gray-400 text-sm mb-5">Del 29 de junio al 2 de julio de 2026</p>
            <div className="space-y-4">
              {enrich(OCTAVOS).map((p, i) => (
                <div key={p.id}>
                  {i % 2 === 0 && <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 mt-4">Llave {Math.floor(i/2) + 1}</p>}
                  <PartidoCard p={p} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── CUARTOS ── */}
        {vista === 'cuartos' && (
          <>
            <h2 className="text-2xl font-black text-orange-400 mb-2">Cuartos de Final</h2>
            <p className="text-gray-400 text-sm mb-5">Del 4 al 5 de julio de 2026</p>
            <div className="space-y-3">
              {enrich(CUARTOS).map(p => <PartidoCard key={p.id} p={p} />)}
            </div>
          </>
        )}

        {/* ── SEMIS ── */}
        {vista === 'semis' && (
          <>
            <h2 className="text-2xl font-black text-purple-400 mb-5">Semifinales</h2>
            <div className="space-y-4 mb-6">
              {enrich(SEMIS).map((p, i) => (
                <div key={p.id}>
                  <p className="text-sm text-gray-400 mb-2 font-semibold">Semifinal {i + 1}</p>
                  <PartidoCard p={p} />
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400 mb-2 font-semibold">🥉 Tercer Lugar</p>
            <PartidoCard p={enrich([TERCER])[0]} />
          </>
        )}

        {/* ── FINAL ── */}
        {vista === 'final' && (
          <div className="text-center">
            <div className="text-7xl mb-4">🏆</div>
            <h2 className="text-4xl font-black text-yellow-400 mb-2">Gran Final</h2>
            <p className="text-gray-400 mb-8">19 de julio de 2026 · MetLife Stadium, Nueva York</p>
            <PartidoCard p={enrich([FINAL])[0]} />
          </div>
        )}

        {/* ── AGENDA DIARIA ── */}
        {vista === 'agenda' && (
          <>
            <h2 className="text-2xl font-black text-blue-400 mb-4">Agenda Diaria</h2>

            {/* Selector de fecha */}
            <div className="flex flex-wrap gap-2 mb-6">
              {fechasDisponibles.map(f => (
                <button key={f} onClick={() => setFechaAgenda(f)}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    fechaAgenda === f ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}>
                  {labelFechaCorta(f)}
                </button>
              ))}
            </div>

            {/* Resumen del día */}
            {fechaAgenda && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold capitalize">{labelFecha(fechaAgenda)}</h3>
                  <span className="text-sm text-gray-400 bg-white/10 px-3 py-1 rounded-full">
                    {partidosDelDia.length} partido{partidosDelDia.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Horarios rápidos */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {partidosDelDia.map(p => (
                    <span key={p.id} className={`text-xs px-2 py-1 rounded-lg font-semibold ${
                      p.jugado ? 'bg-green-700/40 text-green-300' : 'bg-white/10 text-gray-300'
                    }`}>
                      {hora(p.fecha)} · Gr.{p.grupo}
                    </span>
                  ))}
                </div>

                <div className="space-y-3">
                  {partidosDelDia.map(p => <PartidoCard key={p.id} p={p} compact />)}
                </div>

                {partidosDelDia.length === 0 && (
                  <p className="text-center text-gray-500 py-10">No hay partidos este día</p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
