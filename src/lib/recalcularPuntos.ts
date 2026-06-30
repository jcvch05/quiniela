import { getCollection, updateDocument } from './firebase';
import { calcularPuntosPartido } from './puntuacion';
import { Participante, Partido } from '@/types';

export async function recalcularTodos() {
  const [participantes, resultados, resultadosDieciseisavos] = await Promise.all([
    getCollection('participantes'),
    getCollection('resultados'),
    getCollection('resultados-dieciseisavos').catch(() => []),
  ]);

  const resultadosMap = Object.fromEntries(
    (resultados as Partido[]).map(r => [r.id, r])
  );

  const dieciseisavosMap = Object.fromEntries(
    ((resultadosDieciseisavos as any[]) || []).map(r => [r.id, r])
  );

  for (const participante of participantes as Participante[]) {
    let puntosGrupos = 0;
    let puntosDieciseisavos = 0;

    const pronosticosGrupos = (participante.pronosticosGrupos ?? {}) as Record<string, { golesLocal: number; golesVisitante: number }>;
    const pronosticosDieciseisavos = (participante.pronosticosDieciseisavos ?? {}) as Record<string, { golesLocal: number; golesVisitante: number }>;

    // Calcular puntos de GRUPOS
    for (const [pId, resultado] of Object.entries(resultadosMap)) {
      const pron = pronosticosGrupos[pId];
      if (pron) {
        puntosGrupos += calcularPuntosPartido(pron, {
          ...resultado, id: pId, fase: 'grupos', local: '', visitante: '', fecha: '', jugado: true,
        });
      }
    }

    // Calcular puntos de DIECISEISAVOS (igual lógica que grupos)
    for (const [pId, resultado] of Object.entries(dieciseisavosMap)) {
      const pron = pronosticosDieciseisavos[pId];
      if (pron && resultado.golesLocal !== undefined && resultado.golesVisitante !== undefined) {
        puntosDieciseisavos += calcularPuntosPartido(pron, {
          ...resultado, id: pId, fase: 'dieciseisavos', local: '', visitante: '', fecha: '', jugado: true,
        });
      }
    }

    const totalPuntos = puntosGrupos + puntosDieciseisavos + (participante.desglose?.especiales ?? 0);

    const nuevoDesglose = {
      grupos: puntosGrupos,
      dieciseisavos: puntosDieciseisavos,
      octavos: 0,
      cuartos: 0,
      semis: 0,
      especiales: participante.desglose?.especiales ?? 0,
    };

    console.log(`[RECALC] ${participante.nombre}: total=${totalPuntos}, g=${puntosGrupos}, d=${puntosDieciseisavos}`);

    await updateDocument('participantes', participante.id, {
      puntos: totalPuntos,
      desglose: nuevoDesglose,
    });
  }
}
