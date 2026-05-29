const DATOS_GOB_API = 'https://datos.gob.cl/api/3/action'

export interface VedaSanitaria {
  zona: string
  region: string
  especie: string
  estado: 'ACTIVA' | 'LEVANTADA'
  fechaInicio: string
  resolucion: string
  fuenteUrl?: string
}

// Aliases de columnas conocidos en datasets de datos.gob.cl. El esquema real
// varía entre recursos, por eso mapeamos de forma tolerante. Verificar las
// columnas reales con: node scripts/inspect-sernapesca.mjs
const FIELD_ALIASES: Record<keyof Omit<VedaSanitaria, 'fuenteUrl'>, string[]> = {
  zona: ['zona', 'area', 'sector', 'localidad', 'lugar', 'nombre_area'],
  region: ['region', 'región', 'region_nombre'],
  especie: ['especie', 'recurso', 'recurso_nombre', 'especies'],
  estado: ['estado', 'situacion', 'situación', 'vigencia', 'condicion'],
  fechaInicio: ['fecha_inicio', 'fecha', 'fecha_desde', 'fecha_resolucion', 'inicio'],
  resolucion: ['resolucion', 'resolución', 'numero_resolucion', 'n_resolucion', 'res', 'decreto'],
}

function pick(record: Record<string, string>, aliases: string[]): string | undefined {
  // Match case-insensitive y tolerante a espacios.
  const keys = Object.keys(record)
  for (const alias of aliases) {
    const hit = keys.find((k) => k.trim().toLowerCase() === alias.toLowerCase())
    if (hit && record[hit] != null && String(record[hit]).trim() !== '') {
      return String(record[hit]).trim()
    }
  }
  return undefined
}

function normalizarEstado(raw?: string): 'ACTIVA' | 'LEVANTADA' {
  const v = (raw ?? '').toUpperCase()
  if (v.includes('ACTIV') || v.includes('VIGENTE') || v.includes('CUARENTENA')) return 'ACTIVA'
  return 'LEVANTADA'
}

function mapRecord(r: Record<string, string>, fuenteUrl?: string): VedaSanitaria {
  return {
    zona: pick(r, FIELD_ALIASES.zona) ?? 'Sin especificar',
    region: pick(r, FIELD_ALIASES.region) ?? 'Los Lagos',
    especie: pick(r, FIELD_ALIASES.especie) ?? 'Moluscos',
    estado: normalizarEstado(pick(r, FIELD_ALIASES.estado)),
    fechaInicio: pick(r, FIELD_ALIASES.fechaInicio) ?? new Date().toISOString(),
    resolucion: pick(r, FIELD_ALIASES.resolucion) ?? '',
    fuenteUrl,
  }
}

// Parser CSV mínimo y tolerante (maneja comillas y comas dentro de campos).
function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') inQuotes = false
      else field += c
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',' || c === ';') {
      row.push(field); field = ''
    } else if (c === '\n' || c === '\r') {
      if (field !== '' || row.length) { row.push(field); rows.push(row); row = []; field = '' }
      if (c === '\r' && text[i + 1] === '\n') i++
    } else {
      field += c
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  if (rows.length < 2) return []

  const header = rows[0].map((h) => h.trim())
  return rows.slice(1).map((cols) => {
    const obj: Record<string, string> = {}
    header.forEach((h, idx) => { obj[h] = (cols[idx] ?? '').trim() })
    return obj
  })
}

async function parseResource(resource: { url: string; format?: string }): Promise<VedaSanitaria[]> {
  const res = await fetch(resource.url, { next: { revalidate: 3600 } })
  if (!res.ok) return []

  const fmt = (resource.format ?? '').toUpperCase()
  let records: Record<string, string>[] = []

  if (fmt === 'CSV' || resource.url.toLowerCase().endsWith('.csv')) {
    records = parseCSV(await res.text())
  } else {
    const raw = await res.json().catch(() => null)
    if (!raw) return []
    records = Array.isArray(raw) ? raw : (raw.data ?? raw.result?.records ?? [])
  }

  return records.slice(0, 200).map((r) => mapRecord(r, resource.url))
}

/**
 * Trae vedas sanitarias desde el Portal de Datos Abiertos (datos.gob.cl).
 * Fuente oficial: SERNAPESCA / SUBPESCA. Devuelve solo vedas ACTIVAS.
 *
 * NOTA: el esquema de columnas de cada dataset varía; el mapeo es tolerante
 * pero debe verificarse contra los datos reales (scripts/inspect-sernapesca.mjs).
 * Si nada matchea, devuelve [] en vez de inventar.
 */
export async function fetchVedasActivas(): Promise<VedaSanitaria[]> {
  try {
    const queries = [
      'vedas marea roja',
      'veda sanitaria moluscos',
      'organization:servicio_nacional_de_pesca veda',
    ]

    const vedas: VedaSanitaria[] = []
    const seen = new Set<string>()

    for (const q of queries) {
      const searchUrl = `${DATOS_GOB_API}/package_search?q=${encodeURIComponent(q)}&rows=10`
      const res = await fetch(searchUrl, { next: { revalidate: 3600 } })
      if (!res.ok) continue

      const json = await res.json().catch(() => null)
      const datasets = json?.result?.results ?? []

      for (const dataset of datasets) {
        for (const resource of dataset.resources ?? []) {
          const fmt = (resource.format ?? '').toUpperCase()
          if (fmt !== 'JSON' && fmt !== 'CSV') continue
          if (seen.has(resource.url)) continue
          seen.add(resource.url)

          try {
            vedas.push(...(await parseResource(resource)))
          } catch {
            // Continuar con el siguiente recurso
          }
        }
      }
    }

    return vedas.filter((v) => v.estado === 'ACTIVA')
  } catch {
    return []
  }
}
