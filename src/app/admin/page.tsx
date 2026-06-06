'use client';

import { useState, useEffect } from 'react';
import { PARTIDOS_GRUPOS } from '@/lib/partidos';

interface Participante {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  pagado: boolean;
  fechaRegistro: string;
  puntos: number;
  pronosticosEspeciales: {
    campeon: string;
    subcampeon: string;
    semifinalistas: string[];
    maxGoleador: string;
  };
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin', { headers: { 'x-admin-password': password } });
      if (!res.ok) { setError('Contraseña incorrecta'); return; }
      const data = await res.json();
      setParticipantes(data);
      setAuthed(true);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  async function togglePago(id: string, pagado: boolean) {
    await fetch('/api/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ id, pagado: !pagado }),
    });
    setParticipantes(prev => prev.map(p => p.id === id ? { ...p, pagado: !pagado } : p));
  }

  const pagados = participantes.filter(p => p.pagado);
  const pendientes = participantes.filter(p => !p.pagado);
  const pozo = pagados.length * 50;

  if (!authed) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <form onSubmit={login} className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-black text-center">🔐 Panel Admin</h1>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
            placeholder="Contraseña"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black mb-2">⚙️ Panel de Administración</h1>
        <p className="text-green-300 mb-8">Quiniela Mundialista 2026 · Familia Vilaseca</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-yellow-400">{participantes.length}</div>
            <div className="text-sm text-gray-400">Total inscritos</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-green-400">{pagados.length}</div>
            <div className="text-sm text-gray-400">Pagos confirmados</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-yellow-300">{pozo} Bs</div>
            <div className="text-sm text-gray-400">Pozo total</div>
          </div>
        </div>

        {/* Distribución */}
        {pagados.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8 text-sm">
            <p className="font-bold mb-2 text-gray-300">Distribución del pozo:</p>
            <div className="flex gap-6">
              <span>🥇 1°: <strong className="text-yellow-400">{Math.round(pozo * 0.6)} Bs</strong></span>
              <span>🥈 2°: <strong className="text-gray-300">{Math.round(pozo * 0.25)} Bs</strong></span>
              <span>🥉 3°: <strong className="text-orange-400">{Math.round(pozo * 0.15)} Bs</strong></span>
            </div>
          </div>
        )}

        {/* Lista pendientes */}
        {pendientes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-red-400 mb-3">⏳ Pendientes de pago ({pendientes.length})</h2>
            <div className="space-y-2">
              {pendientes.map(p => (
                <ParticipanteRow key={p.id} p={p} onToggle={togglePago} onSelect={setSelected} selected={selected} />
              ))}
            </div>
          </div>
        )}

        {/* Lista pagados */}
        <div>
          <h2 className="text-lg font-bold text-green-400 mb-3">✅ Pagos confirmados ({pagados.length})</h2>
          {pagados.length === 0 && <p className="text-gray-500 text-sm">Aún no hay pagos confirmados.</p>}
          <div className="space-y-2">
            {pagados.map(p => (
              <ParticipanteRow key={p.id} p={p} onToggle={togglePago} onSelect={setSelected} selected={selected} />
            ))}
          </div>
        </div>

        {/* Cargar resultados */}
        <CargarResultados password={password} />
      </div>
    </main>
  );
}

function CargarResultados({ password }: { password: string }) {
  const [partidoId, setPartidoId] = useState('');
  const [gl, setGl] = useState('0');
  const [gv, setGv] = useState('0');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('/api/resultados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ partidoId, golesLocal: parseInt(gl), golesVisitante: parseInt(gv) }),
      });
      if (res.ok) {
        setMsg('✅ Resultado guardado y puntos recalculados');
        setPartidoId('');
        setGl('0');
        setGv('0');
      } else {
        setMsg('❌ Error al guardar');
      }
    } finally {
      setLoading(false);
    }
  }

  const partido = PARTIDOS_GRUPOS.find(p => p.id === partidoId);

  return (
    <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-yellow-400 mb-4">⚽ Cargar Resultado de Partido</h2>
      <form onSubmit={guardar} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Partido</label>
          <select value={partidoId} onChange={e => setPartidoId(e.target.value)}
            className="w-full bg-green-950 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400">
            <option value="">Selecciona un partido...</option>
            {PARTIDOS_GRUPOS.map(p => (
              <option key={p.id} value={p.id}>
                Grupo {p.grupo} · {p.local} vs {p.visitante}
              </option>
            ))}
          </select>
        </div>

        {partido && (
          <div className="flex items-center gap-4">
            <div className="flex-1 text-right">
              <p className="text-sm font-semibold">{partido.local}</p>
              <input type="number" min="0" max="20" value={gl} onChange={e => setGl(e.target.value)}
                className="w-20 mt-1 text-center bg-white/10 border border-white/20 rounded-lg py-2 text-white text-xl font-black focus:outline-none focus:border-yellow-400 ml-auto block" />
            </div>
            <span className="text-gray-500 font-black text-xl">-</span>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">{partido.visitante}</p>
              <input type="number" min="0" max="20" value={gv} onChange={e => setGv(e.target.value)}
                className="w-20 mt-1 text-center bg-white/10 border border-white/20 rounded-lg py-2 text-white text-xl font-black focus:outline-none focus:border-yellow-400" />
            </div>
          </div>
        )}

        {msg && <p className="text-sm text-center">{msg}</p>}

        <button type="submit" disabled={!partidoId || loading}
          className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-black font-bold py-3 rounded-xl transition-colors">
          {loading ? 'Guardando y recalculando...' : 'Guardar resultado'}
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-3 text-center">
        Al guardar, se recalculan automáticamente los puntos de todos los participantes y se actualiza la tabla.
      </p>
    </div>
  );
}

function ParticipanteRow({
  p, onToggle, onSelect, selected
}: {
  p: Participante;
  onToggle: (id: string, pagado: boolean) => void;
  onSelect: (id: string | null) => void;
  selected: string | null;
}) {
  const isOpen = selected === p.id;
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => onSelect(isOpen ? null : p.id)}>
        <div className="flex-1">
          <p className="font-bold">{p.nombre}</p>
          <p className="text-xs text-gray-400">{p.telefono} · {new Date(p.fechaRegistro).toLocaleDateString('es-BO')}</p>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.pagado ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {p.pagado ? 'Pagado' : 'Pendiente'}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(p.id, p.pagado); }}
          className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors ${
            p.pagado ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
          }`}
        >
          {p.pagado ? 'Revertir' : 'Confirmar pago'}
        </button>
      </div>
      {isOpen && (
        <div className="border-t border-white/10 p-4 text-sm space-y-1 text-gray-300">
          <p>📧 {p.email || 'Sin email'}</p>
          <p>🏆 Campeón: <strong>{p.pronosticosEspeciales?.campeon}</strong></p>
          <p>🥈 Subcampeón: <strong>{p.pronosticosEspeciales?.subcampeon}</strong></p>
          <p>4️⃣ Semis: <strong>{p.pronosticosEspeciales?.semifinalistas?.join(', ')}</strong></p>
          <p>⚽ Goleador: <strong>{p.pronosticosEspeciales?.maxGoleador}</strong></p>
        </div>
      )}
    </div>
  );
}
