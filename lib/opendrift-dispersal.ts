/**
 * OPENDRIFT - Particle Dispersal Simulation
 * Source: OpenDrift (Open source)
 * Purpose: Model movement and concentration of HAB cells
 * Variables: Particle position, age, fate (sinking, degradation)
 * Advantage: Predict where cells will move given current patterns
 * Integration: Uses HyCOM currents + NOAA winds
 */

interface DispersingParticle {
  id: number
  latitude: number
  longitude: number
  depth: number // meters
  age_days: number
  concentration: number // cells/mL
  status: 'active' | 'sunk' | 'degraded' | 'beached'
}

interface DispersingScenario {
  start_lat: number
  start_lon: number
  start_concentration: number // cells/mL
  duration_days: number
  particles_count: number
  transport_mode: 'passive' | 'active_swimming'
  vertical_mixing: boolean
}

interface DispersingResult {
  scenario: DispersingScenario
  final_particles: DispersingParticle[]
  displacement: {
    max_distance_km: number
    mean_distance_km: number
    primary_direction: string // N, NE, E, SE, S, SW, W, NW
  }
  coastal_impact: {
    beaches_affected: string[]
    farming_zones_threatened: string[]
    impact_probability: number
  }
  sinking_loss: number // percentage
  timeline: Array<{
    day: number
    latitude: number
    longitude: number
    concentration: number
    status: string
  }>
}

// Mock implementation of OpenDrift-like behavior
export async function simulateHABDispersal(
  startLat: number,
  startLon: number,
  startConcentration: number,
  currentField: {
    u: number // East-West velocity
    v: number // North-South velocity
    magnitude: number
  },
  windField: {
    u: number
    v: number
    magnitude: number
  },
  durationDays: number = 14,
  particleCount: number = 1000
): Promise<DispersingResult> {
  // Initialize particles at starting location
  const particles: DispersingParticle[] = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    latitude: startLat + (Math.random() - 0.5) * 0.01, // Small initial spread
    longitude: startLon + (Math.random() - 0.5) * 0.01,
    depth: 5 + Math.random() * 10, // Surface layer
    age_days: 0,
    concentration: startConcentration / particleCount,
    status: 'active' as const
  }))

  // Simulation parameters
  const dt = 3600 * 6 // Time step: 6 hours
  const totalSteps = (durationDays * 24 * 3600) / dt
  const sinkingRate = 0.5 / 86400 // m/s - cells sink slowly
  const degradationRate = 0.02 / 86400 // Daily loss from UV/toxin degradation

  const timeline: DispersingResult['timeline'] = []

  // Simulate particle movement
  for (let step = 0; step < totalSteps; step++) {
    const currentDay = (step * dt) / (24 * 3600)

    particles.forEach((particle) => {
      if (particle.status !== 'active') return

      // Current-driven transport (Ekman transport + geostrophic)
      const dx = currentField.u * dt / 111320 // Convert m/s to degrees
      const dy = currentField.v * dt / 110540

      // Wind-driven transport (affects surface layer more)
      const windFactor = Math.exp(-particle.depth / 5) // Decreases with depth
      const dxWind = (windField.u * 0.02) * windFactor * dt / 111320
      const dyWind = (windField.v * 0.02) * windFactor * dt / 110540

      // Update position
      particle.latitude += dy + dyWind
      particle.longitude += dx + dxWind

      // Depth changes
      particle.depth += sinkingRate * dt

      // Update age
      particle.age_days = currentDay

      // Sinking loss (cells fall out of euphotic zone)
      if (particle.depth > 50) {
        particle.status = 'sunk'
        particle.concentration *= 0.1 // Remaining cells
      }

      // Degradation from sunlight/toxins
      particle.concentration *= Math.exp(-degradationRate * dt)

      // Beaching (very simplified)
      if (isBeached(particle.latitude, particle.longitude)) {
        particle.status = 'beached'
      }
    })

    // Record timeline every 2 days
    if (step % Math.floor((2 * 24 * 3600) / dt) === 0) {
      const activeParticles = particles.filter((p) => p.status === 'active')
      if (activeParticles.length > 0) {
        const avgLat = activeParticles.reduce((sum, p) => sum + p.latitude, 0) / activeParticles.length
        const avgLon = activeParticles.reduce((sum, p) => sum + p.longitude, 0) / activeParticles.length
        const avgConc = activeParticles.reduce((sum, p) => sum + p.concentration, 0) / activeParticles.length

        timeline.push({
          day: currentDay,
          latitude: avgLat,
          longitude: avgLon,
          concentration: avgConc,
          status: `${activeParticles.length}/${particleCount} active`
        })
      }
    }
  }

  // Calculate statistics
  const finalLatitudes = particles.map((p) => p.latitude)
  const finalLongitudes = particles.map((p) => p.longitude)
  const meanLat = finalLatitudes.reduce((a, b) => a + b, 0) / particleCount
  const meanLon = finalLongitudes.reduce((a, b) => a + b, 0) / particleCount

  const maxDistance = Math.max(
    ...particles.map(
      (p) =>
        Math.sqrt(
          Math.pow((p.latitude - startLat) * 111, 2) + Math.pow((p.longitude - startLon) * 111, 2)
        )
    )
  )

  const meanDistance =
    particles.reduce(
      (sum, p) =>
        sum +
        Math.sqrt(Math.pow((p.latitude - startLat) * 111, 2) + Math.pow((p.longitude - startLon) * 111, 2)),
      0
    ) / particleCount

  // Primary direction
  const deltaLat = meanLat - startLat
  const deltaLon = meanLon - startLon
  const angle = Math.atan2(deltaLon, deltaLat) * (180 / Math.PI)
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const primaryDirection = directions[Math.round(((angle + 360) % 360) / 45) % 8]

  // Sinking loss calculation
  const sunkenParticles = particles.filter((p) => p.status === 'sunk').length
  const sinkingLoss = (sunkenParticles / particleCount) * 100

  // Coastal impact (simplified - would need actual coastal data)
  const coastalThreshold = 0.2 // km from coast
  const beachedParticles = particles.filter((p) => isNearCoast(p.latitude, p.longitude, coastalThreshold))
  const impactProbability = beachedParticles.length / particleCount

  return {
    scenario: {
      start_lat: startLat,
      start_lon: startLon,
      start_concentration: startConcentration,
      duration_days: durationDays,
      particles_count: particleCount,
      transport_mode: windField.magnitude > 5 ? 'passive' : 'active_swimming',
      vertical_mixing: true
    },
    final_particles: particles,
    displacement: {
      max_distance_km: maxDistance,
      mean_distance_km: meanDistance,
      primary_direction: primaryDirection
    },
    coastal_impact: {
      beaches_affected: getAffectedBeaches(particles),
      farming_zones_threatened: getThreatenedFarmingZones(particles),
      impact_probability: impactProbability
    },
    sinking_loss: sinkingLoss,
    timeline
  }
}

// Helper functions
function isBeached(lat: number, lon: number): boolean {
  // Simplified: Chilean coast is roughly between -71 to -75 longitude
  // and -18 to -56 latitude
  if (lon < -75.5 || lon > -71) return true // Too far east/west
  if (lat < -56.5 || lat > -18) return true // Too far north/south
  return false
}

function isNearCoast(lat: number, lon: number, distanceKm: number): boolean {
  // Simplified coastline approximation
  // Real implementation would use actual coastline data
  const chileanCoast = [
    { lat: -18, lon: -70.2 },
    { lat: -25, lon: -70.8 },
    { lat: -33, lon: -72.0 },
    { lat: -42, lon: -73.8 },
    { lat: -50, lon: -74.5 },
    { lat: -56, lon: -74.0 }
  ]

  for (const point of chileanCoast) {
    const distance = Math.sqrt(
      Math.pow((lat - point.lat) * 111, 2) + Math.pow((lon - point.lon) * 111, 2)
    )
    if (distance < distanceKm) return true
  }
  return false
}

function getAffectedBeaches(particles: DispersingParticle[]): string[] {
  // Simplified beach mapping
  const beachedParticles = particles.filter((p) => p.status === 'beached')
  const affected: string[] = []

  beachedParticles.forEach((p) => {
    if (p.latitude > -25 && p.latitude < -20) affected.push('Playas Norte (Antofagasta)')
    if (p.latitude > -33 && p.latitude < -25) affected.push('Playas Centro (Valparaíso)')
    if (p.latitude > -42 && p.latitude < -33) affected.push('Playas Sur Central (Chiloé)')
    if (p.latitude < -42) affected.push('Playas Patagonia')
  })

  return [...new Set(affected)]
}

function getThreatenedFarmingZones(particles: DispersingParticle[]): string[] {
  // Major aquaculture zones in Chile
  const farmingZones = [
    { name: 'Chiloé', lat: -42.0, lon: -74.0, range: 1.0 },
    { name: 'Aysén', lat: -45.0, lon: -74.5, range: 1.0 },
    { name: 'Magallanes', lat: -53.0, lon: -71.0, range: 1.5 },
    { name: 'Valparaíso', lat: -33.0, lon: -71.5, range: 0.8 }
  ]

  const threatened: string[] = []

  farmingZones.forEach((zone) => {
    const nearbyParticles = particles.filter(
      (p) =>
        p.status === 'active' &&
        Math.abs(p.latitude - zone.lat) < zone.range &&
        Math.abs(p.longitude - zone.lon) < zone.range
    )

    if (nearbyParticles.length > 0) {
      threatened.push(zone.name)
    }
  })

  return threatened
}

export function generateDispersingWarning(
  result: DispersingResult,
  threshold: {
    distance_km: number
    concentration: number
  } = { distance_km: 50, concentration: 100 }
): {
  warning_level: 'VERDE' | 'AMARILLO' | 'ROJO'
  reasoning: string
  recommended_actions: string[]
} {
  const maxDistance = result.displacement.max_distance_km
  const maxConcentration = Math.max(...result.final_particles.map((p) => p.concentration))
  const affectedZones = result.coastal_impact.farming_zones_threatened.length

  let warningLevel: 'VERDE' | 'AMARILLO' | 'ROJO' = 'VERDE'
  let reasoning = ''
  const actions: string[] = []

  if (affectedZones > 0 && maxConcentration > threshold.concentration) {
    warningLevel = 'ROJO'
    reasoning = `ALERTA CRÍTICA: Células HAB llegarán a ${affectedZones} zonas de maricultura en ${result.scenario.duration_days} días`
    actions.push('Implementar protocolos de cierre preventivo')
    actions.push('Notificar a IFOP y acuicultores')
    actions.push('Preparar pruebas de toxina')
  } else if (maxDistance > threshold.distance_km * 1.5 && result.coastal_impact.impact_probability > 0.3) {
    warningLevel = 'AMARILLO'
    reasoning = `Advencia: Células HAB podrían alcanzar costa en ${Math.ceil(maxDistance / 20)} días`
    actions.push('Aumentar monitoreo diario')
    actions.push('Preparar análisis de toxina')
    actions.push('Coordinar con acuicultores')
  } else {
    warningLevel = 'VERDE'
    reasoning = `Condiciones favorables: Células se dispersarán lejos de zonas de maricultura`
    actions.push('Continuar monitoreo normal')
  }

  if (result.sinking_loss > 50) {
    actions.push('Alto hundimiento: Riesgo reducido por decantación')
  }

  return {
    warning_level: warningLevel,
    reasoning,
    recommended_actions: actions
  }
}
