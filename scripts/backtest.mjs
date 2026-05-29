#!/usr/bin/env node
/**
 * Backtest / validación de concordancia del modelo de riesgo.
 *
 * Contrasta lo que predice el modelo (GET /api/fan-data) contra la verdad de
 * terreno: vedas sanitarias oficiales activas (GET /api/vedas, fuente
 * SERNAPESCA vía datos.gob.cl).
 *
 * Produce una matriz de confusión + precision/recall/F1, y agrega el resultado
 * a scripts/backtest-log.jsonl. Corriéndolo periódicamente (p. ej. diario) se
 * acumula un backtest histórico REAL — algo que hoy la app no almacena.
 *
 * Uso:
 *   node scripts/backtest.mjs                       # usa http://localhost:3000
 *   node scripts/backtest.mjs https://tu-app.vercel.app
 *
 * Requiere: la app corriendo + salida a internet a datos.gob.cl.
 *
 * NOTA: un backtest HISTÓRICO completo (no solo "ahora") requiere guardar las
 * predicciones diarias o reconstruirlas con inputs históricos (Open-Meteo
 * archive). Ver docs/BACKTESTING.md.
 */

import { appendFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const BASE = process.argv[2] || 'http://localhost:3000'
const LOG = join(dirname(fileURLToPath(import.meta.url)), 'backtest-log.jsonl')

// ¿La zona del modelo coincide con una zona con veda activa?
function matchVeda(zonaModelo, vedas) {
  const n = zonaModelo.toLowerCase()
  return vedas.some((v) => {
    const z = (v.zona || '').toLowerCase()
    const r = (v.region || '').toLowerCase()
    return z && (n.includes(z) || z.includes(n) || (r && n.includes(r)))
  })
}

async function getJSON(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`GET ${path} -> HTTP ${res.status}`)
  return res.json()
}

async function main() {
  console.log(`\n🔬 Backtest de concordancia\n   app:   ${BASE}\n`)

  const [fan, vedasResp] = await Promise.all([
    getJSON('/api/fan-data'),
    getJSON('/api/vedas'),
  ])

  const zonas = fan.zonas ?? []
  const vedas = vedasResp.vedas ?? []
  console.log(`   zonas modelo: ${zonas.length} | vedas activas oficiales: ${vedas.length}\n`)

  if (vedas.length === 0) {
    console.log('⚠️  No hay vedas activas oficiales (o el ingester no devolvió datos).')
    console.log('   Verifica primero: node scripts/inspect-sernapesca.mjs\n')
  }

  // Verdad de terreno: ¿hay veda activa en esa zona? (positivo = riesgo real)
  // Predicción: el modelo alerta (ROJO o AMARILLO) = positivo.
  let tp = 0, fp = 0, tn = 0, fn = 0
  const detalle = []

  for (const z of zonas) {
    const vedaReal = matchVeda(z.nombre, vedas)
    const modeloAlerta = z.nivel === 'ROJO' || z.nivel === 'AMARILLO'

    if (modeloAlerta && vedaReal) tp++
    else if (modeloAlerta && !vedaReal) fp++
    else if (!modeloAlerta && !vedaReal) tn++
    else fn++

    detalle.push({ zona: z.nombre, nivel: z.nivel, score: z.riesgoScore ?? null, vedaReal })
  }

  const precision = tp + fp ? tp / (tp + fp) : null
  const recall = tp + fn ? tp / (tp + fn) : null
  const f1 = precision && recall ? (2 * precision * recall) / (precision + recall) : null

  console.log('Matriz de confusión (alerta del modelo vs veda oficial activa):')
  console.log('                      veda SÍ   veda NO')
  console.log(`   modelo alerta SÍ      ${String(tp).padStart(4)}      ${String(fp).padStart(4)}`)
  console.log(`   modelo alerta NO      ${String(fn).padStart(4)}      ${String(tn).padStart(4)}`)
  console.log('')
  console.log(`   Precision: ${precision === null ? 'n/a' : precision.toFixed(2)}  (de las alertas, cuántas coinciden con veda)`)
  console.log(`   Recall:    ${recall === null ? 'n/a' : recall.toFixed(2)}  (de las vedas, cuántas detectó el modelo)`)
  console.log(`   F1:        ${f1 === null ? 'n/a' : f1.toFixed(2)}`)
  console.log('')

  // ⚠️ Falsos negativos = lo más peligroso (veda real sin alerta).
  const falsosNegativos = detalle.filter((d) => d.vedaReal && d.nivel === 'VERDE')
  if (falsosNegativos.length) {
    console.log('🚨 FALSOS NEGATIVOS (veda activa pero modelo en VERDE):')
    falsosNegativos.forEach((d) => console.log(`   - ${d.zona}`))
    console.log('')
  }

  const record = {
    timestamp: new Date().toISOString(),
    base: BASE,
    counts: { tp, fp, tn, fn },
    metrics: { precision, recall, f1 },
    detalle,
  }
  await appendFile(LOG, JSON.stringify(record) + '\n')
  console.log(`📝 Resultado agregado a ${LOG}`)
  console.log('   Corre esto a diario (cron) para acumular un backtest histórico real.\n')
}

main().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1) })
