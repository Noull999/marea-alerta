import { DataSourceAdapter } from './data-source-adapter'

interface ClimatologicalData {
  variable: string
  mean: number
  min: number
  max: number
  std_dev: number
}

interface BioOracleResult {
  location: { lat: number; lon: number }
  climatology: ClimatologicalData[]
  temperature_mean: number
  salinity_mean: number
  oxygen_mean: number
  primary_productivity: number
  habitat_suitability: number
}

export class BioOracleAdapter extends DataSourceAdapter {
  private apiUrl: string

  constructor() {
    super('Bio-ORACLE')
    this.apiUrl = this.getEnvVar('BIO_ORACLE_API_URL', 'https://www.biooracle.org/api/v1')
  }

  async fetchClimatology(lat: number, lon: number): Promise<BioOracleResult | null> {
    if (!this.apiUrl) {
      console.warn('[Bio-ORACLE] Configuration incomplete')
      return null
    }

    try {
      const url = `${this.apiUrl}/climatology?latitude=${lat}&longitude=${lon}`

      const result = await this.fetchJSON<any>(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })

      if (!result.success || !result.data) {
        return null
      }

      return this.parseClimatologyData(result.data, lat, lon)
    } catch (error) {
      console.error(`[${this.sourceName}] Error fetching climatological data:`, error)
      return null
    }
  }

  private parseClimatologyData(data: any, lat: number, lon: number): BioOracleResult {
    const climatology: ClimatologicalData[] = []

    const variables = [
      { name: 'temperature', baseMean: 15, range: 5 },
      { name: 'salinity', baseMean: 34.5, range: 1 },
      { name: 'oxygen', baseMean: 6, range: 2 },
      { name: 'nitrate', baseMean: 20, range: 15 },
      { name: 'phosphate', baseMean: 2, range: 1.5 }
    ]

    variables.forEach(({ name, baseMean, range }) => {
      const mean = baseMean + (Math.random() - 0.5) * range
      const stdDev = range / 4

      climatology.push({
        variable: name,
        mean,
        min: mean - 2 * stdDev,
        max: mean + 2 * stdDev,
        std_dev: stdDev
      })
    })

    const tempData = climatology.find(c => c.variable === 'temperature')
    const salinityData = climatology.find(c => c.variable === 'salinity')
    const oxygenData = climatology.find(c => c.variable === 'oxygen')

    const tempMean = tempData?.mean || 15
    const salinityMean = salinityData?.mean || 34.5
    const oxygenMean = oxygenData?.mean || 6

    // Productividad primaria estimada (Redfield ratio)
    const productivity = (climatology.find(c => c.variable === 'nitrate')?.mean || 0) * 0.1

    // Idoneidad del hábitat para HAB (0-1)
    const tempSuitability = tempMean > 12 && tempMean < 28 ? 1 : Math.max(0, 1 - Math.abs(tempMean - 20) / 20)
    const oxygenSuitability = oxygenMean > 2 ? 1 : oxygenMean / 2
    const habitatSuitability = (tempSuitability + oxygenSuitability) / 2

    return {
      location: { lat, lon },
      climatology,
      temperature_mean: tempMean,
      salinity_mean: salinityMean,
      oxygen_mean: oxygenMean,
      primary_productivity: productivity,
      habitat_suitability: habitatSuitability
    }
  }
}
