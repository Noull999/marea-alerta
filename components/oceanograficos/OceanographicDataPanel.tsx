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
      return 'bg-green-100 text-green-800 border-green-300'
    case 'AMARILLO':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'ROJO':
      return 'bg-red-100 text-red-800 border-red-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
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
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
        <p className="text-yellow-800 text-sm">{error || 'Sin datos disponibles'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Risk Level Banner */}
      <div className={`rounded-lg border-2 p-4 ${getRiskColor(data.risk_level)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Nivel de Riesgo: {data.risk_level}</h3>
            <p className="text-sm opacity-90 mt-1">Zona: {data.zona}</p>
          </div>
          <div className="text-3xl font-bold opacity-50">{data.risk_level}</div>
        </div>
      </div>

      {/* Ocean Conditions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* SST */}
        {data.sst && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-gray-600 text-xs font-medium uppercase">Temperatura Mar (TSM)</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{data.sst.temperature.toFixed(1)}°C</p>
            <p className={`text-xs mt-1 ${data.sst.anomaly > 0 ? 'text-red-600' : 'text-blue-600'}`}>
              {data.sst.anomaly > 0 ? '+' : ''}{data.sst.anomaly.toFixed(1)}°C anomalía
            </p>
          </div>
        )}

        {/* Chlorophyll */}
        {data.chlorophyll && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-gray-600 text-xs font-medium uppercase">Clorofila</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{data.chlorophyll.concentration.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">mg/m³ ({getChlorophyllLabel(data.risk_factors.chlorophyll_level)})</p>
          </div>
        )}

        {/* HAB Probability */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-gray-600 text-xs font-medium uppercase">Prob. HAB</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{(data.risk_factors.hab_probability * 100).toFixed(0)}%</p>
          <p className="text-xs text-gray-500 mt-1">Probabilidad de mareas rojas</p>
        </div>

        {/* Wave Height */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-gray-600 text-xs font-medium uppercase">Altura Olas</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{data.risk_factors.wave_height.toFixed(2)}m</p>
          <p className="text-xs text-gray-500 mt-1">Condiciones oceanográficas</p>
        </div>

        {/* Tide Variability */}
        {data.tide_prediction && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-gray-600 text-xs font-medium uppercase">Variabilidad Mareas</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{data.tide_prediction.variabilidad.toFixed(0)} cm</p>
            <p className="text-xs text-gray-500 mt-1">{data.tide_prediction.optimo ? 'Óptimo' : 'Subóptimo'}</p>
          </div>
        )}

        {/* IFOP Alerts */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-gray-600 text-xs font-medium uppercase">Alertas IFOP</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{data.risk_factors.active_ifop_alerts}</p>
          <p className="text-xs text-gray-500 mt-1">Eventos activos</p>
        </div>
      </div>

      {/* Sea State */}
      {data.sea_state && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Estado del Mar</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 uppercase">Altura Olas</p>
              <p className="font-medium text-gray-900">{data.sea_state.alturaOlas}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase">Tendencia</p>
              <p className="font-medium text-gray-900">{data.sea_state.tendencia}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase">Viento</p>
              <p className="font-medium text-gray-900">{data.sea_state.direccionViento}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase">Velocidad Viento</p>
              <p className="font-medium text-gray-900">{data.sea_state.velocidadViento}</p>
            </div>
          </div>
        </div>
      )}

      {/* HAB Alerts */}
      {data.hab_alerts.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Alertas HAB Activas ({data.hab_alerts.length})</h4>
          <div className="space-y-2">
            {data.hab_alerts.map((alert, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm text-gray-700">{alert.species}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  alert.intensity === 'HIGH' ? 'bg-red-100 text-red-700' :
                  alert.intensity === 'MODERATE' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
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
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Últimos Eventos IFOP ({data.ifop_events.length})</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.ifop_events.slice(0, 5).map((event, idx) => (
              <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{event.especie}</p>
                    <p className="text-gray-600">{new Date(event.fecha).toLocaleDateString('es-CL')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{event.toxicidad} µg/kg</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      event.nivelAlerta === 'CUARENTENA' ? 'bg-red-100 text-red-700' :
                      event.nivelAlerta === 'ALERTA' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
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
      <p className="text-xs text-gray-500 text-center">
        Datos actualizados: {new Date(data.timestamp).toLocaleString('es-CL')}
      </p>
    </div>
  )
}
