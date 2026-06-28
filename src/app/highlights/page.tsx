'use client';

import { useEffect, useState } from 'react';
import { PARTIDOS_GRUPOS, PARTIDOS_DIECISEISAVOS } from '@/lib/partidos';

interface Resultado {
  id: string;
  golesLocal: number;
  golesVisitante: number;
  jugado: boolean;
  video?: string;
}

type Fase = 'grupos' | 'dieciseisavos';

function youtubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function VideoCard({ r }: { r: Resultado & { local: string; visitante: string; grupo?: string; fecha: string; sede: string; ciudad: string } }) {
  const vid = youtubeId(r.video!);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 bg-green-900/30 border-b border-white/10">
        {r.grupo && <p className="text-xs text-green-400 font-bold uppercase tracking-widest mb-1">Grupo {r.grupo}</p>}
        <div className="flex items-center justify-center gap-4">
          <span className="font-bold text-lg flex-1 text-right">{r.local}</span>
          <span className="bg-green-700/70 px-4 py-1.5 rounded-xl font-black text-2xl">
            {r.golesLocal} - {r.golesVisitante}
          </span>
          <span className="font-bold text-lg flex-1 text-left">{r.visitante}</span>
        </div>
        {r.fecha && (
          <p className="text-xs text-gray-400 text-center mt-2">
            📅 {new Date(r.fecha.split('T')[0] + 'T12:00:00').toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {r.sede && <span className="ml-2">· 📍 {r.sede}, {r.ciudad}</span>}
          </p>
        )}
      </div>
      {vid ? (
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          {playing ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${vid}?autoplay=1`}
              title={`${r.local} vs ${r.visitante}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button onClick={() => setPlaying(true)} className="absolute inset-0 w-full h-full group">
              <img
                src={`https://img.youtube.com/vi/${vid}/hqdefault.jpg`}
                alt={`${r.local} vs ${r.visitante}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-xl">
                  <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 ml-1"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
            </button>
          )}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-600 text-sm">Video próximamente</div>
      )}
    </div>
  );
}

export default function HighlightsPage() {
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [fase, setFase] = useState<Fase>('grupos');

  useEffect(() => {
    fetch('/api/resultados-publicos', { cache: 'no-store' })
      .then(r => r.json())
      .then((data: Resultado[]) => setResultados(data.filter(r => r.jugado && r.video)));
  }, []);

  const partidosGrupos = resultados.map(r => {
    const p = PARTIDOS_GRUPOS.find(x => x.id === r.id);
    if (!p) return null;
    return { ...r, local: p.local, visitante: p.visitante, grupo: p.grupo, fecha: p.fecha, sede: p.sede ?? '', ciudad: p.ciudad ?? '' };
  }).filter(Boolean) as (Resultado & { local: string; visitante: string; grupo?: string; fecha: string; sede: string; ciudad: string })[];

  const partidosDieciseisavos = resultados.map(r => {
    const p = PARTIDOS_DIECISEISAVOS.find(x => x.id === r.id);
    if (!p) return null;
    return { ...r, local: p.local, visitante: p.visitante, grupo: undefined, fecha: p.fecha, sede: p.sede, ciudad: p.ciudad };
  }).filter(Boolean) as (Resultado & { local: string; visitante: string; grupo?: string; fecha: string; sede: string; ciudad: string })[];

  const partidos = fase === 'grupos' ? partidosGrupos : partidosDieciseisavos;

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-950 via-black to-black text-white py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-yellow-400 mb-1">🎬 Resúmenes</h1>
          <p className="text-gray-400 text-sm">Highlights de los partidos jugados</p>
        </div>

        {/* Tabs de fase */}
        <div className="flex gap-2 mb-8 justify-center">
          {([['grupos', '📊 Fase Grupos'], ['dieciseisavos', '⚔️ Fase 16avos']] as [Fase, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setFase(id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                fase === id ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {partidos.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <div className="text-5xl mb-4">📺</div>
            <p>Aún no hay resúmenes disponibles.</p>
            <p className="text-sm mt-1">Los videos aparecen aquí después de cada partido.</p>
          </div>
        )}

        <div className="space-y-8">
          {partidos.map(r => <VideoCard key={r.id} r={r} />)}
        </div>
      </div>
    </main>
  );
}
