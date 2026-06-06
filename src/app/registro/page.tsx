'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/authService';

export default function RegistroPage() {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listo, setListo] = useState(false);
  const [session, setSession] = useState<{ uid: string; name: string; token: string } | null>(null);

  useEffect(() => {
    const s = getSession();
    setSession(s);
    if (s?.name) setNombre(s.name);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!telefono.trim()) { setError('El teléfono es obligatorio'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: session?.uid,
          nombre,
          telefono,
          email: '',
          pronosticosEspeciales: {},
          pronosticosGrupos: {},
        }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      setListo(true);
    } catch {
      setError('Error al guardar. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  if (listo) {
    return (
      <main className="min-h-screen bg-green-950 text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-black mb-3">¡Inscripción registrada!</h1>
          <p className="text-gray-300 mb-6">
            Una vez que confirmemos tu pago de <strong className="text-yellow-400">50 Bs</strong>, quedás oficialmente en la quiniela.
          </p>
          <Link href="/pronosticos"
            className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black font-black px-8 py-4 rounded-2xl text-lg transition-all">
            Ir a mis pronósticos →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-950 to-black text-white">
      <div className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-center mb-2">📝 Inscripción</h1>
        <p className="text-center text-green-300 mb-8">Quiniela Mundialista 2026 · Familia Vilaseca</p>

        {/* Paso 1: Pago */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 text-center">
          <h2 className="text-lg font-bold mb-4">💳 Paso 1 — Realizá tu pago</h2>
          <p className="text-gray-300 text-sm mb-4">
            Escaneá el QR y pagá <span className="text-yellow-400 font-bold">50 Bs</span> por Banco BISA.
          </p>
          <div className="bg-white rounded-xl p-3 inline-block mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/qr-pago.png" alt="QR Banco BISA" className="w-52 h-52 object-contain" />
          </div>
          <p className="text-xs text-gray-500">Motivo: Quiniela Vilaseca · BOB 50.00</p>
        </div>

        {/* Paso 2: Datos */}
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold mb-2">👤 Paso 2 — Tus datos</h2>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Nombre completo</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
              placeholder="Juan Vilaseca" />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">WhatsApp / Teléfono *</label>
            <input value={telefono} onChange={e => setTelefono(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
              placeholder="+591 7XXXXXXX" />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-black py-3.5 rounded-xl transition-all text-lg">
            {loading ? 'Guardando...' : 'Confirmar inscripción →'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-4">
          Después de inscribirte, completá tus pronósticos antes del 10 de junio.
        </p>
      </div>
    </main>
  );
}
