import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'Quiniela Vilaseca <onboarding@resend.dev>';

function plantillaFase1(nombre: string, especiales: Record<string, unknown>, partidos: Record<string, { golesLocal: number; golesVisitante: number }>) {
  const semis = (especiales.semifinalistas as string[]) ?? [];
  const resumen = Object.entries(partidos).slice(0, 10).map(([id, p]) =>
    `${id}: ${p.golesLocal} - ${p.golesVisitante}`
  ).join('\n');

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:16px">
      <div style="text-align:center;margin-bottom:24px">
        <h1 style="color:#facc15;font-size:28px;margin:0">⚽ Quiniela Mundialista 2026</h1>
        <p style="color:#86efac;margin:4px 0">Familia Vilaseca</p>
      </div>

      <p style="font-size:16px">Hola <strong>${nombre}</strong>, tus pronósticos de <strong>Fase 1</strong> fueron registrados correctamente.</p>

      <div style="background:#1a2e1a;border:1px solid #166534;border-radius:12px;padding:20px;margin:20px 0">
        <h2 style="color:#4ade80;margin:0 0 16px">⭐ Pronósticos Especiales</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="color:#9ca3af;padding:6px 0">🏆 Campeón</td><td style="font-weight:bold">${especiales.campeon}</td></tr>
          <tr><td style="color:#9ca3af;padding:6px 0">🥈 Subcampeón</td><td style="font-weight:bold">${especiales.subcampeon}</td></tr>
          <tr><td style="color:#9ca3af;padding:6px 0">⭐ Semifinalistas</td><td style="font-weight:bold">${semis.join(', ')}</td></tr>
          <tr><td style="color:#9ca3af;padding:6px 0">⚽ Máx. Goleador</td><td style="font-weight:bold">${especiales.maxGoleador}</td></tr>
        </table>
      </div>

      <div style="background:#1a1a2e;border:1px solid #1e3a5f;border-radius:12px;padding:20px;margin:20px 0">
        <h2 style="color:#60a5fa;margin:0 0 12px">📊 Partidos de Grupos (primeros 10)</h2>
        <pre style="color:#d1d5db;font-size:13px;white-space:pre-wrap;margin:0">${resumen}</pre>
        <p style="color:#6b7280;font-size:12px;margin:8px 0 0">...y ${Object.keys(partidos).length - 10} partidos más</p>
      </div>

      <p style="color:#6b7280;font-size:12px;text-align:center;margin-top:24px">
        Una vez confirmado tu pago, quedas oficialmente inscrito.<br/>
        ¡Buena suerte! 🍀
      </p>
    </div>
  `;
}

function plantillaFaseElim(nombre: string, fase: string, equipos: string[]) {
  const iconos: Record<string, string> = { octavos: '⚔️', cuartos: '🔥', semis: '🌟' };
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:16px">
      <div style="text-align:center;margin-bottom:24px">
        <h1 style="color:#facc15;font-size:28px;margin:0">⚽ Quiniela Mundialista 2026</h1>
        <p style="color:#86efac;margin:4px 0">Familia Vilaseca</p>
      </div>

      <p style="font-size:16px">Hola <strong>${nombre}</strong>, tus pronósticos de <strong>${iconos[fase] ?? ''} ${fase.charAt(0).toUpperCase() + fase.slice(1)}</strong> fueron registrados.</p>

      <div style="background:#1a2e1a;border:1px solid #166534;border-radius:12px;padding:20px;margin:20px 0">
        <h2 style="color:#4ade80;margin:0 0 16px">Equipos pronosticados</h2>
        <ol style="margin:0;padding-left:20px">
          ${equipos.map(e => `<li style="padding:6px 0;font-weight:bold">${e}</li>`).join('')}
        </ol>
      </div>

      <p style="color:#6b7280;font-size:12px;text-align:center;margin-top:24px">¡Buena suerte! 🍀</p>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const { to, nombre, fase, datos } = await req.json();
    if (!to || !fase) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });

    if (!process.env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY no configurada, email omitido');
      return NextResponse.json({ ok: true, skipped: true });
    }

    let html = '';
    let subject = '';

    if (fase === 'fase1') {
      subject = '✅ Tus pronósticos Fase 1 - Quiniela Vilaseca 2026';
      html = plantillaFase1(nombre, datos.especiales, datos.grupos);
    } else {
      subject = `✅ Tus pronósticos ${fase} - Quiniela Vilaseca 2026`;
      html = plantillaFaseElim(nombre, fase, datos.equipos);
    }

    await resend.emails.send({ from: FROM, to, subject, html });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error enviando email' }, { status: 500 });
  }
}
