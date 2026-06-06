import { NextRequest, NextResponse } from 'next/server';
import { createDocument, updateDocument, getDocument } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, nombre, telefono, email, pronosticosEspeciales, pronosticosGrupos } = body;

    if (!nombre || !telefono) {
      return NextResponse.json({ error: 'Nombre y teléfono son obligatorios' }, { status: 400 });
    }

    const docId = uid ?? `${Date.now()}-${nombre.toLowerCase().replace(/\s+/g, '-')}`;

    const data = {
      nombre,
      telefono,
      email: email ?? '',
      uid: uid ?? null,
      pagado: false,
      fechaRegistro: new Date().toISOString(),
      pronosticosEspeciales,
      pronosticosGrupos,
      puntos: 0,
      desglose: { grupos: 0, octavos: 0, cuartos: 0, semis: 0, especiales: 0 },
    };

    // Si ya existe (re-registro), actualiza en lugar de crear
    try {
      await getDocument('participantes', docId);
      await updateDocument('participantes', docId, data);
    } catch {
      await createDocument('participantes', docId, data);
    }

    return NextResponse.json({ ok: true, id: docId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
