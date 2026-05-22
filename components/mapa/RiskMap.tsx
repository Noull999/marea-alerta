'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false, loading: () => <div className="w-full h-96 md:h-[500px] bg-gray-200 rounded-lg animate-pulse flex items-center justify-center"><p className="text-gray-500">Cargando mapa...</p></div> }
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
    return <div className="w-full h-96 md:h-[500px] bg-gray-200 rounded-lg animate-pulse flex items-center justify-center"><p className="text-gray-500">Cargando mapa...</p></div>
  }

  return (
    <div className="w-full">
      <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50" style={{ height: '500px' }}>
        {zonas.length === 0 && centrosUsuario.length === 0 ? (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500 text-center">
              <p className="font-medium">Sin datos para mostrar</p>
              <p className="text-sm">Cargando información de zonas...</p>
            </p>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <MapContainer
              center={[-42.0, -73.0]}
              zoom={7}
              style={{ width: '100%', height: '100%', zIndex: 1 }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org">OSM</a>'
              />
              {zonas && zonas.length > 0 && zonas.map((zona) => (
                <ZoneMarker key={zona.nombre} zona={zona} />
              ))}
              {centrosUsuario && centrosUsuario.length > 0 && centrosUsuario.map((centro) => (
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
        )}
      </div>
    </div>
  )
}
