import { NOAAUpwellingAdapter } from './noaa-upwelling-adapter'
import { CMEMSAdapter } from './cmems-adapter'
import { HyCOMAdapter } from './hycom-adapter'
import { ArgoAdapter } from './argo-adapter'
import { AVISOAdapter } from './aviso-adapter'
import { Sentinel3Adapter } from './sentinel3-adapter'
import { EMODnetAdapter } from './emodnet-adapter'
import { IOOSAdapter } from './ioos-adapter'
import { BioOracleAdapter } from './bio-oracle-adapter'
import { SourceAvailabilityTracker } from './data-source-adapter'

export interface OceanographicAssessment {
  location: {
    latitude: number
    longitude: number
  }
  timestamp: string
  sources_available: string[]
  sources_failed: string[]
  data: {
    noaa_upwelling?: any
    cmems?: any
    hycom?: any
    argo?: any
    aviso?: any
    sentinel3?: any
    emodnet?: any
    ioos?: any
    bio_oracle?: any
  }
  confidence_score: number
  assessment_quality: 'excellent' | 'good' | 'fair' | 'poor'
}

const SOURCE_WEIGHTS: Record<string, number> = {
  'Sentinel-3 OLCI': 0.25,
  'CMEMS': 0.15,
  'HyCOM': 0.15,
  'NOAA Upwelling Index': 0.1,
  'AVISO': 0.1,
  'EMODnet': 0.1,
  'IOOS': 0.05,
  'Bio-ORACLE': 0.05,
  'Argo Floats': 0.05
}

export class OceanographicService {
  private noaa: NOAAUpwellingAdapter
  private cmems: CMEMSAdapter
  private hycom: HyCOMAdapter
  private argo: ArgoAdapter
  private aviso: AVISOAdapter
  private sentinel3: Sentinel3Adapter
  private emodnet: EMODnetAdapter
  private ioos: IOOSAdapter
  private bioOracle: BioOracleAdapter
  private tracker: SourceAvailabilityTracker

  constructor() {
    this.noaa = new NOAAUpwellingAdapter()
    this.cmems = new CMEMSAdapter()
    this.hycom = new HyCOMAdapter()
    this.argo = new ArgoAdapter()
    this.aviso = new AVISOAdapter()
    this.sentinel3 = new Sentinel3Adapter()
    this.emodnet = new EMODnetAdapter()
    this.ioos = new IOOSAdapter()
    this.bioOracle = new BioOracleAdapter()
    this.tracker = new SourceAvailabilityTracker()
  }

  async assessOceanographicConditions(
    latitude: number,
    longitude: number,
    days: number = 14
  ): Promise<OceanographicAssessment> {
    const timestamp = new Date().toISOString()
    const data: OceanographicAssessment['data'] = {}

    console.log(`[OceanographicService] Starting assessment for (${latitude}, ${longitude})`)

    // Ejecutar todas las fuentes en paralelo
    const results = await Promise.allSettled([
      this.noaa.fetchUpwellingIndex(latitude, longitude, days).then(r => ({ source: 'NOAA Upwelling Index', data: r })),
      this.cmems.fetchNutrientProfiles(latitude, longitude, days).then(r => ({ source: 'CMEMS', data: r })),
      this.hycom.fetchOceanCurrents(latitude, longitude, days).then(r => ({ source: 'HyCOM', data: r })),
      this.argo.fetchArgoProfiles(latitude, longitude, days).then(r => ({ source: 'Argo Floats', data: r })),
      this.aviso.fetchEddyData(latitude, longitude, days).then(r => ({ source: 'AVISO', data: r })),
      this.sentinel3.fetchChlorophyll(latitude, longitude, days).then(r => ({ source: 'Sentinel-3 OLCI', data: r })),
      this.emodnet.fetchBathymetry(latitude, longitude).then(r => ({ source: 'EMODnet', data: r })),
      this.ioos.fetchBuoyData(latitude, longitude, days).then(r => ({ source: 'IOOS', data: r })),
      this.bioOracle.fetchClimatology(latitude, longitude).then(r => ({ source: 'Bio-ORACLE', data: r }))
    ])

    const sourcesAvailable: string[] = []
    const sourcesFailed: string[] = []

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        const { source, data } = result.value
        if (data) {
          this.tracker.markAvailable(source)
          sourcesAvailable.push(source)
          const key = source.toLowerCase().replace(/\s+/g, '_') as keyof OceanographicAssessment['data']
          Object.assign(data, { [key]: data })
        } else {
          this.tracker.markUnavailable(source)
          sourcesFailed.push(source)
        }
      } else {
        sourcesFailed.push('Unknown source')
        this.tracker.markUnavailable('Unknown source')
      }
    })

    const confidenceScore = Math.round(this.tracker.getConfidencePercentage(SOURCE_WEIGHTS))
    const assessmentQuality =
      confidenceScore >= 80 ? 'excellent' : confidenceScore >= 60 ? 'good' : confidenceScore >= 40 ? 'fair' : 'poor'

    console.log(`[OceanographicService] Assessment complete: ${sourcesAvailable.length}/${9} sources available, confidence ${confidenceScore}%`)

    return {
      location: { latitude, longitude },
      timestamp,
      sources_available: sourcesAvailable,
      sources_failed: sourcesFailed,
      data,
      confidence_score: confidenceScore,
      assessment_quality: assessmentQuality
    }
  }

  getSourceWeights(): Record<string, number> {
    return { ...SOURCE_WEIGHTS }
  }

  getAvailableSources(): string[] {
    return this.tracker.getAvailable()
  }

  getUnavailableSources(): string[] {
    return this.tracker.getUnavailable()
  }
}
