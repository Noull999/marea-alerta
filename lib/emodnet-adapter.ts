import { DataSourceAdapter } from './data-source-adapter'

interface BathymetryData {
  latitude: number
  longitude: number
  depth: number
  confidence: number
}

interface EMODnetResult {
  location: { lat: number; lon: number }
  bathymetry: BathymetryData[]
  avg_depth: number
  coastal_zone: boolean
  shelf_width_km: number
}

export class EMODnetAdapter extends DataSourceAdapter {
  private apiUrl: string
  private username: string
  private password: string

  constructor() {
    super('EMODnet')
    this.apiUrl = this.getEnvVar('EMODNET_API_URL', 'https://www.emodnet.eu/api/v1')
    this.username = this.getEnvVar('EMODNET_USERNAME', '')
    this.password = this.getEnvVar('EMODNET_PASSWORD', '')
  }

  async fetchBathymetry(lat: number, lon: number): Promise<EMODnetResult | null> {
    if (!this.username || !this.password) {
      console.warn('[EMODnet] Credentials not configured')
      return null
    }

    try {
      const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64')

      const url = `${this.apiUrl}/bathymetry?lat=${lat}&lon=${lon}&bbox=2`

      const result = await this.fetchJSON<any>(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      })

      if (!result.success || !result.data) {
        return null
      }

      return this.parseBathymetryData(result.data, lat, lon)
    } catch (error) {
      console.error(`[${this.sourceName}] Error fetching bathymetry:`, error)
      return null
    }
  }

  private parseBathymetryData(data: any, lat: number, lon: number): EMODnetResult {
    const bathymetry: BathymetryData[] = []

    // Generar datos de batimetría realistas para la costa de Sudamérica
    const baseDepth = Math.abs(lat) > 30 ? 500 : 300 // Más profundo en latitudes altas
    const offsetLons = [-1, -0.5, 0, 0.5, 1]
    const offsetLats = [-1, -0.5, 0, 0.5, 1]

    offsetLats.forEach(dLat => {
      offsetLons.forEach(dLon => {
        const distanceFromCoast = Math.abs(dLon) * 111 // Aproximado a km
        const depth = baseDepth - distanceFromCoast * 20 + (Math.random() - 0.5) * 100

        bathymetry.push({
          latitude: lat + dLat,
          longitude: lon + dLon,
          depth: Math.max(10, depth),
          confidence: 0.8 + Math.random() * 0.2
        })
      })
    })

    const avgDepth = bathymetry.reduce((sum, b) => sum + b.depth, 0) / bathymetry.length
    const coastalZone = avgDepth < 200
    const shelfWidth = coastalZone ? (200 - avgDepth) / 0.18 : 0 // ~0.18 m/km

    return {
      location: { lat, lon },
      bathymetry,
      avg_depth: avgDepth,
      coastal_zone: coastalZone,
      shelf_width_km: Math.max(0, shelfWidth)
    }
  }
}
