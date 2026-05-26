/**
 * ENHANCED OCEANOGRAPHIC DATA
 * Integrates all new data sources:
 * - NASA OCEANCOLOR (Clorofila 1km)
 * - WAVEWATCH III (Olas mejor resolución)
 * - METAR (Vientos in-situ)
 * - ARGO FLOATS (Perfiles verticales)
 * - GEBCO (Batimetría)
 * - GTSPP (Validación T-S)
 * - HyCOM (Resolución 9km)
 * - GLORYS (Contexto histórico)
 * - NOAA UPWELLING INDEX (Predicción 14-21 días)
 */

import { NextResponse, NextRequest } from 'next/server'
import { fetchNASAOceancolorData, compareChlorophyllSources } from '@/lib/nasa-oceancolor'
import { fetchWaveWatchIII, compareWaveSources } from '@/lib/wavewatch-iii'
import { fetchMETARData, fetchAllCoastalMETAR, analyzeWindConditionsForBlooms } from '@/lib/metar-coastal'
import { fetchNearestARGOFloats, analyzeStratificationFromARGO } from '@/lib/argo-floats'
import { fetchGEBCOBathymetry, analyzeBathymetryForBlooms } from '@/lib/gebco-bathymetry'
import { fetchGTSPPNearestProfile, validateSatelliteDataWithGTSPP } from '@/lib/gtspp-profiles'
import { fetchHyCOMData, compareResolutions } from '@/lib/hycom'
import { analyzeHistoricalContext } from '@/lib/glorys-reanalysis'
import { fetchUpwellingIndex, predictBloomTiming } from '@/lib/noaa-upwelling-index'
import { fetchCopernicusSSTData } from '@/lib/copernicus'
import { getRegion, REGIONS } from '@/lib/regional-zones'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const regionId = searchParams.get('region') || undefined
    const zoneId = searchParams.get('zone') || undefined

    // Allow explicit lat/lon override, or use region/zone to select them
    let lat = parseFloat(searchParams.get('lat') || '')
    let lon = parseFloat(searchParams.get('lon') || '')
    let zona = searchParams.get('zona') || 'Castro'
    let upwellingPoint = searchParams.get('upwelling_point') || '150'

    // If region specified, use first zone's coordinates
    if (regionId && isNaN(lat) && isNaN(lon)) {
      const region = getRegion(regionId)
      if (region && region.zonas.length > 0) {
        const firstZone = region.zonas[0]
        lat = firstZone.lat
        lon = firstZone.lon
        zona = firstZone.nombre
        upwellingPoint = firstZone.upwellingPoint
      }
    }

    // Default to Castro if still not set
    if (isNaN(lat)) lat = -42.48
    if (isNaN(lon)) lon = -73.77
    if (!upwellingPoint) upwellingPoint = '150'

    const timestamp = new Date().toISOString()

    // Fetch data in parallel
    const [
      nasaData,
      waveData,
      metarData,
      argoData,
      bathyData,
      hycomData,
      upwellingData,
      copernicusData
    ] = await Promise.all([
      fetchNASAOceancolorData(lat, lon),
      fetchWaveWatchIII(lat, lon),
      fetchMETARData('PMC'), // Puerto Montt as default
      fetchNearestARGOFloats(lat, lon),
      fetchGEBCOBathymetry(lat, lon),
      fetchHyCOMData(lat, lon),
      fetchUpwellingIndex(upwellingPoint),
      fetchCopernicusSSTData(lat, lon)
    ])

    // Fetch validation data
    const gtsppData = copernicusData ?
      await validateSatelliteDataWithGTSPP(
        copernicusData.sst,
        35,
        lat,
        lon
      ) : null

    // Fetch analysis results
    const argoAnalysis = argoData.length > 0 ?
      await analyzeStratificationFromARGO(argoData) : null

    const bathyAnalysis = bathyData ?
      await analyzeBathymetryForBlooms(lat, lon) : null

    const upwellingForecast = upwellingData ?
      await predictBloomTiming(upwellingPoint) : null

    const historicalContext =
      await analyzeHistoricalContext(lat, lon, timestamp.split('T')[0])

    const windAnalysis = metarData ?
      analyzeWindConditionsForBlooms(metarData.wind_speed, metarData.wind_direction) : null

    // Calculate comprehensive risk score
    let riskFactors = {
      sst_contribution: copernicusData ?
        Math.min((copernicusData.anomalia * 40) / 2, 40) : 0,
      chlorophyll_contribution: copernicusData ?
        Math.min((copernicusData.clorofila / 2.5) * 40, 40) : 0,
      wave_contribution: waveData ?
        (waveData.significant_wave_height < 1.0 ? 20 :
         waveData.significant_wave_height < 1.5 ? 15 :
         waveData.significant_wave_height < 2.0 ? 10 : 5) : 10,
      upwelling_contribution: upwellingData ?
        Math.min((upwellingData.upwelling_index / 200) * 20, 20) : 0,
      stratification_contribution: argoAnalysis ?
        (argoAnalysis.stratification_strength === 'strong' ? 15 :
         argoAnalysis.stratification_strength === 'moderate' ? 10 : 5) : 10,
      retention_contribution: bathyAnalysis ?
        (bathyAnalysis.retention_potential === 'high' ? 10 :
         bathyAnalysis.retention_potential === 'moderate' ? 5 : 0) : 5
    }

    const totalScore = Math.min(100, Object.values(riskFactors).reduce((a, b) => a + b, 0))

    return NextResponse.json({
      zona,
      coordinates: { lat, lon },
      timestamp,
      regionInfo: {
        regionId: regionId || 'default',
        availableRegions: REGIONS.map(r => ({
          id: r.id,
          nombre: r.nombre,
          pais: r.pais,
          upwellingPoint: r.upwellingPoint,
          zonaCount: r.zonas.length
        }))
      },
      data_sources: {
        satellite: ['Copernicus', 'NASA OCEANCOLOR'],
        in_situ: ['METAR', 'ARGO', 'GTSPP'],
        forecast: ['HyCOM', 'NOAA Upwelling', 'WaveWatch III'],
        historical: ['GLORYS', 'GEBCO']
      },
      oceanographic_data: {
        copernicus: copernicusData,
        nasa_oceancolor: nasaData,
        hycom_model: hycomData,
        waves: {
          wavewatch_iii: waveData,
          data_quality: 'High resolution (0.5°)'
        },
        in_situ: {
          metar_stations: metarData ? [metarData] : [],
          argo_profiles: argoData,
          gtspp_validation: gtsppData,
          bathymetry: bathyData
        }
      },
      analysis: {
        stratification: argoAnalysis,
        bathymetric_circulation: bathyAnalysis,
        wind_upwelling: windAnalysis,
        historical_context: historicalContext,
        upwelling_forecast: upwellingForecast
      },
      risk_calculation: {
        factors: riskFactors,
        total_score: Math.round(totalScore),
        risk_level: totalScore > 70 ? 'ROJO' : totalScore > 40 ? 'AMARILLO' : 'VERDE',
        lead_time_days: upwellingForecast ? 14 : 7,
        confidence: Math.round((gtsppData?.validation_quality === 'excellent' ||
                               gtsppData?.validation_quality === 'good' ? 0.9 : 0.7) * 100),
        model_notes: [
          'SST y Clorofila: Factores primarios (40% c/u)',
          'Olas: Factor de dispersión (20%)',
          'Surgencia NOAA: Predicción 14 días adelante',
          'Estratificación: Retención de células',
          'Batimetría: Topografía para eddies'
        ]
      },
      recommendations: {
        next_7_days: upwellingForecast?.risk_assessment || 'Monitorear',
        next_14_days: upwellingForecast?.expected_bloom_timing || 'Sin forecast disponible',
        data_collection_priority: [
          '1. Continuar Copernicus (SST, Clorofila) - CRÍTICO',
          '2. Integrar NOAA Upwelling - ALTA PRIORIDAD',
          '3. Agregar HyCOM para mejor resolución costera',
          '4. Validar con ARGO/GTSPP cuando disponible',
          '5. Contactar IFOP para ROMS Chiloé'
        ]
      }
    })
  } catch (error) {
    console.error('Error in enhanced-oceanographic-data:', error)
    return NextResponse.json({
      error: 'Failed to fetch enhanced oceanographic data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
