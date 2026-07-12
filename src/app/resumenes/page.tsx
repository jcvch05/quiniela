'use client';

import { useEffect, useState, useMemo } from 'react';
import { PARTIDOS_DIECISEISAVOS, PARTIDOS_GRUPOS, PARTIDOS_OCTAVOS, PARTIDOS_CUARTOS, PARTIDOS_SEMIS } from '@/lib/partidos';
import { bandera } from '@/lib/banderas';

interface Resultado {
  id: string;
  golesLocal?: number;
  golesVisitante?: number;
  jugado?: boolean;
  video?: string;
}

function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function getInfo(id: string) {
  const d = PARTIDOS_DIECISEISAVOS.find(p => p.id === id);
  if (d) return { local: d.local, visitante: d.visitante, fase: '16avos', grupo: null, ciudad: d.ciudad };
  const o = PARTIDOS_OCTAVOS.find(p => p.id === id);
  if (o) return { local: o.local, visitante: o.visitante, fase: 'octavos', grupo: null, ciudad: o.ciudad };
  const q = PARTIDOS_CUARTOS.find(p => p.id === id);
  if (q) return { local: q.local, visitante: q.visitante, fase: 'cuartos', grupo: null, ciudad: q.ciudad };
  const s = PARTIDOS_SEMIS.find(p => p.id === id);
  if (s) return { local: s.local, visitante: s.visitante, fase: 'semis', grupo: null, ciudad: s.ciudad };
  const g = PARTIDOS_GRUPOS.find(p => p.id === id);
  if (g) return { local: g.local, visitante: g.visitante, fase: 'grupos', grupo: g.grupo ?? null, ciudad: g.ciudad };
  return null;
}

function VideoCard({ r }: { r: Resultado }) {
  const info = getInfo(r.id);
  if (!info || !r.video) return null;
  const vid = youtubeId(r.video);
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      {vid && (
        <a href={r.video} target="_blank" rel="noopener noreferrer" className="block relative group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://img.youtube.com/vi/${vid}/hqdefault.jpg`} alt={r.id}
            className="w-full h-44 object-cover group-hover:opacity-80 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-red-600 rounded-full w-12 h-12 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <span className="text-xl ml-0.5">▶</span>
            </div>
          </div>
        </a>
      )}
      <div className="px-4 py-3">
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-400">{r.id} · {info.ciudad}</span>
        <div className="flex items-center gap-2 justify-center py-3">
          <span className="text-sm font-semibold flex-1 text-right">{bandera(info.local)} {info.local}</span>
          <span className="text-xl font-black text-yellow-400 min-w-[52px] text-center">{r.golesLocal} – {r.golesVisitante}</span>
          <span className="text-sm font-semibold flex-1">{info.visitante} {bandera(info.visitante)}</span>
        </div>
        {vid && (
          <a href={r.video} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 text-red-300 font-bold text-sm py-2 rounded-xl transition-colors">
            ▶ Ver en YouTube
          </a>
        )}
      </div>
    </div>
  );
}

const GRUPOS_LIST = ['A','B','C','D','E','F','G','H','I','J','K','L'];
type TabPrincipal = 'grupos' | 'dieciseisavos' | 'octavos' | 'cuartos' | 'semis' | 'final';

function tabActiva(): TabPrincipal {
  const now = new Date();
  if (now >= new Date('2026-07-19T00:00:00Z')) return 'final';
  if (now >= new Date('2026-07-14T19:00:00Z')) return 'semis';
  if (now >= new Date('2026-07-09T20:00:00Z')) return 'cuartos';
  if (now >= new Date('2026-07-04T00:00:00Z')) return 'octavos';
  if (now >= new Date('2026-06-28T00:00:00Z')) return 'dieciseisavos';
  return 'grupos';
}

export default function ResumenesPage() {
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabPrincipal>(tabActiva);
  const [grupoActivo, setGrupoActivo] = useState('A');

  useEffect(() => {
    fetch('/api/resultados-publicos', { cache: 'no-store' })
      .then(r => r.json())
      .then((data: Resultado[]) => setResultados(data.filter(r => r.jugado && r.video)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const byGrupo = useMemo(() => {
    const map: Record<string, Resultado[]> = {};
    for (const r of resultados) {
      const info = getInfo(r.id);
      if (!info) continue;
      const key = info.fase === 'grupos' ? (info.grupo ?? 'X') : info.fase;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    }
    return map;
  }, [resultados]);

  const gruposConVideo = GRUPOS_LIST.filter(g => byGrupo[g]?.length);
  const totalGrupos = GRUPOS_LIST.reduce((s, g) => s + (byGrupo[g]?.length ?? 0), 0);

  const TABS: { id: TabPrincipal; label: string; count: number }[] = [
    { id: 'grupos',        label: '📋 Grupos',  count: totalGrupos },
    { id: 'dieciseisavos', label: '⚔️ 16avos',  count: byGrupo['16avos']?.length ?? 0 },
    { id: 'octavos',       label: '⚡ 8vos',    count: byGrupo['octavos']?.length ?? 0 },
    { id: 'cuartos',       label: '🔥 Cuartos', count: byGrupo['cuartos']?.length ?? 0 },
    { id: 'semis',         label: '🌟 Semis',   count: byGrupo['semis']?.length ?? 0 },
    { id: 'final',         label: '🏆 Final',   count: byGrupo['final']?.length ?? 0 },
  ].filter(t => t.count > 0 || t.id === 'grupos' || t.id === 'dieciseisavos' || t.id === 'octavos' || t.id === 'cuartos' || t.id === 'semis') as { id: TabPrincipal; label: string; count: number }[];

  const videos16 = byGrupo['16avos'] ?? [];
  const videosOctavos = byGrupo['octavos'] ?? [];
  const videosCuartos = byGrupo['cuartos'] ?? [];
  const videosSemis = byGrupo['semis'] ?? [];
  const videosFinal = byGrupo['final'] ?? [];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black mb-1">🎬 Resúmenes</h1>
          <p className="text-gray-400 text-sm">Revivé los mejores momentos del Mundial 2026</p>
        </div>

        {loading && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3 animate-pulse">🎬</div>
            <p>Cargando resúmenes...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Tabs principales */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    tab === t.id ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}>
                  {t.label}
                  {t.count > 0 && <span className="ml-1.5 text-xs opacity-70">({t.count})</span>}
                </button>
              ))}
            </div>

            {/* ── GRUPOS ── */}
            {tab === 'grupos' && (
              <>
                {gruposConVideo.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <div className="text-4xl mb-3">🎥</div>
                    <p>Aún no hay videos de la fase de grupos.</p>
                  </div>
                ) : (
                  <>
                    {/* Sub-tabs de grupo */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {gruposConVideo.map(g => (
                        <button key={g} onClick={() => setGrupoActivo(g)}
                          className={`w-11 h-11 rounded-xl font-black text-base transition-colors ${
                            grupoActivo === g ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                          }`}>
                          {g}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-5">
                      {(byGrupo[grupoActivo] ?? []).map(r => <VideoCard key={r.id} r={r} />)}
                    </div>
                  </>
                )}
              </>
            )}

            {/* ── 16AVOS ── */}
            {tab === 'dieciseisavos' && (
              videos16.length === 0
                ? <div className="text-center py-16 text-gray-500"><div className="text-4xl mb-3">🎥</div><p>Aún no hay videos de 16avos.</p></div>
                : <div className="space-y-5">{videos16.map(r => <VideoCard key={r.id} r={r} />)}</div>
            )}

            {/* ── OCTAVOS ── */}
            {tab === 'octavos' && (
              videosOctavos.length === 0
                ? <div className="text-center py-16 text-gray-500"><div className="text-4xl mb-3">🎥</div><p>Aún no hay videos de 8vos.</p></div>
                : <div className="space-y-5">{videosOctavos.map(r => <VideoCard key={r.id} r={r} />)}</div>
            )}

            {/* ── CUARTOS ── */}
            {tab === 'cuartos' && (
              videosCuartos.length === 0
                ? <div className="text-center py-16 text-gray-500"><div className="text-4xl mb-3">🎥</div><p>Aún no hay videos de cuartos.</p></div>
                : <div className="space-y-5">{videosCuartos.map(r => <VideoCard key={r.id} r={r} />)}</div>
            )}

            {/* ── SEMIS ── */}
            {tab === 'semis' && (
              videosSemis.length === 0
                ? <div className="text-center py-16 text-gray-500"><div className="text-4xl mb-3">🎥</div><p>Aún no hay videos de semis.</p></div>
                : <div className="space-y-5">{videosSemis.map(r => <VideoCard key={r.id} r={r} />)}</div>
            )}

            {/* ── FINAL ── */}
            {tab === 'final' && (
              videosFinal.length === 0
                ? <div className="text-center py-16 text-gray-500"><div className="text-4xl mb-3">🎥</div><p>Aún no hay videos de la final.</p></div>
                : <div className="space-y-5">{videosFinal.map(r => <VideoCard key={r.id} r={r} />)}</div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
