import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/firebase';

export async function GET() {
  try {
    const participantes = await getCollection('participantes');
    // Solo exponer datos públicos para la tabla
    const publico = participantes
      .map((p: Record<string, unknown>) => ({
        id: p.id,
        nombre: p.nombre,
        puntos: p.puntos,
        desglose: p.desglose,
        pagado: p.pagado,
        pronosticosGrupos: p.pronosticosGrupos ?? {},
        pronosticosDieciseisavos: p.pronosticosDieciseisavos ?? {},
      }))
      .filter((p: { pagado: unknown }) => p.pagado)
      .sort((a: { puntos: unknown }, b: { puntos: unknown }) => (b.puntos as number) - (a.puntos as number));

    return NextResponse.json(publico);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
