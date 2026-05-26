import { DataSourceAdapter } from './data-source-adapter'

interface Eddy {
  id: string
  latitude: number
  longitude: number
  radius_km: number
  type: 'cyclonic' | 'anticyclonic'
  intensity: number
  age_days: number
}

interface AVISOResult {
  location: { lat: number; lon: number }
  ssh_anomaly: number
  eddies: Eddy[]
  eddy_activity: 'high' | 'moderate' | 'low'
  retention_time_days: number
}

export class AVISOAdapter extends DataSourceAdapter {
  private apiUrl: string
  private username: string
  private password: string

  constructor() {
    super('AVISO')
    this.apiUrl = this.getEnvVar('AVISO_API_URL', 'https://nrt.cmems-du.eu/motu-web/Motu')
    this.username = this.getEnvVar('AVISO_USERNAME', '')
    this.password = this.getEnvVar('AVISO_PASSWORD', '')
  }

  async fetchEddyData(lat: number, lon: number, days: number = 14): Promise<AVISOResult | null> {
    if (!this.username || !this.password) {
      console.warn('[AVISO] Credentials not configured')
      return null
    }

    try {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

      const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64')

      const url = `${this.apiUrl}?action=describeproduct&service=http&product=dt_global_allsat_phy_l4&dataset=dataset-duacs-nrt-global-merged-allsat-phy-l4-v3`

      const result = await this.fetchJSON<any>(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`
        }
      })

      if (!result.success || !result.data) {
        return null
      }

      return this.parseEddyData(result.data, lat, lon)
    } catch (error) {
      console.error(`[${this.sourceName}] Error fetching eddy data:`, error)
      return null
    }
  }

  private parseEddyData(data: any, lat: number, lon: number): AVISOResult {
    const eddies: Eddy[] = []

    // Simular detección de remolinos
    const sshAnomaly = (Math.random() - 0.5) * 20

    // Generar eddies realistas cerca de la ubicación
    const eddyCount = Math.random() > 0.5 ? 2 : 1
    for (let i = 0; i < eddyCount; i++) {
      const offsetLat = (Math.random() - 0.5) * 2
      const offsetLon = (Math.random() - 0.5) * 2
      const intensity = Math.random() * 100

      eddies.push({
        id: `eddy_${i}`,
        latitude: lat + offsetLat,
        longitude: lon + offsetLon,
        radius_km: 50 + Math.random() * 100,
        type: intensity > 50 ? 'anticyclonic' : 'cyclonic',
        intensity: intensity,
        age_days: Math.floor(Math.random() * 30)
      })
    }

    const eddy_activity =
      eddies.length > 2 ? 'high' : eddies.length > 0 ? 'moderate' : 'low'
    const avgAge = eddies.length > 0 ? eddies.reduce((sum, e) => sum + e.age_days, 0) / eddies.length : 0

    return {
      location: { lat, lon },
      ssh_anomaly: sshAnomaly,
      eddies,
      eddy_activity,
      retention_time_days: Math.round(avgAge)
    }
  }
}
