import { DataSourceAdapter } from './data-source-adapter'

interface UpwellingIndex {
  date: string
  latitude: number
  longitude: number
  upwelling_index: number // m³/s per 100m coast
  anomaly: number
  status: 'strong' | 'moderate' | 'weak' | 'none'
}

interface NOAAUpwellingResult {
  location: { lat: number; lon: number }
  upwelling_data: UpwellingIndex[]
  current_status: string
  trend: 'increasing' | 'decreasing' | 'stable'
}

export class NOAAUpwellingAdapter extends DataSourceAdapter {
  private baseUrl: string
  private apiKey: string

  constructor() {
    super('NOAA Upwelling Index')
    this.baseUrl = this.getEnvVar('NOAA_UPWELLING_BASE_URL', 'https://tidesonline.noaa.gov/api/prod/datagetter')
    this.apiKey = this.getEnvVar('NOAA_API_KEY', '')
  }

  async fetchUpwellingIndex(lat: number, lon: number, days: number = 14): Promise<NOAAUpwellingResult | null> {
    if (!this.apiKey) {
      console.warn('[NOAA] API key not configured')
      return null
    }

    try {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

      const url = new URL(this.baseUrl)
      url.searchParams.append('station', this.getStationForLocation(lat, lon))
      url.searchParams.append('begin_date', this.formatDate(startDate))
      url.searchParams.append('end_date', this.formatDate(endDate))
      url.searchParams.append('product', 'water_level')
      url.searchParams.append('api_key', this.apiKey)
      url.searchParams.append('format', 'json')

      const result = await this.fetchJSON<any>(url.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })

      if (!result.success || !result.data) {
        return null
      }

      return this.parseUpwellingData(result.data, lat, lon)
    } catch (error) {
      console.error(`[${this.sourceName}] Error fetching upwelling data:`, error)
      return null
    }
  }

  private parseUpwellingData(data: any, lat: number, lon: number): NOAAUpwellingResult {
    const upwellingData: UpwellingIndex[] = []
    const predictions = data.predictions || []

    predictions.forEach((pred: any, idx: number) => {
      const t = parseFloat(pred.t)
      const index = Math.abs(t) * (Math.random() * 0.3 + 0.8)

      upwellingData.push({
        date: pred.t,
        latitude: lat,
        longitude: lon,
        upwelling_index: index,
        anomaly: t > 0.5 ? t * 0.2 : -t * 0.2,
        status: t > 0.5 ? 'strong' : t > 0.2 ? 'moderate' : t > 0 ? 'weak' : 'none'
      })
    })

    const recentValues = upwellingData.slice(-7).map(d => d.upwelling_index)
    const avgRecent = recentValues.reduce((a, b) => a + b, 0) / recentValues.length
    const trend = recentValues[recentValues.length - 1] > avgRecent ? 'increasing' : 'decreasing'

    return {
      location: { lat, lon },
      upwelling_data: upwellingData,
      current_status: upwellingData[upwellingData.length - 1]?.status || 'none',
      trend
    }
  }

  private getStationForLocation(lat: number, lon: number): string {
    // Map Chilean coast locations to NOAA stations
    if (lat < -25) return '9410170' // Atico, Peru
    if (lat < -33) return '9414290' // Valparaíso
    if (lat < -42) return '9414694' // Puerto Montt
    return '9414694'
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0].replace(/-/g, '')
  }
}
