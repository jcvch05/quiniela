'use client';

import { useEffect, useState, useMemo } from 'react';
import { PARTIDOS_DIECISEISAVOS, PARTIDOS_GRUPOS } from '@/lib/partidos';
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
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-400">{r.id} · {info.ciudad}</span>
        </div>
        <div className="flex items-center gap-2 justify-center py-2">
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

type Tab = string; // 'A'-'L' | 'dieciseisavos' | 'cuartos' | 'semis' | 'final'

export default function ResumenesPage() {
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('dieciseisavos');

  useEffect(() => {
    fetch('/api/resultados-publicos', { cache: 'no-store' })
      .then(r => r.json())
      .then((data: Resultado[]) => {
        setResultados(data.filter(r => r.jugado && r.video));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Agrupar por fase/grupo
  const byGrupo = useMemo(() => {
    const map: Record<string, Resultado[]> = {};
    for (const r of resultados) {
      const info = getInfo(r.id);
      if (!info) continue;
      if (info.fase === 'grupos' && info.grupo) {
        if (!map[info.grupo]) map[info.grupo] = [];
        map[info.grupo].push(r);
      } else if (info.fase === '16avos') {
        if (!map['dieciseisavos']) map['dieciseisavos'] = [];
        map['dieciseisavos'].push(r);
      } else {
        if (!map[info.fase]) map[info.fase] = [];
        map[info.fase].push(r);
      }
    }
    return map;
  }, [resultados]);

  // Tabs disponibles: grupos con video primero, luego fases elim
  const gruposConVideo = GRUPOS_LIST.filter(g => byGrupo[g]?.length);
  const elimConVideo = (['dieciseisavos', 'cuartos', 'semis', 'final'] as const).filter(f => byGrupo[f]?.length);

  const TABS: { id: Tab; label: string }[] = [
    ...elimConVideo.map(f => ({
      id: f,
      label: f === 'dieciseisavos' ? '⚔️ 16avos' : f === 'cuartos' ? '🔥 Cuartos' : f === 'semis' ? '🌟 Semis' : '🏆 Final'
    })),
    ...gruposConVideo.map(g => ({ id: g, label: `Grupo ${g}` })),
  ];

  const actual = byGrupo[tab] ?? [];

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

        {!loading && TABS.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎥</div>
            <p className="text-gray-400">Aún no hay resúmenes disponibles.</p>
            <p className="text-gray-600 text-sm mt-1">Los videos aparecerán aquí cuando se carguen los resultados.</p>
          </div>
        )}

        {!loading && TABS.length > 0 && (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                    tab === t.id ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}>
                  {t.label}
                  <span className="ml-1.5 text-xs opacity-70">({byGrupo[t.id]?.length ?? 0})</span>
                </button>
              ))}
            </div>

            {/* Videos */}
            {actual.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No hay videos en esta sección aún.</div>
            ) : (
              <div className="space-y-5">
                {actual.map(r => <VideoCard key={r.id} r={r} />)}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
