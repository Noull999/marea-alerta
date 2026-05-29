# Auditoría de fuentes de datos — MareaAlerta

**Fecha:** 2026-05-29
**Objetivo:** documentar, fuente por fuente, qué dato es **real**, cuál es **estimado/proxy** y cuál es **simulado** (`Math.random()`), para priorizar el cableado de datos reales antes de cualquier validación contra SERNAPESCA.

> ⚠️ **Hallazgo central:** el riesgo en producción (`/api/fan-data`) se calcula con
> **40 % anomalía SST + 40 % clorofila + 20 % oleaje** (`app/api/fan-data/route.ts:79`).
> Hoy el factor más pesado (clorofila) **no proviene de ningún satélite real** en la
> ruta sin credenciales: es un proxy con ruido aleatorio. Contrastar estos números
> contra SERNAPESCA hoy mide ruido, no un modelo.

## Leyenda

- ✅ **Real** — viene de una API/fuente externa real y verificable.
- 🟡 **Estimado** — valor derivado/proxy a partir de un dato real (documentado como tal).
- ❌ **Simulado** — generado con `Math.random()` o hardcodeado. No es dato.

## Resumen por fuente

| Archivo | Qué provee | Estado | Notas |
|---|---|---|---|
| `lib/open-meteo.ts` | Oleaje, viento | ✅ Real | API pública sin key. Confiable. |
| `lib/copernicus.ts` (con credenciales) | SST, clorofila | 🟡/❌ | Si la API falla, rellena con `12.5 + Math.random()*3` y `0.5 + Math.random()*2`. |
| `lib/copernicus.ts` (fallback Open-Meteo) | SST | ✅ Real | SST real… |
| `lib/copernicus.ts` (fallback Open-Meteo) | Clorofila | ❌ Simulado | Proxy `0.8 - anomalia*0.15 + Math.random()*0.5`. **40 % del riesgo.** |
| `lib/copernicus.ts` | Anomalía SST | 🟡 Estimado pobre | Se calcula contra un promedio fijo `13.0 °C` hardcodeado, no contra climatología real. |
| `lib/nasa-oceancolor.ts` (con `NASA_API_KEY`) | Clorofila | ✅ Real (no verificado) | Endpoint real; pendiente validar respuesta. |
| `lib/nasa-oceancolor.ts` (fallback) | Clorofila | ❌ Simulado | `1.2 + Math.random()*0.8` según SST. |
| `lib/ifop.ts` | Eventos FAN históricos | ❌ Simulado | 50 eventos con `Math.random()` (toxicidad, especie, fecha). |
| `lib/ifop.ts` | Alertas PSP actuales | ❌ Hardcodeado | Alertas fijas de "Castro" y "Quellón". **Crítico en una app de seguridad.** |
| `lib/subpesca.ts` | Vedas SERNAPESCA | 🟡 Real frágil | Lee datos.gob.cl real, pero adivina nombres de columnas; puede devolver basura o vacío. |
| `lib/noaa-upwelling-index.ts` | Índice de surgencia | ✅ Real (no verificado) | Intenta ERDDAP PFEL real. Series 7/14 días: aproximadas (`*0.95`, `*0.90`). |
| `lib/wavewatch-iii.ts` | Oleaje significativo | ✅ Real | Intenta NOAA WW3 y cae a Open-Meteo (real). Sin simulación. |
| `lib/hycom.ts` / `hycom-adapter.ts` | MLD, corrientes | ❌ Simulado | `Math.random()` (4 ocurrencias en el adapter). |
| `lib/shoa.ts` | Mareas | ❌ Simulado | `Math.random()` (3). El scraping real está como TODO. |
| `lib/cmems-adapter.ts` | SST/clorofila CMEMS | ❌ Simulado | `Math.random()` (5). |
| `lib/aviso-adapter.ts` | Altimetría/SSH | ❌ Simulado | `Math.random()` (7). |
| `lib/ioos-adapter.ts` | Boyas IOOS | ❌ Simulado | `Math.random()` (4). |
| `lib/nasa-oceancolor.ts`, `lib/sentinel3-adapter.ts` | Clorofila satelital | ❌ Simulado (fallback) | `Math.random()`. |
| `lib/emodnet-adapter.ts`, `lib/bio-oracle-adapter.ts`, `lib/gebco-bathymetry.ts`, `lib/opendrift-dispersal.ts`, `lib/noaa-upwelling-adapter.ts`, `lib/data-source-adapter.ts`, `lib/report-generator.ts` | Varios | ❌ Simulado | Contienen `Math.random()`. |

**Total: 16 archivos en `lib/` con `Math.random()`** (ver `grep -rl "Math.random" lib`).

## Impacto por camino de ejecución

### Camino A — `/api/fan-data` (mapa y tarjetas del dashboard)
Usa: `open-meteo` ✅, `copernicus` 🟡/❌, `nasa-oceancolor` ❌, `wavewatch-iii` ✅, `hycom` ❌, `noaa-upwelling-index` ✅(?).
→ **Oleaje real; SST real pero anomalía pobre; clorofila simulada.** El score es poco fiable.

### Camino B — cron / `oceanographic-alert-engine`
Usa `integratedOceanographicAssessment`, que agrega los `*-adapter.ts` (mayoría simulados).
→ **Las alertas automáticas que se envían por push se basan, en parte, en datos simulados.**

## Prioridad de cableado (orden recomendado)

1. **Clorofila real** (40 % del riesgo) — NASA OceanColor / Copernicus Marine reales. Sin esto el modelo no significa nada.
2. **Anomalía SST real** — climatología real (p. ej. promedio histórico por día/zona) en vez del `13.0 °C` fijo.
3. **IFOP/SERNAPESCA reales** — toxinas y vedas (verdad de terreno). Ver ingester.
4. **Resto de adaptadores** — surgencia, MLD, mareas. Menor peso, pero deben dejar de simular.

## Regla de integridad

**Donde no hay dato real, devolver `null` / "no disponible" y bajar la confianza — nunca fabricar un número.** Una app de seguridad alimentaria no puede inventar valores que disparan (o silencian) alertas.

## Cómo validar (cuando haya datos reales)

Ver `docs/BACKTESTING.md` y `scripts/backtest.ts`: contrasta las predicciones del
modelo contra las vedas históricas oficiales de SERNAPESCA (matriz de confusión,
anticipación en días).
</content>
</invoke>
