import { getCollection, updateDocument } from './firebase';
import { calcularPuntosEliminatoria } from './puntuacion';
import { Participante } from '@/types';
import { calcularClasificadosPorFase, FaseEliminatoria } from './eliminatorias';

interface ResultadoEliminatoria {
  id: string;
  fase: FaseEliminatoria;
  ganador: string;
}

export async function recalcularEliminatorias() {
  const [participantes, resultadosRaw] = await Promise.all([
    getCollection('participantes'),
    getCollection('resultados-eliminatorias'),
  ]);

  const resultados = (resultadosRaw ?? []) as ResultadoEliminatoria[];

  const clasificados = {
    dieciseisavos: calcularClasificadosPorFase(resultados, 'dieciseisavos'),
    octavos: calcularClasificadosPorFase(resultados, 'octavos'),
    cuartos: calcularClasificadosPorFase(resultados, 'cuartos'),
    semis: calcularClasificadosPorFase(resultados, 'semis'),
  };

  for (const participante of participantes as Participante[]) {
    // Calcular puntos por fase
    const puntos = {
      dieciseisavos: calcularPuntosEliminatoria(
        // Nota: dieciseisavos no suele tener predicción, pero podría haber
        undefined,
        clasificados.dieciseisavos
      ),
      octavos: calcularPuntosEliminatoria(participante.octavos, clasificados.octavos),
      cuartos: calcularPuntosEliminatoria(participante.cuartos, clasificados.cuartos),
      semis: calcularPuntosEliminatoria(participante.semis, clasificados.semis),
    };

    const totalEliminatorias =
      puntos.dieciseisavos + puntos.octavos + puntos.cuartos + puntos.semis;

    const totalPuntos = (participante.desglose?.grupos ?? 0) +
      totalEliminatorias +
      (participante.desglose?.especiales ?? 0);

    await updateDocument('participantes', participante.id, {
      puntos: totalPuntos,
      desglose: {
        ...(participante.desglose ?? {}),
        octavos: puntos.octavos,
        cuartos: puntos.cuartos,
        semis: puntos.semis,
      },
    });
  }
}
