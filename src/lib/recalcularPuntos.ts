import { getCollection, updateDocument } from './firebase';
import { calcularPuntosPartido, calcularPuntosEliminatoria } from './puntuacion';
import { Participante, Partido } from '@/types';
import { calcularClasificadosPorFase } from './eliminatorias';

interface ResultadoEliminatoria {
  id: string;
  fase: 'dieciseisavos' | 'octavos' | 'cuartos' | 'semis' | 'final';
  ganador: string;
}

export async function recalcularTodos() {
  const [participantes, resultados, resultadosEliminatorias] = await Promise.all([
    getCollection('participantes'),
    getCollection('resultados'),
    getCollection('resultados-eliminatorias').catch(() => []),
  ]);

  const resultadosMap = Object.fromEntries(
    (resultados as Partido[]).map(r => [r.id, r])
  );

  const resultadosEliminatoriasList = (resultadosEliminatorias ?? []) as ResultadoEliminatoria[];

  // Calcular clasificados por fase
  // Nota: ganadores de dieciseisavos avanzan a octavos, ganadores de octavos avanzan a cuartos, etc.
  const clasificados = {
    octavos: calcularClasificadosPorFase(resultadosEliminatoriasList, 'dieciseisavos'),
    cuartos: calcularClasificadosPorFase(resultadosEliminatoriasList, 'octavos'),
    semis: calcularClasificadosPorFase(resultadosEliminatoriasList, 'cuartos'),
  };

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

    // Calcular puntos de eliminatorias
    const puntosOctavos = calcularPuntosEliminatoria(participante.octavos, clasificados.octavos);
    const puntosCuartos = calcularPuntosEliminatoria(participante.cuartos, clasificados.cuartos);
    const puntosSemis = calcularPuntosEliminatoria(participante.semis, clasificados.semis);

    const totalPuntos = puntosGrupos +
      puntosOctavos +
      puntosCuartos +
      puntosSemis +
      (participante.desglose?.especiales ?? 0);

    await updateDocument('participantes', participante.id, {
      puntos: totalPuntos,
      desglose: {
        ...(participante.desglose ?? {}),
        grupos: puntosGrupos,
        octavos: puntosOctavos,
        cuartos: puntosCuartos,
        semis: puntosSemis,
      },
    });
  }
}
