'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PARTIDOS_GRUPOS, PARTIDOS_DIECISEISAVOS } from '@/lib/partidos';
import { bandera } from '@/lib/banderas';
import { Partido } from '@/types';

// ─── Partidos eliminatorias placeholder ──────────────────────────────────────
const CUARTOS: Partido[] = Array.from({ length: 8 }, (_, i) => ({
  id: `C${String(i + 1).padStart(2, '0')}`, fase: 'cuartos' as const,
  local: `Por confirmar`, visitante: `Por confirmar`,
  fecha: '2026-07-04', sede: 'Por confirmar', ciudad: '', jugado: false,
}));
const SEMIS: Partido[] = [
  { id: 'S01', fase: 'semis', local: 'Por confirmar', visitante: 'Por confirmar', fecha: '2026-07-14T21:00', sede: 'MetLife Stadium', ciudad: 'Nueva York / NJ', jugado: false },
  { id: 'S02', fase: 'semis', local: 'Por confirmar', visitante: 'Por confirmar', fecha: '2026-07-15T21:00', sede: 'AT&T Stadium', ciudad: 'Dallas', jugado: false },
];
const FINAL: Partido = { id: 'F01', fase: 'final', local: 'Por confirmar', visitante: 'Por confirmar', fecha: '2026-07-19T16:00', sede: 'MetLife Stadium', ciudad: 'Nueva York / NJ', jugado: false };

const GRUPOS_LIST = ['A','B','C','D','E','F','G','H','I','J','K','L'];
const REFRESH = 30_000;

function soloFecha(fecha: string) { return fecha.split('T')[0]; }
function hora(fecha: string) { return fecha.includes('T') ? fecha.split('T')[1].slice(0,5) + ' BOT' : ''; }
function labelFecha(fecha: string) {
  return new Date(soloFecha(fecha) + 'T12:00:00').toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' });
}

// ─── Tabla de grupo ───────────────────────────────────────────────────────────
interface Fila { equipo: string; pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; dg: number; pts: number }

function calcularTabla(partidos: Partido[]): Fila[] {
  const stats: Record<string, Fila> = {};
  partidos.forEach(p => {
    if (!stats[p.local]) stats[p.local] = { equipo: p.local, pj:0,pg:0,pe:0,pp:0,gf:0,gc:0,dg:0,pts:0 };
    if (!stats[p.visitante]) stats[p.visitante] = { equipo: p.visitante, pj:0,pg:0,pe:0,pp:0,gf:0,gc:0,dg:0,pts:0 };
    if (!p.jugado || p.golesLocal === undefined || p.golesVisitante === undefined) return;
    const L = stats[p.local], V = stats[p.visitante];
    L.pj++; V.pj++;
    L.gf += p.golesLocal; L.gc += p.golesVisitante;
    V.gf += p.golesVisitante; V.gc += p.golesLocal;
    if (p.golesLocal > p.golesVisitante)      { L.pg++; L.pts+=3; V.pp++; }
    else if (p.golesLocal < p.golesVisitante) { V.pg++; V.pts+=3; L.pp++; }
    else { L.pe++; L.pts++; V.pe++; V.pts++; }
  });
  return Object.values(stats).map(f=>({...f,dg:f.gf-f.gc})).sort((a,b)=>b.pts-a.pts||b.dg-a.dg||b.gf-a.gf);
}

// ─── Modal de apuestas ────────────────────────────────────────────────────────
interface PredParticipante {
  nombre: string;
  pred?: { golesLocal: number; golesVisitante: number };
  pts: number;
}

function ptsPartido(gl: number, gv: number, pl: number, pv: number, es16: boolean): number {
  const max = es16 ? 10 : 8;
  if (gl === pl && gv === pv) return max;
  if (gl - gv === pl - pv) return 5;
  if (gl !== gv && (gl > gv) === (pl > pv)) return 3;
  return 0;
}

function ModalApuestas({ partido, onClose }: { partido: Partido & { golesLocal?: number; golesVisitante?: number }; onClose: () => void }) {
  const [preds, setPreds] = useState<PredParticipante[]>([]);
  const [loading, setLoading] = useState(true);
  const es16 = partido.id.startsWith('D');
  const jugado = partido.jugado && partido.golesLocal !== undefined;

  useEffect(() => {
    fetch('/api/participantes', { cache: 'no-store' })
      .then(r => r.json())
      .then((data: Array<{ nombre: string; pronosticosGrupos?: Record<string,{golesLocal:number;golesVisitante:number}>; pronosticosDieciseisavos?: Record<string,{golesLocal:number;golesVisitante:number}> }>) => {
        const resultado = jugado ? { gl: partido.golesLocal!, gv: partido.golesVisitante! } : null;
        const items: PredParticipante[] = data.map(p => {
          const pred = es16
            ? p.pronosticosDieciseisavos?.[partido.id]
            : p.pronosticosGrupos?.[partido.id];
          const pts = (resultado && pred)
            ? ptsPartido(resultado.gl, resultado.gv, pred.golesLocal, pred.golesVisitante, es16)
            : 0;
          return { nombre: p.nombre, pred, pts };
        });
        items.sort((a, b) => b.pts - a.pts || (a.pred ? 0 : 1) - (b.pred ? 0 : 1));
        setPreds(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [partido.id, es16, jugado, partido.golesLocal, partido.golesVisitante]);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 px-2" onClick={onClose}>
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">{partido.id} · {partido.ciudad}</p>
            <p className="font-black text-base">{bandera(partido.local)} {partido.local} vs {partido.visitante} {bandera(partido.visitante)}</p>
            {jugado && (
              <p className="text-yellow-400 font-black text-xl">{partido.golesLocal} – {partido.golesVisitante}</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl ml-3">✕</button>
        </div>

        {/* Apuestas */}
        <div className="p-4 space-y-2">
          <p className="text-xs text-gray-500 mb-3">
            {jugado ? 'Apuestas vs resultado final' : 'Apuestas registradas (partido no jugado aún)'}
          </p>
          {loading && <p className="text-gray-400 text-sm text-center py-4">Cargando...</p>}
          {!loading && preds.map(p => (
            <div key={p.nombre} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
              jugado && p.pred
                ? p.pts >= (es16 ? 10 : 8) ? 'bg-yellow-900/30 border border-yellow-500/40'
                : p.pts === 5 ? 'bg-blue-900/30 border border-blue-500/30'
                : p.pts === 3 ? 'bg-green-900/20 border border-green-600/20'
                : p.pts === 0 && p.pred ? 'bg-white/3 border border-white/5'
                : 'bg-white/3 border border-white/5'
                : 'bg-white/5 border border-white/5'
            }`}>
              <span className="flex-1 text-sm font-semibold truncate">{p.nombre}</span>
              {p.pred
                ? <span className="font-black text-base text-white">{p.pred.golesLocal} – {p.pred.golesVisitante}</span>
                : <span className="text-gray-600 text-sm">Sin apuesta</span>
              }
              {jugado && p.pred && (
                <span className={`text-sm font-black w-10 text-right ${
                  p.pts >= (es16 ? 10 : 8) ? 'text-yellow-400' : p.pts >= 5 ? 'text-blue-300' : p.pts >= 3 ? 'text-green-400' : 'text-gray-600'
                }`}>
                  +{p.pts}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tarjeta de partido ───────────────────────────────────────────────────────
function PartidoCard({ p, onClick }: { p: Partido; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border transition-all ${
        p.jugado ? 'bg-green-900/20 border-green-600/40' : 'bg-white/5 border-white/10'
      } ${onClick ? 'cursor-pointer hover:border-yellow-400/60 hover:bg-white/10 active:scale-[0.98]' : ''} p-4`}>
      {p.grupo && <p className="text-xs text-green-400 font-bold uppercase tracking-widest mb-2">Grupo {p.grupo}</p>}
      <div className="flex items-center gap-2">
        <span className="flex-1 text-right font-bold text-base leading-tight">{bandera(p.local)} {p.local}</span>
        <div className="shrink-0 min-w-[72px] text-center">
          {p.jugado && p.golesLocal !== undefined
            ? <span className="bg-green-700/70 px-3 py-1 rounded-xl font-black text-xl">{p.golesLocal} – {p.golesVisitante}</span>
            : <span className="text-gray-500 font-black text-lg">vs</span>}
        </div>
        <span className="flex-1 font-bold text-base leading-tight">{p.visitante} {bandera(p.visitante)}</span>
      </div>
      <div className="text-center mt-2 space-y-0.5">
        <p className="text-sm text-gray-300 capitalize">
          {labelFecha(p.fecha)}
          {p.fecha.includes('T') && <span className="text-yellow-400 ml-2">· {hora(p.fecha)}</span>}
          {p.jugado && <span className="text-green-400 ml-2">✓</span>}
        </p>
        {(p.sede || p.ciudad) && <p className="text-xs text-gray-500">📍 {p.sede}{p.ciudad ? `, ${p.ciudad}` : ''}</p>}
        {onClick && <p className="text-xs text-yellow-400/70 mt-1">Toca para ver apuestas →</p>}
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
            <th className="px-2 py-2">PJ</th><th className="px-2 py-2">PG</th><th className="px-2 py-2">PE</th>
            <th className="px-2 py-2">PP</th><th className="px-2 py-2">GF</th><th className="px-2 py-2">GC</th>
            <th className="px-2 py-2">DG</th><th className="px-2 py-2 text-yellow-400">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {tabla.map((f, i) => (
            <tr key={f.equipo} className={i < 2 ? 'bg-green-900/20' : ''}>
              <td className="px-3 py-2 text-gray-400 font-bold">{i + 1}</td>
              <td className="px-2 py-2 font-semibold truncate max-w-[110px]">{i < 2 && <span className="text-green-400 mr-1">→</span>}{f.equipo}</td>
              <td className="px-2 py-2 text-center text-gray-300">{hayDatos ? f.pj : '-'}</td>
              <td className="px-2 py-2 text-center text-gray-300">{hayDatos ? f.pg : '-'}</td>
              <td className="px-2 py-2 text-center text-gray-300">{hayDatos ? f.pe : '-'}</td>
              <td className="px-2 py-2 text-center text-gray-300">{hayDatos ? f.pp : '-'}</td>
              <td className="px-2 py-2 text-center text-gray-300">{hayDatos ? f.gf : '-'}</td>
              <td className="px-2 py-2 text-center text-gray-300">{hayDatos ? f.gc : '-'}</td>
              <td className="px-2 py-2 text-center text-gray-300">{hayDatos ? f.dg : '-'}</td>
              <td className="px-2 py-2 text-center font-black text-yellow-400">{hayDatos ? f.pts : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
type Vista = 'grupos' | 'dieciseisavos' | 'cuartos' | 'semis' | 'final';

const VISTAS: { id: Vista; label: string }[] = [
  { id: 'grupos',        label: '📊 Grupos' },
  { id: 'dieciseisavos', label: '⚔️ 16avos' },
  { id: 'cuartos',       label: '🔥 Cuartos' },
  { id: 'semis',         label: '🌟 Semis' },
  { id: 'final',         label: '🏆 Final' },
];

export default function FixturePage() {
  const [vista, setVista] = useState<Vista>('dieciseisavos');
  const [grupoActivo, setGrupoActivo] = useState('A');
  const [resultados, setResultados] = useState<Record<string, { golesLocal: number; golesVisitante: number; jugado?: boolean }>>({});
  const [countdown, setCountdown] = useState(REFRESH / 1000);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [partidoModal, setPartidoModal] = useState<Partido | null>(null);

  const fetchResultados = useCallback(async () => {
    try {
      const res = await fetch('/api/resultados-publicos', { cache: 'no-store' });
      const data: Array<{ id: string; golesLocal: number; golesVisitante: number; jugado?: boolean }> = await res.json();
      const map: Record<string, { golesLocal: number; golesVisitante: number; jugado?: boolean }> = {};
      for (const r of data) map[r.id] = r;
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

  function enrich<T extends { id: string }>(partidos: T[]): (T & Partido) {
    return partidos.map(p => {
      const r = resultados[p.id];
      return r ? { ...p, golesLocal: r.golesLocal, golesVisitante: r.golesVisitante, jugado: true } : p;
    }) as unknown as (T & Partido);
  }

  function enrichArr(partidos: Partido[]): Partido[] {
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

  const partidosGrupo = enrichArr(gruposByLetter[grupoActivo] ?? []);
  const partidos16 = enrichArr(PARTIDOS_DIECISEISAVOS as unknown as Partido[]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-950 to-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-black mb-1">📅 Fixture 2026</h1>
          <p className="text-green-300 text-sm">Toca un partido para ver las apuestas · Horarios BOT (GMT-4)</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-5 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
          <span>En vivo · actualiza en {countdown}s</span>
          {lastUpdate && <span>· {lastUpdate.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>}
          <button onClick={fetchResultados} className="text-green-400 hover:text-green-300 underline ml-1">↻</button>
        </div>

        {/* Tabs de fase */}
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
            <div className="flex flex-wrap gap-2 mb-5">
              {GRUPOS_LIST.filter(g => gruposByLetter[g]).map(g => {
                const jugados = enrichArr(gruposByLetter[g] ?? []).filter(p => p.jugado).length;
                const total = gruposByLetter[g]?.length ?? 0;
                return (
                  <button key={g} onClick={() => setGrupoActivo(g)}
                    className={`w-11 h-11 rounded-xl font-black text-base transition-colors relative ${
                      grupoActivo === g ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}>
                    {g}
                    {jugados > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                        {jugados === total ? '✓' : jugados}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <h2 className="text-2xl font-black text-green-400 mb-1">Grupo {grupoActivo}</h2>
            <TablaGrupo partidos={partidosGrupo} />

            <div className="space-y-3 mt-5">
              {partidosGrupo.map(p => (
                <PartidoCard key={p.id} p={p} onClick={() => setPartidoModal(p)} />
              ))}
            </div>
          </>
        )}

        {/* ── 16AVOS ── */}
        {vista === 'dieciseisavos' && (
          <>
            <h2 className="text-2xl font-black text-yellow-400 mb-1">16avos de Final</h2>
            <p className="text-gray-400 text-sm mb-5">28 jun – 3 jul 2026 · Toca un partido para ver las apuestas</p>
            <div className="space-y-3">
              {partidos16.map(p => (
                <PartidoCard key={p.id} p={p} onClick={() => setPartidoModal(p)} />
              ))}
            </div>
          </>
        )}

        {/* ── CUARTOS ── */}
        {vista === 'cuartos' && (
          <>
            <h2 className="text-2xl font-black text-orange-400 mb-2">Cuartos de Final</h2>
            <p className="text-gray-400 text-sm mb-5">4–5 de julio de 2026</p>
            <div className="space-y-3">
              {enrichArr(CUARTOS).map(p => (
                <PartidoCard key={p.id} p={p} onClick={() => setPartidoModal(p)} />
              ))}
            </div>
          </>
        )}

        {/* ── SEMIS ── */}
        {vista === 'semis' && (
          <>
            <h2 className="text-2xl font-black text-purple-400 mb-5">Semifinales</h2>
            <div className="space-y-4">
              {enrichArr(SEMIS).map((p, i) => (
                <div key={p.id}>
                  <p className="text-sm text-gray-400 mb-2 font-semibold">Semifinal {i + 1}</p>
                  <PartidoCard p={p} onClick={() => setPartidoModal(p)} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── FINAL ── */}
        {vista === 'final' && (
          <div className="text-center">
            <div className="text-7xl mb-4">🏆</div>
            <h2 className="text-4xl font-black text-yellow-400 mb-2">Gran Final</h2>
            <p className="text-gray-400 mb-8">19 de julio de 2026 · MetLife Stadium, Nueva York</p>
            <PartidoCard p={enrichArr([FINAL])[0]} onClick={() => setPartidoModal(enrichArr([FINAL])[0])} />
          </div>
        )}
      </div>

      {/* Modal apuestas */}
      {partidoModal && (
        <ModalApuestas partido={partidoModal} onClose={() => setPartidoModal(null)} />
      )}
    </main>
  );
}
