const DATOS_GOB_API = 'https://datos.gob.cl/api/3/action'

export interface VedaSanitaria {
  zona: string
  region: string
  especie: string
  estado: 'ACTIVA' | 'LEVANTADA'
  fechaInicio: string
  resolucion: string
}

export async function fetchVedasActivas(): Promise<VedaSanitaria[]> {
  try {
    const searchUrl = `${DATOS_GOB_API}/package_search?q=organization:subsecretaria_de_pesca_y_acuicultura+vedas&rows=5`

    const res = await fetch(searchUrl, { next: { revalidate: 3600 } })
    const json = await res.json()

    const datasets = json.result?.results ?? []
    const vedas: VedaSanitaria[] = []

    for (const dataset of datasets) {
      for (const resource of dataset.resources ?? []) {
        if (resource.format === 'JSON' || resource.format === 'CSV') {
          try {
            const dataRes = await fetch(resource.url, { next: { revalidate: 3600 } })
            if (dataRes.ok) {
              const rawData = await dataRes.json().catch(() => null)
              if (rawData) {
                const records = Array.isArray(rawData) ? rawData : rawData.data ?? []
                records.slice(0, 50).forEach((r: Record<string, string>) => {
                  vedas.push({
                    zona: r.zona ?? r.area ?? r.sector ?? 'Sin especificar',
                    region: r.region ?? 'Los Lagos',
                    especie: r.especie ?? r.recurso ?? 'Moluscos',
                    estado: r.estado?.includes('ACTIV') ? 'ACTIVA' : 'LEVANTADA',
                    fechaInicio: r.fecha_inicio ?? r.fecha ?? new Date().toISOString(),
                    resolucion: r.resolucion ?? r.numero_resolucion ?? '',
                  })
                })
              }
            }
          } catch {
            // Continue with next resource
          }
        }
      }
    }

    return vedas.filter(v => v.estado === 'ACTIVA')
  } catch {
    return []
  }
}
