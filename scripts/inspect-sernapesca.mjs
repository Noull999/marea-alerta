#!/usr/bin/env node
/**
 * Inspecciona qué publica realmente datos.gob.cl para vedas / marea roja.
 * Sirve para descubrir el esquema REAL de columnas y así afinar el mapeo en
 * lib/subpesca.ts. Requiere salida a internet (datos.gob.cl).
 *
 *   node scripts/inspect-sernapesca.mjs
 *   node scripts/inspect-sernapesca.mjs "veda sanitaria moluscos"
 */

const API = 'https://datos.gob.cl/api/3/action'
const query = process.argv[2] || 'vedas marea roja'

async function main() {
  const url = `${API}/package_search?q=${encodeURIComponent(query)}&rows=10`
  console.log(`\n🔎 Buscando: "${query}"\n${url}\n`)

  const res = await fetch(url)
  if (!res.ok) {
    console.error(`❌ HTTP ${res.status} al consultar datos.gob.cl`)
    process.exit(1)
  }

  const json = await res.json()
  const datasets = json?.result?.results ?? []
  console.log(`📦 ${datasets.length} datasets encontrados\n`)

  for (const ds of datasets) {
    console.log(`──────────────────────────────────────────`)
    console.log(`Dataset: ${ds.title}`)
    console.log(`  org: ${ds.organization?.title ?? '—'}`)
    console.log(`  license: ${ds.license_title ?? ds.license_id ?? '—'}`)
    const resources = (ds.resources ?? []).filter(
      (r) => ['CSV', 'JSON'].includes((r.format ?? '').toUpperCase())
    )
    for (const r of resources) {
      console.log(`  • [${r.format}] ${r.name ?? ''}`)
      console.log(`    ${r.url}`)
      try {
        const rr = await fetch(r.url)
        if (!rr.ok) { console.log(`    ⚠️  HTTP ${rr.status}`); continue }
        if ((r.format ?? '').toUpperCase() === 'CSV') {
          const text = await rr.text()
          const header = text.split(/\r?\n/)[0]
          console.log(`    columnas: ${header}`)
        } else {
          const data = await rr.json()
          const sample = Array.isArray(data) ? data[0] : (data.data?.[0] ?? data.result?.records?.[0])
          console.log(`    columnas: ${sample ? Object.keys(sample).join(', ') : '(vacío)'}`)
        }
      } catch (e) {
        console.log(`    ⚠️  no se pudo leer: ${e.message}`)
      }
    }
  }
  console.log(`\n✅ Usa estas columnas para afinar FIELD_ALIASES en lib/subpesca.ts\n`)
}

main().catch((e) => { console.error(e); process.exit(1) })
