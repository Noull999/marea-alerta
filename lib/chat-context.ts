// Prepara el contexto para el chat IA con datos relevantes

export async function buildChatContext(userId: string) {
  const [centros, alertasRecientes, bitacoraReciente] = await Promise.all([
    fetch('/api/centros').then(r => r.json()).catch(() => ({ centros: [] })),
    fetch('/api/alertas').then(r => r.json()).catch(() => ({ alertas: [] })),
    fetch('/api/bitacora').then(r => r.json()).catch(() => ({ entries: [] })),
  ])

  const contextText = `
CONTEXTO DEL USUARIO:
- Centros de cultivo: ${centros.centros?.length || 0}
${centros.centros?.map((c: any) => `  * ${c.nombre} (${c.latitud.toFixed(2)}, ${c.longitud.toFixed(2)})`).join('\n')}

- Alertas activas: ${alertasRecientes.alertas?.length || 0}
${alertasRecientes.alertas?.slice(0, 3).map((a: any) => `  * ${a.zona}: ${a.nivel} - ${a.descripcion}`).join('\n')}

- Último registro bitácora: ${bitacoraReciente.entries?.[0]?.fecha ? new Date(bitacoraReciente.entries[0].fecha).toLocaleDateString('es-CL') : 'Sin registros'}
`

  return contextText
}
