import { NextRequest, NextResponse } from 'next/server';
import { createDocument } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, telefono, email, pronosticosEspeciales, pronosticosGrupos } = body;

    if (!nombre || !telefono) {
      return NextResponse.json({ error: 'Nombre y teléfono son obligatorios' }, { status: 400 });
    }

    const id = `${Date.now()}-${nombre.toLowerCase().replace(/\s+/g, '-')}`;

    await createDocument('participantes', id, {
      nombre,
      telefono,
      email: email ?? '',
      pagado: false,
      fechaRegistro: new Date().toISOString(),
      pronosticosEspeciales,
      pronosticosGrupos,
      puntos: 0,
      desglose: { grupos: 0, octavos: 0, cuartos: 0, semis: 0, especiales: 0 },
    });

    return NextResponse.json({ ok: true, id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
