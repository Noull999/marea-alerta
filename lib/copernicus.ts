export interface CopernicusSSTData {
  latitude: number
  longitude: number
  sst: number // Sea Surface Temperature en °C
  clorofila: number | null // Chlorophyll mg/m³ — null si no hay fuente real
  anomalia: number // SST anomaly vs historical mean
  fetchedAt: string
}

export async function fetchCopernicusSSTData(
  lat: number,
  lon: number
): Promise<CopernicusSSTData | null> {
  const username = process.env.COPERNICUS_USERNAME
  const password = process.env.COPERNICUS_PASSWORD

  // Fallback a Open-Meteo si Copernicus no está configurado
  if (!username || !password) {
    return fetchCopernicusViaOpenMeteo(lat, lon)
  }

  try {
    // Copernicus OPeNDAP endpoint - retorna datos parseables
    const url = new URL('https://nrt.cmems-du.eu/thredds/dodsC/cmems_mod_glo_phy_my_0.083deg_P1D-m')
    url.searchParams.set('latitude', lat.toString())
    url.searchParams.set('longitude', lon.toString())

    const auth = Buffer.from(`${username}:${password}`).toString('base64')
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Basic ${auth}` },
      next: { revalidate: 86400 },
    })

    if (!res.ok) {
      console.warn(`Copernicus API error: ${res.status}, usando fallback`)
      return fetchCopernicusViaOpenMeteo(lat, lon)
    }

    const data = await res.json()

    // Extraer valores del response OPeNDAP. Si no vienen, NO fabricar:
    // caer al fallback real (Open-Meteo) en lugar de inventar números.
    const sstRaw = data.thetao?.[0]?.value
    const sst = sstRaw !== undefined ? parseFloat(sstRaw) : NaN
    if (Number.isNaN(sst)) {
      return fetchCopernicusViaOpenMeteo(lat, lon)
    }

    const chlRaw = data.chl?.[0]?.value
    const clorofila = chlRaw !== undefined ? parseFloat(chlRaw) : null

    // Calcular anomalía comparando con climatología
    const historicalMean = 13.0 // Promedio histórico para Chiloé
    const anomalia = sst - historicalMean

    return {
      latitude: lat,
      longitude: lon,
      sst,
      clorofila: clorofila !== null && Number.isNaN(clorofila) ? null : clorofila,
      anomalia,
      fetchedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Copernicus fetch error:', error)
    return fetchCopernicusViaOpenMeteo(lat, lon)
  }
}

// Fallback: Open-Meteo para SST real (gratis, sin credenciales)
async function fetchCopernicusViaOpenMeteo(
  lat: number,
  lon: number
): Promise<CopernicusSSTData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=sea_surface_temperature`

    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null

    const data = await res.json()

    // SST real de Open-Meteo. Si no viene, no hay dato fiable -> null.
    const sst = data.current?.sea_surface_temperature
    if (sst === undefined || sst === null) return null

    // Anomalía aproximada vs media regional fija (Chiloé). Es una baseline
    // gruesa, no una climatología real: usar con baja confianza.
    const historicalMean = 13.0
    const anomalia = sst - historicalMean

    // Open-Meteo NO entrega clorofila. No la fabricamos: queda null y la
    // confianza del modelo baja en consecuencia.
    return {
      latitude: lat,
      longitude: lon,
      sst,
      clorofila: null,
      anomalia,
      fetchedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Open-Meteo fallback error:', error)
    return null
  }
}

export async function estimarAnomaliaSST(lat: number, lon: number): Promise<number> {
  // Fallback si Copernicus no está disponible
  // En producción, usar datos históricos almacenados
  const data = await fetchCopernicusSSTData(lat, lon)
  return data?.anomalia ?? 0.5
}
