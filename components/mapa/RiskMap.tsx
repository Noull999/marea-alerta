'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false, loading: () => <div className="h-96 bg-blue-100 rounded-lg animate-pulse" /> }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
)

import { ZoneMarker } from './ZoneMarker'
import { RiskLegend } from './RiskLegend'

export interface ZonaRiesgo {
  nombre: string
  lat: number
  lon: number
  nivel: 'VERDE' | 'AMARILLO' | 'ROJO'
  recomendacion: string
}

export interface Centro {
  id: string
  nombre: string
  latitud: number
  longitud: number
}

interface RiskMapProps {
  zonas: ZonaRiesgo[]
  centrosUsuario: Centro[]
}

export function RiskMap({ zonas, centrosUsuario }: RiskMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-96 md:h-[500px] bg-blue-100 rounded-lg animate-pulse" />
  }

  return (
    <div className="relative">
      <MapContainer
        center={[-42.0, -73.0]}
        zoom={7}
        className="h-96 md:h-[500px] w-full rounded-lg z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org">OSM</a>'
        />
        {zonas.map((zona) => (
          <ZoneMarker key={zona.nombre} zona={zona} />
        ))}
        {centrosUsuario.map((centro) => (
          <ZoneMarker
            key={centro.id}
            zona={{
              nombre: centro.nombre,
              lat: centro.latitud,
              lon: centro.longitud,
              nivel: 'VERDE',
              recomendacion: 'Tu centro de cultivo',
            }}
            esCentroPropio
          />
        ))}
      </MapContainer>
      <RiskLegend />
    </div>
  )
}
