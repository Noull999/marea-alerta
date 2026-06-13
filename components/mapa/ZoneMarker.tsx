'use client'
import dynamic from 'next/dynamic'
import L from 'leaflet'

const Marker = dynamic(
  () => import('react-leaflet').then((m) => m.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((m) => m.Popup),
  { ssr: false }
)

const COLOR_MAP: Record<'VERDE' | 'AMARILLO' | 'ROJO', string> = {
  VERDE: '#22c55e',
  AMARILLO: '#eab308',
  ROJO: '#ef4444',
}

function createColorIcon(color: string) {
  return L.divIcon({
    html: `<div style="width:20px;height:20px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.4)"></div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

interface Props {
  zona: {
    nombre: string
    lat: number
    lon: number
    nivel: 'VERDE' | 'AMARILLO' | 'ROJO'
    recomendacion: string
  }
  esCentroPropio?: boolean
}

export function ZoneMarker({ zona, esCentroPropio }: Props) {
  const color = esCentroPropio ? '#3b82f6' : COLOR_MAP[zona.nivel]

  return (
    <Marker position={[zona.lat, zona.lon]} icon={createColorIcon(color)}>
      <Popup>
        <div className="text-sm">
          <strong className="text-foreground">{zona.nombre}</strong>
          {!esCentroPropio && (
            <div className="mt-1">
              <span
                className={`font-bold ${
                  zona.nivel === 'ROJO'
                    ? 'text-red-400'
                    : zona.nivel === 'AMARILLO'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                Riesgo: {zona.nivel}
              </span>
              <p className="mt-1 text-xs text-muted-foreground">{zona.recomendacion}</p>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  )
}
