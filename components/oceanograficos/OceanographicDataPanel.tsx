'use client'
import { useEffect, useState } from 'react'

interface OceanographicData {
  zona: string
  lat: number
  lon: number
  timestamp: string
  sst?: { temperature: number; anomaly: number; fetchedAt: string }
  chlorophyll?: { concentration: number; fetchedAt: string }
  hab_alerts: Array<{ id: string; intensity: string; species: string }>
  ifop_events: Array<{ fecha: string; especie: string; toxicidad: number; nivelAlerta: string }>
  tide_prediction?: { fecha: string; nivelPromedio: number; variabilidad: number; optimo: boolean }
  sea_state?: { alturaOlas: string; direccionViento: string; velocidadViento: string; tendencia: string }
  risk_level: 'VERDE' | 'AMARILLO' | 'ROJO'
  risk_factors: {
    wave_height: number
    sst_anomaly: number
    chlorophyll_level: 'low' | 'moderate' | 'high'
    hab_probability: number
    active_ifop_alerts: number
    tide_variability: number
  }
}

function getRiskColor(level: string): string {
  switch (level) {
    case 'VERDE':
      return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40'
    case 'AMARILLO':
      return 'bg-amber-500/10 text-amber-300 border-amber-500/40'
    case 'ROJO':
      return 'bg-red-500/10 text-red-300 border-red-500/40'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

// Shared instrument-readout cell
function Metric({
  label,
  value,
  hint,
  hintClass,
}: {
  label: string
  value: string
  hint?: string
  hintClass?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/5">
      <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-heading text-2xl font-bold tabular-nums text-foreground">{value}</p>
      {hint && <p className={`mt-1 text-xs ${hintClass ?? 'text-muted-foreground'}`}>{hint}</p>}
    </div>
  )
}

function getChlorophyllLabel(level: string): string {
  switch (level) {
    case 'high':
      return 'Alta (>1.5)'
    case 'moderate':
      return 'Moderada (0.5-1.5)'
    case 'low':
      return 'Baja (<0.5)'
    default:
      return 'Desconocida'
  }
}

export function OceanographicDataPanel({ lat, lon, zona }: { lat: number; lon: number; zona: string }) {
  const [data, setData] = useState<OceanographicData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/oceanographic-data?lat=${lat}&lon=${lon}&zona=${encodeURIComponent(zona)}`)
        if (!res.ok) throw new Error(`Error ${res.status}`)
        const oceanData = await res.json()
        setData(oceanData)
        setError(null)
      } catch (err) {
        console.error('Error fetching oceanographic data:', err)
        setError('No se pudieron cargar los datos oceanográficos')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 3600000) // Actualizar cada hora
    return () => clearInterval(interval)
  }, [lat, lon, zona])

  if (loading) {
    return (
      <div className="animate-pulse rounded-xl border border-border bg-card p-6">
        <div className="mb-4 h-4 w-1/4 rounded bg-muted"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 rounded bg-muted"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
        <p className="text-sm text-amber-300">{error || 'Sin datos disponibles'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Risk Level Banner */}
      <div className={`rounded-xl border p-4 ${getRiskColor(data.risk_level)}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-70">Nivel de Riesgo</p>
            <h3 className="mt-1 font-heading text-lg font-semibold">{data.zona}</h3>
          </div>
          <div className="font-heading text-3xl font-bold tracking-tight">{data.risk_level}</div>
        </div>
      </div>

      {/* Ocean Conditions Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {data.sst && (
          <Metric
            label="Temp. Mar (TSM)"
            value={`${data.sst.temperature.toFixed(1)}°C`}
            hint={`${data.sst.anomaly > 0 ? '+' : ''}${data.sst.anomaly.toFixed(1)}°C anomalía`}
            hintClass={data.sst.anomaly > 0 ? 'text-red-400' : 'text-sky-400'}
          />
        )}
        {data.chlorophyll && (
          <Metric
            label="Clorofila"
            value={data.chlorophyll.concentration.toFixed(2)}
            hint={`mg/m³ (${getChlorophyllLabel(data.risk_factors.chlorophyll_level)})`}
          />
        )}
        <Metric
          label="Prob. HAB"
          value={`${(data.risk_factors.hab_probability * 100).toFixed(0)}%`}
          hint="Probabilidad de mareas rojas"
        />
        <Metric
          label="Altura Olas"
          value={`${data.risk_factors.wave_height.toFixed(2)}m`}
          hint="Condiciones oceanográficas"
        />
        {data.tide_prediction && (
          <Metric
            label="Variabilidad Mareas"
            value={`${data.tide_prediction.variabilidad.toFixed(0)} cm`}
            hint={data.tide_prediction.optimo ? 'Óptimo' : 'Subóptimo'}
            hintClass={data.tide_prediction.optimo ? 'text-emerald-400' : 'text-amber-400'}
          />
        )}
        <Metric
          label="Alertas IFOP"
          value={String(data.risk_factors.active_ifop_alerts)}
          hint="Eventos activos"
        />
      </div>

      {/* Sea State */}
      {data.sea_state && (
        <div className="rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/5">
          <h4 className="mb-3 font-heading font-semibold text-foreground">Estado del Mar</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Altura Olas</p>
              <p className="font-medium text-foreground">{data.sea_state.alturaOlas}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Tendencia</p>
              <p className="font-medium text-foreground">{data.sea_state.tendencia}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Viento</p>
              <p className="font-medium text-foreground">{data.sea_state.direccionViento}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Velocidad Viento</p>
              <p className="font-medium text-foreground">{data.sea_state.velocidadViento}</p>
            </div>
          </div>
        </div>
      )}

      {/* HAB Alerts */}
      {data.hab_alerts.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/5">
          <h4 className="mb-3 font-heading font-semibold text-foreground">Alertas HAB Activas ({data.hab_alerts.length})</h4>
          <div className="space-y-2">
            {data.hab_alerts.map((alert, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg bg-muted/40 p-2.5">
                <span className="text-sm text-foreground">{alert.species}</span>
                <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                  alert.intensity === 'HIGH' ? 'bg-red-500/15 text-red-300' :
                  alert.intensity === 'MODERATE' ? 'bg-amber-500/15 text-amber-300' :
                  'bg-emerald-500/15 text-emerald-300'
                }`}>
                  {alert.intensity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IFOP Events */}
      {data.ifop_events.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/5">
          <h4 className="mb-3 font-heading font-semibold text-foreground">Últimos Eventos IFOP ({data.ifop_events.length})</h4>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {data.ifop_events.slice(0, 5).map((event, idx) => (
              <div key={idx} className="rounded-lg bg-muted/40 p-2.5 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">{event.especie}</p>
                    <p className="font-mono text-muted-foreground">{new Date(event.fecha).toLocaleDateString('es-CL')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-medium tabular-nums text-foreground">{event.toxicidad} µg/kg</p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                      event.nivelAlerta === 'CUARENTENA' ? 'bg-red-500/15 text-red-300' :
                      event.nivelAlerta === 'ALERTA' ? 'bg-amber-500/15 text-amber-300' :
                      'bg-emerald-500/15 text-emerald-300'
                    }`}>
                      {event.nivelAlerta}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Updated */}
      <p className="text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
        Actualizado · {new Date(data.timestamp).toLocaleString('es-CL')}
      </p>
    </div>
  )
}
