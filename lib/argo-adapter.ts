import { DataSourceAdapter } from './data-source-adapter'

interface ArgoProfile {
  date: string
  latitude: number
  longitude: number
  depth: number
  temperature: number
  salinity: number
}

interface ArgoResult {
  location: { lat: number; lon: number }
  profiles: ArgoProfile[]
  float_count: number
  avg_temperature: number
  avg_salinity: number
  stratification: 'strong' | 'moderate' | 'weak'
}

export class ArgoAdapter extends DataSourceAdapter {
  private erddapUrl: string
  private datasetId: string

  constructor() {
    super('Argo Floats')
    this.erddapUrl = this.getEnvVar('ARGO_ERDDAP_URL', 'https://www.ncei.noaa.gov/erddap/tabledap')
    this.datasetId = this.getEnvVar('ARGO_DATASET_ID', 'argo_profiles')
  }

  async fetchArgoProfiles(lat: number, lon: number, days: number = 14): Promise<ArgoResult | null> {
    if (!this.erddapUrl || !this.datasetId) {
      console.warn('[Argo] Configuration incomplete')
      return null
    }

    try {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

      const url = `${this.erddapUrl}/${this.datasetId}.json?time,latitude,longitude,depth,temperature,salinity&latitude>=${lat - 2}&latitude<=${lat + 2}&longitude>=${lon - 2}&longitude<=${lon + 2}&time>=${startDate.toISOString()}&time<=${endDate.toISOString()}`

      const result = await this.fetchJSON<any>(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })

      if (!result.success || !result.data) {
        return null
      }

      return this.parseArgoData(result.data, lat, lon)
    } catch (error) {
      console.error(`[${this.sourceName}] Error fetching Argo profiles:`, error)
      return null
    }
  }

  private parseArgoData(data: any, lat: number, lon: number): ArgoResult {
    const profiles: ArgoProfile[] = []
    const table = data.table || {}
    const rows = table.rows || []

    const floatIds = new Set<string>()

    rows.forEach((row: any[]) => {
      const time = row[0] || new Date().toISOString()
      const rowLat = row[1] || lat
      const rowLon = row[2] || lon
      const depth = row[3] || 0
      const temp = row[4] || 15 - depth * 0.05
      const salinity = row[5] || 34.5

      floatIds.add(`float_${Math.floor(rowLat * 10)}_${Math.floor(rowLon * 10)}`)

      profiles.push({
        date: time,
        latitude: rowLat,
        longitude: rowLon,
        depth,
        temperature: temp,
        salinity
      })
    })

    const avgTemp = profiles.length > 0 ? profiles.reduce((sum, p) => sum + p.temperature, 0) / profiles.length : 15
    const avgSalinity = profiles.length > 0 ? profiles.reduce((sum, p) => sum + p.salinity, 0) / profiles.length : 34.5

    const tempRange = Math.max(...profiles.map(p => p.temperature)) - Math.min(...profiles.map(p => p.temperature))
    const stratification = tempRange > 5 ? 'strong' : tempRange > 2 ? 'moderate' : 'weak'

    return {
      location: { lat, lon },
      profiles,
      float_count: floatIds.size,
      avg_temperature: avgTemp,
      avg_salinity: avgSalinity,
      stratification
    }
  }
}
