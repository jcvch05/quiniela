'use client';

import { useEffect, useState } from 'react';
import { PARTIDOS_GRUPOS } from '@/lib/partidos';

interface Resultado {
  id: string;
  golesLocal: number;
  golesVisitante: number;
  jugado: boolean;
  video?: string;
}

function youtubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function HighlightsPage() {
  const [resultados, setResultados] = useState<Resultado[]>([]);

  useEffect(() => {
    fetch('/api/resultados-publicos', { cache: 'no-store' })
      .then(r => r.json())
      .then((data: Resultado[]) => setResultados(data.filter(r => r.jugado && r.video)));
  }, []);

  const partidos = resultados.map(r => {
    const partido = PARTIDOS_GRUPOS.find(p => p.id === r.id);
    return { ...r, local: partido?.local ?? '', visitante: partido?.visitante ?? '', grupo: partido?.grupo ?? '' };
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-950 via-black to-black text-white py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-yellow-400 mb-1">🎬 Resúmenes</h1>
          <p className="text-gray-400 text-sm">Highlights de los partidos jugados</p>
        </div>

        {partidos.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <div className="text-5xl mb-4">📺</div>
            <p>Aún no hay resúmenes disponibles.</p>
            <p className="text-sm mt-1">Los videos aparecen aquí después de cada partido.</p>
          </div>
        )}

        <div className="space-y-8">
          {partidos.map(r => {
            const vid = youtubeId(r.video!);
            return (
              <div key={r.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 bg-green-900/30 border-b border-white/10">
                  <p className="text-xs text-green-400 font-bold uppercase tracking-widest mb-1">Grupo {r.grupo}</p>
                  <div className="flex items-center justify-center gap-4">
                    <span className="font-bold text-lg flex-1 text-right">{r.local}</span>
                    <span className="bg-green-700/70 px-4 py-1.5 rounded-xl font-black text-2xl">
                      {r.golesLocal} - {r.golesVisitante}
                    </span>
                    <span className="font-bold text-lg flex-1 text-left">{r.visitante}</span>
                  </div>
                </div>

                {/* Video */}
                {vid && (
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${vid}`}
                      title={`${r.local} vs ${r.visitante}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
