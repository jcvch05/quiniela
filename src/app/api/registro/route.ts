import { NextRequest, NextResponse } from 'next/server';
import { createDocument, updateDocument, getDocument } from '@/lib/firebase';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, nombre, telefono, email, pronosticosEspeciales, pronosticosGrupos } = body;

    // Validaciones
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2 || nombre.length > 100) {
      return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 });
    }
    if (email && !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }
    if (uid && typeof uid !== 'string') {
      return NextResponse.json({ error: 'UID inválido' }, { status: 400 });
    }

    // Validar goles (0-20)
    if (pronosticosGrupos && typeof pronosticosGrupos === 'object') {
      for (const val of Object.values(pronosticosGrupos) as { golesLocal: number; golesVisitante: number }[]) {
        if (val.golesLocal < 0 || val.golesLocal > 20 || val.golesVisitante < 0 || val.golesVisitante > 20) {
          return NextResponse.json({ error: 'Marcador inválido' }, { status: 400 });
        }
      }
    }

    const docId = uid ?? `${Date.now()}-${nombre.toLowerCase().replace(/\s+/g, '-').slice(0, 30)}`;

    const data = {
      nombre: nombre.trim().slice(0, 100),
      telefono: (telefono ?? '').slice(0, 20),
      email: (email ?? '').slice(0, 255),
      uid: uid ?? null,
      pagado: false,
      fechaRegistro: new Date().toISOString(),
      pronosticosEspeciales: pronosticosEspeciales ?? {},
      pronosticosGrupos: pronosticosGrupos ?? {},
      puntos: 0,
      desglose: { grupos: 0, octavos: 0, cuartos: 0, semis: 0, especiales: 0 },
    };

    try {
      const existing = await getDocument('participantes', docId) as Record<string, unknown>;
      // Preservar puntos y estado de pago si ya existe
      await updateDocument('participantes', docId, {
        ...data,
        pagado: existing.pagado ?? false,
        puntos: existing.puntos ?? 0,
        desglose: existing.desglose ?? data.desglose,
      });
    } catch {
      await createDocument('participantes', docId, data);
    }

    return NextResponse.json({ ok: true, id: docId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
