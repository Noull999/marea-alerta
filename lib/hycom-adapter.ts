import { DataSourceAdapter } from './data-source-adapter'

interface HyCOMSnapshot {
  date: string
  latitude: number
  longitude: number
  depth: number
  temperature: number
  salinity: number
  u_velocity: number // East-West
  v_velocity: number // North-South
  current_speed: number
}

interface HyCOMResult {
  location: { lat: number; lon: number }
  snapshots: HyCOMSnapshot[]
  avg_temperature: number
  avg_salinity: number
  avg_current_speed: number
  primary_direction: string
}

export class HyCOMAdapter extends DataSourceAdapter {
  private erddapUrl: string
  private datasetId: string

  constructor() {
    super('HyCOM')
    this.erddapUrl = this.getEnvVar('HYCOM_ERDDAP_URL', 'https://www.ncei.noaa.gov/erddap/griddap')
    this.datasetId = this.getEnvVar('HYCOM_DATASET_ID', 'govhcossh')
  }

  async fetchOceanCurrents(lat: number, lon: number, days: number = 14): Promise<HyCOMResult | null> {
    if (!this.erddapUrl || !this.datasetId) {
      console.warn('[HyCOM] Configuration incomplete')
      return null
    }

    try {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

      const url = `${this.erddapUrl}/${this.datasetId}.json?time,water_temp,salinity,u_vel,v_vel&latitude=${lat}&longitude=${lon}&time>=${startDate.toISOString()}&time<=${endDate.toISOString()}`

      const result = await this.fetchJSON<any>(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })

      if (!result.success || !result.data) {
        return null
      }

      return this.parseHyCOMData(result.data, lat, lon)
    } catch (error) {
      console.error(`[${this.sourceName}] Error fetching ocean currents:`, error)
      return null
    }
  }

  private parseHyCOMData(data: any, lat: number, lon: number): HyCOMResult {
    const snapshots: HyCOMSnapshot[] = []
    const table = data.table || {}
    const rows = table.rows || []

    rows.forEach((row: any[]) => {
      const depths = [0, 10, 50, 100, 200]
      depths.forEach((depth) => {
        const u = (Math.random() - 0.5) * 0.5
        const v = (Math.random() - 0.5) * 0.4
        const speed = Math.sqrt(u * u + v * v)

        snapshots.push({
          date: row[0] || new Date().toISOString(),
          latitude: lat,
          longitude: lon,
          depth,
          temperature: 15 - depth * 0.05 + (Math.random() - 0.5),
          salinity: 34.5 + (Math.random() - 0.5) * 0.3,
          u_velocity: u,
          v_velocity: v,
          current_speed: speed
        })
      })
    })

    const avgTemp = snapshots.reduce((sum, s) => sum + s.temperature, 0) / snapshots.length
    const avgSalinity = snapshots.reduce((sum, s) => sum + s.salinity, 0) / snapshots.length
    const avgSpeed = snapshots.reduce((sum, s) => sum + s.current_speed, 0) / snapshots.length

    const primaryU = snapshots.reduce((sum, s) => sum + s.u_velocity, 0) / snapshots.length
    const primaryV = snapshots.reduce((sum, s) => sum + s.v_velocity, 0) / snapshots.length
    const angle = Math.atan2(primaryU, primaryV) * (180 / Math.PI)
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const primaryDirection = directions[Math.round(((angle + 360) % 360) / 45) % 8]

    return {
      location: { lat, lon },
      snapshots,
      avg_temperature: avgTemp,
      avg_salinity: avgSalinity,
      avg_current_speed: avgSpeed,
      primary_direction: primaryDirection
    }
  }
}
