import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { OceanographicDataPanel } from '@/components/oceanograficos/OceanographicDataPanel'

// Zonas predefinidas de Chiloé para análisis
const ZONAS_PREDEFINIDAS = [
  { nombre: 'Castro', lat: -42.48, lon: -73.77 },
  { nombre: 'Ancud', lat: -41.87, lon: -73.82 },
  { nombre: 'Quellón', lat: -43.12, lon: -73.62 },
  { nombre: 'Dalcahue', lat: -42.39, lon: -73.69 },
  { nombre: 'Puerto Montt', lat: -41.33, lon: -72.76 },
  { nombre: 'La Unión', lat: -40.31, lon: -72.24 },
  { nombre: 'Puerto Varas', lat: -41.31, lon: -72.59 },
  { nombre: 'Osorno', lat: -40.58, lon: -72.53 },
]

export default async function OceanograficoPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const centrosUsuario = await db.centro.findMany({
    where: { userId: session.user.id },
  })

  // Usar los centros del usuario, o las zonas predefinidas si no tiene
  const zonasAMostrar = centrosUsuario.length > 0
    ? centrosUsuario.map((c) => ({
        nombre: c.nombre,
        lat: c.latitud,
        lon: c.longitud,
      }))
    : ZONAS_PREDEFINIDAS

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Análisis Oceanográfico</h1>
        <p className="text-gray-600 mt-1">
          Datos integrados de múltiples fuentes: Copernicus, NOAA HAB, IFOP y SHOA
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {zonasAMostrar.map((zona) => (
          <div key={`${zona.lat}-${zona.lon}`}>
            <div className="mb-3">
              <h2 className="text-xl font-semibold text-gray-900">{zona.nombre}</h2>
              <p className="text-sm text-gray-500">
                Coordenadas: {zona.lat.toFixed(2)}°, {zona.lon.toFixed(2)}°
              </p>
            </div>
            <OceanographicDataPanel
              lat={zona.lat}
              lon={zona.lon}
              zona={zona.nombre}
            />
          </div>
        ))}
      </div>

      {/* Information Footer */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mt-8">
        <h3 className="font-semibold text-blue-900 mb-2">Fuentes de Datos</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            <span className="font-medium">Copernicus Marine:</span> Temperatura superficial del mar (TSM),
            anomalías de temperatura y concentración de clorofila-a
          </li>
          <li>
            <span className="font-medium">NOAA HAB:</span> Pronósticos de mareas rojas y probabilidad
            de floraciones de algas nocivas
          </li>
          <li>
            <span className="font-medium">IFOP:</span> Monitoreo de mareas rojas con niveles de
            toxicidad y alertas sanitarias de Chile
          </li>
          <li>
            <span className="font-medium">SHOA:</span> Predicciones de mareas, estado del mar y
            recomendaciones de navegación
          </li>
        </ul>
      </div>

      {/* Risk Level Guide */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Guía de Niveles de Riesgo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-semibold text-green-900">VERDE - Riesgo Bajo</p>
            <p className="text-sm text-green-700 mt-2">
              Condiciones oceanográficas normales. Continúe con operaciones habituales y monitoreo
              rutinario.
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="font-semibold text-yellow-900">AMARILLO - Riesgo Moderado</p>
            <p className="text-sm text-yellow-700 mt-2">
              Se detectan factores de riesgo moderados. Monitoree continuamente y esté preparado
              para acciones defensivas.
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="font-semibold text-red-900">ROJO - Riesgo Alto</p>
            <p className="text-sm text-red-700 mt-2">
              Múltiples factores de riesgo detectados. Considere cosecha inmediata o solicite
              confirmación oficial.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
