export interface FANEventoIFOP {
  id: string
  zona: string
  fecha: string
  especie: string
  toxicidad: number
  nivelAlerta: 'NORMAL' | 'ALERTA' | 'CUARENTENA'
  notas?: string
  fuente: 'ifop'
}

/**
 * INTEGRACIÓN IFOP — PENDIENTE DE CABLEADO REAL.
 *
 * Estas funciones devolvían datos FABRICADOS (Math.random / alertas
 * hardcodeadas de Castro y Quellón). En una app de seguridad alimentaria
 * eso es inaceptable: una alerta PSP inventada o un histórico falso puede
 * llevar a decisiones de cosecha equivocadas.
 *
 * Hasta integrar la fuente real (boletín PSMB de IFOP / datos abiertos de
 * SERNAPESCA en datos.gob.cl), retornamos vacío. El motor de riesgo trata
 * "sin datos IFOP" como historialFAN = 0 y refleja menor confianza, en vez
 * de inventar eventos.
 *
 * TODO: implementar ingester real — ver lib/subpesca.ts (vedas) y
 * docs/AUDITORIA_FUENTES_DATOS.md.
 */
export async function fetchFANHistoricoIFOP(
  _zona?: string,
  _años: number = 5
): Promise<FANEventoIFOP[]> {
  return []
}

export async function fetchFANAlertasActualesIFOP(): Promise<FANEventoIFOP[]> {
  return []
}

export async function fetchFANPorZonaIFOP(
  _zona: string,
  _años: number = 5
): Promise<FANEventoIFOP[]> {
  return []
}
