'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PARTIDOS_GRUPOS } from '@/lib/partidos';
import { SELECCIONES } from '@/types';
import { getSession } from '@/lib/authService';

interface FormData {
  nombre: string;
  telefono: string;
  email: string;
  campeon: string;
  subcampeon: string;
  semi1: string;
  semi2: string;
  semi3: string;
  semi4: string;
  maxGoleador: string;
  [key: string]: string;
}

type Step = 'pago' | 'datos' | 'especiales' | 'grupos' | 'enviado';

export default function RegistroPage() {
  const [step, setStep] = useState<Step>('pago');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState<{ uid: string; name: string; token: string } | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError('');
    try {
      const pronosticosGrupos: Record<string, { golesLocal: number; golesVisitante: number }> = {};
      for (const partido of PARTIDOS_GRUPOS) {
        pronosticosGrupos[partido.id] = {
          golesLocal: parseInt(data[`${partido.id}_local`] ?? '0'),
          golesVisitante: parseInt(data[`${partido.id}_visitante`] ?? '0'),
        };
      }

      const payload = {
        uid: session?.uid,
        nombre: data.nombre || session?.name,
        telefono: data.telefono,
        email: data.email,
        pronosticosEspeciales: {
          campeon: data.campeon,
          subcampeon: data.subcampeon,
          semifinalistas: [data.semi1, data.semi2, data.semi3, data.semi4],
          maxGoleador: data.maxGoleador,
        },
        pronosticosGrupos,
      };

      const res = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? 'Error al registrar');
      }

      setStep('enviado');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'enviado') {
    return (
      <main className="min-h-screen bg-green-950 text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-black mb-3">¡Registro enviado!</h1>
          <p className="text-gray-300 mb-6">
            Tus pronósticos fueron guardados. Una vez que confirmemos tu pago de <strong>50 Bs</strong>,
            quedas oficialmente inscrito en la quiniela.
          </p>
          <p className="text-sm text-gray-400">
            Cualquier consulta, escríbenos por WhatsApp.
          </p>
        </div>
      </main>
    );
  }

  const gruposByLetter = PARTIDOS_GRUPOS.reduce<Record<string, typeof PARTIDOS_GRUPOS>>((acc, p) => {
    const g = p.grupo ?? 'X';
    if (!acc[g]) acc[g] = [];
    acc[g].push(p);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-950 to-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-center mb-2">📝 Inscripción</h1>
        <p className="text-center text-green-300 mb-8">Quiniela Mundialista 2026 · Familia Vilaseca</p>

        {/* Stepper */}
        <div className="flex justify-center gap-2 mb-8 text-sm">
          {(['pago', 'datos', 'especiales', 'grupos'] as const).map((s, i) => (
            <div key={s} className={`flex items-center gap-2 ${step === s ? 'text-yellow-400 font-bold' : 'text-gray-500'}`}>
              {i > 0 && <span className="text-gray-700">›</span>}
              <span>{i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}</span>
            </div>
          ))}
        </div>

        {/* PASO 1: PAGO */}
        {step === 'pago' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <h2 className="text-xl font-bold mb-4">💳 Realiza tu pago</h2>
            <p className="text-gray-300 mb-6">
              Escanea el QR con tu app bancaria y paga <span className="text-yellow-400 font-bold">50 Bs</span>.
              Luego continúa con tu registro.
            </p>
            <div className="bg-white rounded-xl p-3 inline-block mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/qr-pago.png" alt="QR Banco BISA - Pago 50 Bs" className="w-52 h-52 object-contain" />
            </div>
            <p className="text-gray-500 text-sm mb-6">Una vez realizado el pago, continúa con el formulario.</p>
            <button
              onClick={() => setStep('datos')}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-8 py-3 rounded-xl transition-colors"
            >
              Ya pagué, continuar →
            </button>
          </div>
        )}

        {/* PASO 2: DATOS PERSONALES */}
        {step === 'datos' && (
          <form onSubmit={(e) => { e.preventDefault(); setStep('especiales'); }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold mb-2">👤 Tus datos</h2>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Nombre completo *</label>
              <input
                {...register('nombre', { required: 'Obligatorio' })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                placeholder="Juan Vilaseca"
              />
              {errors.nombre && <p className="text-red-400 text-xs mt-1">{errors.nombre.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Teléfono / WhatsApp *</label>
              <input
                {...register('telefono', { required: 'Obligatorio' })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                placeholder="+591 7XXXXXXX"
              />
              {errors.telefono && <p className="text-red-400 text-xs mt-1">{errors.telefono.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                placeholder="juan@email.com"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep('pago')}
                className="flex-1 border border-white/20 text-gray-300 font-semibold py-3 rounded-xl hover:bg-white/5 transition-colors">
                ← Atrás
              </button>
              <button type="submit"
                className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-xl transition-colors">
                Continuar →
              </button>
            </div>
          </form>
        )}

        {/* PASO 3: PRONÓSTICOS ESPECIALES */}
        {step === 'especiales' && (
          <form onSubmit={(e) => { e.preventDefault(); setStep('grupos'); }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold mb-1">⭐ Pronósticos Especiales</h2>
            <p className="text-sm text-gray-400 mb-4">Estos pronósticos son los de mayor puntaje.</p>

            <SelectField label="🏆 Campeón del Mundial (50 pts)" name="campeon" register={register} required />
            <SelectField label="🥈 Subcampeón del Mundial (25 pts)" name="subcampeon" register={register} required />
            <SelectField label="4° Semifinalista #1 (10 pts)" name="semi1" register={register} required />
            <SelectField label="4° Semifinalista #2 (10 pts)" name="semi2" register={register} required />
            <SelectField label="4° Semifinalista #3 (10 pts)" name="semi3" register={register} required />
            <SelectField label="4° Semifinalista #4 (10 pts)" name="semi4" register={register} required />

            <div>
              <label className="block text-sm text-gray-300 mb-1">⚽ Máximo Goleador (20 pts) *</label>
              <input
                {...register('maxGoleador', { required: 'Obligatorio' })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                placeholder="Nombre del jugador"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep('datos')}
                className="flex-1 border border-white/20 text-gray-300 font-semibold py-3 rounded-xl hover:bg-white/5 transition-colors">
                ← Atrás
              </button>
              <button type="submit"
                className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-xl transition-colors">
                Continuar →
              </button>
            </div>
          </form>
        )}

        {/* PASO 4: FASE DE GRUPOS */}
        {step === 'grupos' && (
          <form onSubmit={handleSubmit(onSubmit)}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-bold mb-1">🗓️ Fase de Grupos</h2>
            <p className="text-sm text-gray-400">Ingresa el marcador que pronosticas para cada partido.</p>

            {Object.entries(gruposByLetter).sort().map(([grupo, partidos]) => (
              <div key={grupo}>
                <h3 className="text-sm font-bold text-green-400 uppercase tracking-widest mb-3">Grupo {grupo}</h3>
                <div className="space-y-3">
                  {partidos.map(partido => (
                    <div key={partido.id} className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-2">{partido.local} vs {partido.visitante}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold flex-1 text-right truncate">{partido.local}</span>
                        <input
                          {...register(`${partido.id}_local`)}
                          type="number" min="0" max="20" defaultValue="0"
                          className="w-14 text-center bg-white/10 border border-white/20 rounded-lg py-2 text-white focus:outline-none focus:border-yellow-400"
                        />
                        <span className="text-gray-500 font-bold">-</span>
                        <input
                          {...register(`${partido.id}_visitante`)}
                          type="number" min="0" max="20" defaultValue="0"
                          className="w-14 text-center bg-white/10 border border-white/20 rounded-lg py-2 text-white focus:outline-none focus:border-yellow-400"
                        />
                        <span className="text-sm font-semibold flex-1 truncate">{partido.visitante}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep('especiales')}
                className="flex-1 border border-white/20 text-gray-300 font-semibold py-3 rounded-xl hover:bg-white/5 transition-colors">
                ← Atrás
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-colors">
                {loading ? 'Enviando...' : 'Enviar pronósticos ✓'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

function SelectField({
  label, name, register, required
}: {
  label: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1">{label}</label>
      <select
        {...register(name, required ? { required: 'Obligatorio' } : {})}
        className="w-full bg-green-950 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
      >
        <option value="">Selecciona una selección...</option>
        {SELECCIONES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
}
