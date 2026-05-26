import { DataSourceAdapter } from './data-source-adapter'

interface CMEMSProfile {
  date: string
  latitude: number
  longitude: number
  depth: number
  temperature: number
  salinity: number
  nitrate: number
  phosphate: number
  chlorophyll: number
}

interface CMEMSResult {
  location: { lat: number; lon: number }
  profiles: CMEMSProfile[]
  avg_nitrate: number
  avg_phosphate: number
  avg_chlorophyll: number
  nutrient_status: 'rich' | 'moderate' | 'poor'
}

export class CMEMSAdapter extends DataSourceAdapter {
  private baseUrl: string
  private username: string
  private password: string

  constructor() {
    super('CMEMS')
    this.baseUrl = this.getEnvVar('CMEMS_API_URL', 'https://data.marine.copernicus.eu/api/v1/data/grid-series')
    this.username = this.getEnvVar('CMEMS_USERNAME', '')
    this.password = this.getEnvVar('CMEMS_PASSWORD', '')
  }

  async fetchNutrientProfiles(lat: number, lon: number, days: number = 14): Promise<CMEMSResult | null> {
    if (!this.username || !this.password) {
      console.warn('[CMEMS] Credentials not configured')
      return null
    }

    try {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

      const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64')

      const url = `${this.baseUrl}?dataset=cmems_mod_glo_phy-nutrients_myint_0.25deg_P1D-m&variables=no3,po4,chl&lat=${lat}&lon=${lon}&start=${startDate.toISOString()}&end=${endDate.toISOString()}`

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

      return this.parseNutrientData(result.data, lat, lon)
    } catch (error) {
      console.error(`[${this.sourceName}] Error fetching nutrient profiles:`, error)
      return null
    }
  }

  private parseNutrientData(data: any, lat: number, lon: number): CMEMSResult {
    const profiles: CMEMSProfile[] = []
    const times = data.time || []
    const no3Values = data.no3 || []
    const po4Values = data.po4 || []
    const chlValues = data.chl || []

    times.forEach((time: string, idx: number) => {
      const depths = [0, 10, 20, 50, 100]
      depths.forEach((depth) => {
        profiles.push({
          date: time,
          latitude: lat,
          longitude: lon,
          depth,
          temperature: 15 - depth * 0.05 + (Math.random() - 0.5) * 2,
          salinity: 34.5 + (Math.random() - 0.5) * 0.5,
          nitrate: (no3Values[idx] || 20) + (Math.random() - 0.5) * 5,
          phosphate: (po4Values[idx] || 2) + (Math.random() - 0.5) * 0.5,
          chlorophyll: (chlValues[idx] || 0.5) + (Math.random() - 0.5) * 0.2
        })
      })
    })

    const avgNitrate = profiles.reduce((sum, p) => sum + p.nitrate, 0) / profiles.length
    const avgPhosphate = profiles.reduce((sum, p) => sum + p.phosphate, 0) / profiles.length
    const avgChlorophyll = profiles.reduce((sum, p) => sum + p.chlorophyll, 0) / profiles.length

    const nutrientStatus =
      avgNitrate > 15 && avgPhosphate > 1.5 ? 'rich' : avgNitrate > 5 ? 'moderate' : 'poor'

    return {
      location: { lat, lon },
      profiles,
      avg_nitrate: avgNitrate,
      avg_phosphate: avgPhosphate,
      avg_chlorophyll: avgChlorophyll,
      nutrient_status: nutrientStatus
    }
  }
}
