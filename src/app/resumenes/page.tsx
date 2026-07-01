'use client';

import { useEffect, useState } from 'react';
import { PARTIDOS_DIECISEISAVOS } from '@/lib/partidos';
import { PARTIDOS_GRUPOS } from '@/lib/partidos';
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

function getPartidoInfo(id: string) {
  const d = PARTIDOS_DIECISEISAVOS.find(p => p.id === id);
  if (d) return { local: d.local, visitante: d.visitante, fase: '16avos', ciudad: d.ciudad };
  const g = PARTIDOS_GRUPOS.find(p => p.id === id);
  if (g) return { local: g.local, visitante: g.visitante, fase: 'Grupos', ciudad: g.ciudad };
  return null;
}

export default function ResumenesPage() {
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todos' | '16avos' | 'grupos'>('todos');

  useEffect(() => {
    fetch('/api/resultados-publicos', { cache: 'no-store' })
      .then(r => r.json())
      .then((data: Resultado[]) => {
        const conVideo = data
          .filter(r => r.jugado && r.video)
          .sort((a, b) => {
            // 16avos primero, luego grupos; dentro de cada fase, orden inverso (más recientes primero)
            const aEs16 = a.id.startsWith('D');
            const bEs16 = b.id.startsWith('D');
            if (aEs16 !== bEs16) return aEs16 ? -1 : 1;
            return b.id.localeCompare(a.id);
          });
        setResultados(conVideo);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtrados = resultados.filter(r => {
    if (filtro === '16avos') return r.id.startsWith('D');
    if (filtro === 'grupos') return r.id.startsWith('G');
    return true;
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-1">🎬 Resúmenes</h1>
          <p className="text-gray-400">Revivé los mejores momentos del Mundial 2026</p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          {(['todos', '16avos', 'grupos'] as const).map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                filtro === f ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}>
              {f === 'todos' ? 'Todos' : f === '16avos' ? '⚔️ 16avos' : '📋 Grupos'}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3 animate-pulse">🎬</div>
            <p>Cargando resúmenes...</p>
          </div>
        )}

        {!loading && filtrados.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎥</div>
            <p className="text-gray-400">Aún no hay resúmenes disponibles.</p>
            <p className="text-gray-600 text-sm mt-1">Los videos aparecerán aquí a medida que se carguen los resultados.</p>
          </div>
        )}

        <div className="space-y-6">
          {filtrados.map(r => {
            const info = getPartidoInfo(r.id);
            if (!info) return null;
            const vid = youtubeId(r.video!);
            const thumbUrl = vid ? `https://img.youtube.com/vi/${vid}/hqdefault.jpg` : null;

            return (
              <div key={r.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                {/* Thumbnail / embed */}
                {vid && (
                  <a href={r.video} target="_blank" rel="noopener noreferrer" className="block relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbUrl!} alt={`Resumen ${r.id}`}
                      className="w-full h-48 object-cover group-hover:opacity-80 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-red-600 rounded-full w-14 h-14 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <span className="text-2xl ml-1">▶</span>
                      </div>
                    </div>
                  </a>
                )}

                {/* Info */}
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                      {info.fase} · {r.id}
                    </span>
                    <span className="text-xs text-gray-500">{info.ciudad}</span>
                  </div>

                  <div className="flex items-center gap-3 justify-center py-2">
                    <span className="text-sm font-semibold flex-1 text-right">
                      {bandera(info.local)} {info.local}
                    </span>
                    <span className="text-2xl font-black text-yellow-400 min-w-[60px] text-center">
                      {r.golesLocal} – {r.golesVisitante}
                    </span>
                    <span className="text-sm font-semibold flex-1">
                      {info.visitante} {bandera(info.visitante)}
                    </span>
                  </div>

                  {vid && (
                    <a href={r.video} target="_blank" rel="noopener noreferrer"
                      className="mt-2 flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 text-red-300 font-bold text-sm py-2.5 rounded-xl transition-colors">
                      ▶ Ver resumen en YouTube
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
