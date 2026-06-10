import { getCollection, updateDocument } from './firebase';
import { calcularPuntosPartido } from './puntuacion';
import { Participante, Partido } from '@/types';

export async function recalcularTodos() {
  const [participantes, resultados] = await Promise.all([
    getCollection('participantes'),
    getCollection('resultados'),
  ]);

  const resultadosMap = Object.fromEntries(
    (resultados as Partido[]).map(r => [r.id, r])
  );

  for (const participante of participantes as Participante[]) {
    let puntosGrupos = 0;
    const pronosticos = (participante.pronosticosGrupos ?? {}) as Record<string, { golesLocal: number; golesVisitante: number }>;

    for (const [pId, resultado] of Object.entries(resultadosMap)) {
      const pron = pronosticos[pId];
      if (pron) {
        puntosGrupos += calcularPuntosPartido(pron, {
          ...resultado, id: pId, fase: 'grupos', local: '', visitante: '', fecha: '', jugado: true,
        });
      }
    }

    const totalPuntos = puntosGrupos +
      (participante.desglose?.octavos ?? 0) +
      (participante.desglose?.cuartos ?? 0) +
      (participante.desglose?.semis ?? 0) +
      (participante.desglose?.especiales ?? 0);

    await updateDocument('participantes', participante.id, {
      puntos: totalPuntos,
      desglose: { ...(participante.desglose ?? {}), grupos: puntosGrupos },
    });
  }
}
