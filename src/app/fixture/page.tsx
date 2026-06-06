'use client';

import { useState, useEffect, useCallback } from 'react';
import { PARTIDOS_GRUPOS } from '@/lib/partidos';
import { Partido } from '@/types';

const FASES = [
  { id: 'grupos',  label: '🗓️ Grupos' },
  { id: 'octavos', label: '⚔️ Octavos' },
  { id: 'cuartos', label: '🔥 Cuartos' },
  { id: 'semis',   label: '🌟 Semis' },
  { id: 'final',   label: '🏆 Final' },
];

const GRUPOS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

const OCTAVOS = Array.from({ length: 16 }, (_, i) => ({
  id: `O${String(i + 1).padStart(2, '0')}`, fase: 'octavos' as const,
  local: `Clasificado ${i * 2 + 1}`, visitante: `Clasificado ${i * 2 + 2}`,
  fecha: '2026-06-29', sede: 'Por confirmar', ciudad: '', jugado: false,
}));

const CUARTOS = Array.from({ length: 8 }, (_, i) => ({
  id: `C${String(i + 1).padStart(2, '0')}`, fase: 'cuartos' as const,
  local: `Ganador O${String(i * 2 + 1).padStart(2, '0')}`,
  visitante: `Ganador O${String(i * 2 + 2).padStart(2, '0')}`,
  fecha: '2026-07-04', sede: 'Por confirmar', ciudad: '', jugado: false,
}));

const SEMIS: Partido[] = [
  { id: 'S01', fase: 'semis', local: 'Ganador C01', visitante: 'Ganador C02', fecha: '2026-07-14T21:00', sede: 'MetLife Stadium',    ciudad: 'Nueva York / NJ', jugado: false },
  { id: 'S02', fase: 'semis', local: 'Ganador C03', visitante: 'Ganador C04', fecha: '2026-07-15T21:00', sede: 'AT&T Stadium',       ciudad: 'Dallas',          jugado: false },
];

const TERCER: Partido = { id: 'T01', fase: 'semis', local: 'Perdedor S01', visitante: 'Perdedor S02', fecha: '2026-07-18T16:00', sede: 'Hard Rock Stadium', ciudad: 'Miami', jugado: false };
const FINAL: Partido  = { id: 'F01', fase: 'final', local: 'Ganador S01',  visitante: 'Ganador S02',  fecha: '2026-07-19T16:00', sede: 'MetLife Stadium',   ciudad: 'Nueva York / NJ', jugado: false };

const REFRESH_INTERVAL = 30_000;

function formatFecha(fecha: string) {
  const soloFecha = fecha.includes('T') ? fecha.split('T')[0] : fecha;
  const d = new Date(soloFecha + 'T12:00:00');
  return d.toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatHora(fecha: string) {
  if (!fecha.includes('T')) return '';
  return fecha.split('T')[1] + ' BOT';
}

function PartidoCard({ p, grande = false }: { p: Partido; grande?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 md:p-5 ${p.jugado ? 'bg-green-900/20 border-green-600/40' : 'bg-white/5 border-white/10'}`}>
      <div className="flex items-center gap-3 md:gap-5">
        <span className={`flex-1 text-right font-bold leading-tight ${grande ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}`}>{p.local}</span>
        <div className="text-center shrink-0 min-w-[80px] md:min-w-[100px]">
          {p.jugado ? (
            <span className={`bg-green-700/70 px-4 py-2 rounded-xl font-black ${grande ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
              {p.golesLocal} - {p.golesVisitante}
            </span>
          ) : (
            <span className={`text-gray-500 font-black ${grande ? 'text-2xl' : 'text-xl'}`}>vs</span>
          )}
        </div>
        <span className={`flex-1 text-left font-bold leading-tight ${grande ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}`}>{p.visitante}</span>
      </div>

      <div className="text-center mt-3 space-y-1">
        <p className="text-sm font-semibold text-gray-200 capitalize">
          {formatFecha(p.fecha)}
          {p.fecha.includes('T') && <span className="text-yellow-400 ml-2">· {formatHora(p.fecha)}</span>}
          {p.jugado && <span className="ml-2 text-green-400 font-bold">✓ Finalizado</span>}
        </p>
        {(p.sede || p.ciudad) && (
          <p className="text-xs text-gray-500">📍 {p.sede}{p.ciudad ? `, ${p.ciudad}` : ''}</p>
        )}
      </div>
    </div>
  );
}

export default function FixturePage() {
  const [faseActiva, setFaseActiva] = useState('grupos');
  const [grupoActivo, setGrupoActivo] = useState('A');
  const [resultados, setResultados] = useState<Record<string, { golesLocal: number; golesVisitante: number }>>({});
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchResultados = useCallback(async () => {
    try {
      const res = await fetch('/api/resultados-publicos', { cache: 'no-store' });
      const data: Array<{ id: string; golesLocal: number; golesVisitante: number }> = await res.json();
      const map: Record<string, { golesLocal: number; golesVisitante: number }> = {};
      for (const r of data) map[r.id] = { golesLocal: r.golesLocal, golesVisitante: r.golesVisitante };
      setResultados(map);
      setLastUpdate(new Date());
      setCountdown(REFRESH_INTERVAL / 1000);
    } catch { /* silently ignore */ }
  }, []);

  useEffect(() => {
    fetchResultados();
    const interval = setInterval(fetchResultados, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchResultados]);

  useEffect(() => {
    const tick = setInterval(() => setCountdown(c => c <= 1 ? REFRESH_INTERVAL / 1000 : c - 1), 1000);
    return () => clearInterval(tick);
  }, []);

  // Merge resultados con partidos
  function enrich(partidos: Partido[]): Partido[] {
    return partidos.map(p => {
      const r = resultados[p.id];
      return r ? { ...p, golesLocal: r.golesLocal, golesVisitante: r.golesVisitante, jugado: true } : p;
    });
  }

  const gruposByLetter = PARTIDOS_GRUPOS.reduce<Record<string, Partido[]>>((acc, p) => {
    const g = p.grupo ?? 'X';
    if (!acc[g]) acc[g] = [];
    acc[g].push(p);
    return acc;
  }, {});

  const partidosGrupo = enrich(gruposByLetter[grupoActivo] ?? []);
  const jugados = partidosGrupo.filter(p => p.jugado).length;
  const total = partidosGrupo.length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-950 to-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-4">
          <h1 className="text-4xl md:text-5xl font-black mb-1">📅 Fixture 2026</h1>
          <p className="text-green-300 text-sm">Horarios en hora Bolivia (BOT = GMT-4)</p>
        </div>

        {/* Indicador en vivo */}
        <div className="flex items-center justify-center gap-2 mb-6 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
          <span>En vivo · actualiza en {countdown}s</span>
          {lastUpdate && <span>· {lastUpdate.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>}
          <button onClick={fetchResultados} className="text-green-400 hover:text-green-300 underline ml-1">↻</button>
        </div>

        {/* Tabs de fases */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {FASES.map(f => (
            <button key={f.id} onClick={() => setFaseActiva(f.id)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                faseActiva === f.id ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* GRUPOS */}
        {faseActiva === 'grupos' && (
          <>
            <div className="flex flex-wrap gap-2 mb-5">
              {GRUPOS.filter(g => gruposByLetter[g]).map(g => {
                const jugadosG = enrich(gruposByLetter[g] ?? []).filter(p => p.jugado).length;
                const totalG = (gruposByLetter[g] ?? []).length;
                return (
                  <button key={g} onClick={() => setGrupoActivo(g)}
                    className={`w-11 h-11 rounded-xl font-black text-base transition-colors relative ${
                      grupoActivo === g ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}>
                    {g}
                    {jugadosG > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                        {jugadosG}
                      </span>
                    )}
                    {jugadosG === totalG && totalG > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold">✓</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-green-400">Grupo {grupoActivo}</h2>
              <span className="text-sm text-gray-400">{jugados}/{total} jugados</span>
            </div>

            <div className="space-y-3">
              {partidosGrupo.map(p => <PartidoCard key={p.id} p={p} />)}
            </div>
          </>
        )}

        {/* OCTAVOS */}
        {faseActiva === 'octavos' && (
          <>
            <h2 className="text-2xl font-black text-yellow-400 mb-2">Octavos de Final</h2>
            <p className="text-gray-400 text-sm mb-5">Del 29 de junio al 2 de julio de 2026</p>
            <div className="space-y-4">
              {enrich(OCTAVOS as Partido[]).map((p, i) => (
                <div key={p.id}>
                  {i % 2 === 0 && <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 mt-4">Llave {Math.floor(i/2) + 1}</p>}
                  <PartidoCard p={p} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* CUARTOS */}
        {faseActiva === 'cuartos' && (
          <>
            <h2 className="text-2xl font-black text-orange-400 mb-2">Cuartos de Final</h2>
            <p className="text-gray-400 text-sm mb-5">Del 4 al 5 de julio de 2026</p>
            <div className="space-y-3">
              {enrich(CUARTOS as Partido[]).map(p => <PartidoCard key={p.id} p={p} />)}
            </div>
          </>
        )}

        {/* SEMIS */}
        {faseActiva === 'semis' && (
          <>
            <h2 className="text-2xl font-black text-purple-400 mb-5">Semifinales</h2>
            <div className="space-y-4 mb-8">
              {enrich(SEMIS).map((p, i) => (
                <div key={p.id}>
                  <p className="text-sm text-gray-400 mb-2 font-semibold">Semifinal {i + 1}</p>
                  <PartidoCard p={p} grande />
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400 mb-2 font-semibold">Tercer Lugar</p>
            <PartidoCard p={enrich([TERCER])[0]} />
          </>
        )}

        {/* FINAL */}
        {faseActiva === 'final' && (
          <div className="text-center">
            <div className="text-7xl mb-4">🏆</div>
            <h2 className="text-4xl font-black text-yellow-400 mb-2">Gran Final</h2>
            <p className="text-gray-400 mb-8">19 de julio de 2026 · MetLife Stadium, Nueva York</p>
            <PartidoCard p={enrich([FINAL])[0]} grande />
          </div>
        )}
      </div>
    </main>
  );
}
