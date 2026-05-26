# Marea Alert - Testing Guide
## Phase 2 Integrated Oceanographic APIs

---

## Quick Start

### Prerequisites
```bash
npm install
# Ensure .env has Copernicus credentials:
# COPERNICUS_USERNAME=<your_username>
# COPERNICUS_PASSWORD=<your_password>
# CMEMS_USERNAME=<your_username>
# CMEMS_PASSWORD=<your_password>
```

### Start Development Server
```bash
npm run dev
# Server runs on http://localhost:3000
```

---

## Testing the Integrated Assessment API

### Test 1: Chiloé Risk Assessment (Known Mariculture Zone)
```bash
curl "http://localhost:3000/api/integrated-assessment?lat=-42.0&lon=-74.0&days=14"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "location": {
      "latitude": -42.0,
      "longitude": -74.0,
      "region": "Chile"
    },
    "risk_assessment": {
      "overall_risk_level": "VERDE|AMARILLO|ROJO",
      "risk_score": 0-100,
      "key_drivers": ["HAB detectado", "Clorofila elevada", ...],
      "recommended_actions": ["Continuar monitoreo", ...]
    },
    "data_quality": {
      "sources_available": 7,
      "sources_unavailable": 2,
      "composite_confidence": 85
    }
  },
  "processing_time_ms": 5000,
  "status": {
    "sources_available": 7,
    "sources_unavailable": 2,
    "confidence_percent": 85
  }
}
```

### Test 2: Aysén Risk Assessment
```bash
curl "http://localhost:3000/api/integrated-assessment?lat=-45.0&lon=-74.5&days=14"
```

### Test 3: Valparaíso Risk Assessment
```bash
curl "http://localhost:3000/api/integrated-assessment?lat=-33.0&lon=-71.5&days=14"
```

### Test 4: Peru - Callao
```bash
curl "http://localhost:3000/api/integrated-assessment?lat=-12.0&lon=-77.2&days=14"
```

---

## Testing Batch Assessment

### Create test file: `test_batch.json`
```json
{
  "locations": [
    {
      "latitude": -42.0,
      "longitude": -74.0,
      "name": "Chiloé"
    },
    {
      "latitude": -45.0,
      "longitude": -74.5,
      "name": "Aysén"
    },
    {
      "latitude": -33.0,
      "longitude": -71.5,
      "name": "Valparaíso"
    }
  ]
}
```

### Execute batch request
```bash
curl -X POST http://localhost:3000/api/integrated-assessment \
  -H "Content-Type: application/json" \
  -d @test_batch.json
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "assessments": [ {...}, {...}, {...} ],
    "report": {
      "Chiloé": "ALERTA AMARILLA",
      "Aysén": "NORMAL",
      "Valparaíso": "ALERTA ROJA"
    },
    "critical_zones": [
      {
        "location": "Valparaíso (-33.00, -71.50)",
        "risk": "CRÍTICO",
        "reason": "HAB detectado (confianza: 92%); Clorofila elevada..."
      }
    ],
    "summary": "Evaluación integrada completada para 3 ubicaciones. 1 zonas críticas identificadas."
  }
}
```

---

## Testing Individual Data Sources

### Test CMEMS Nutrients
```javascript
// In browser console or Node.js script
import { fetchCMEMSNutrients, analyzeCMEMSNutrients } from './lib/cmems'

const data = await fetchCMEMSNutrients(-42, -74)
console.log('CMEMS Data:', data)

const analysis = await analyzeCMEMSNutrients(data, 50)
console.log('Nutrient Analysis:', analysis)
// Expected: Shows nutrient profiles, limitation status, upwelling detection
```

### Test Sentinel-3 HAB Detection
```javascript
import { fetchSentinel3OLCIData, detectHABFromSentinel3 } from './lib/sentinel-3-olci'

const sentinel = await fetchSentinel3OLCIData(-42, -74)
console.log('Sentinel-3 Data:', {
  chlorophyll_a: sentinel.chlorophyll_a,
  turbidity: sentinel.turbidity,
  hab_index: sentinel.hab_index
})

const habDetection = detectHABFromSentinel3(sentinel, 'increasing')
console.log('HAB Detection:', {
  detected: habDetection.hab_detected,
  confidence: habDetection.confidence,
  stage: habDetection.blooming_stage
})
```

### Test AVISO Eddy Detection
```javascript
import { fetchAVISOAltimetry, detectEddy } from './lib/aviso-ssh'

const altimetry = await fetchAVISOAltimetry(-42, -74)
console.log('AVISO Data:', {
  ssh: altimetry.ssh,
  currents: { u: altimetry.geostrophic_u, v: altimetry.geostrophic_v }
})

const eddy = detectEddy(altimetry)
console.log('Eddy Detection:', {
  detected: eddy.eddy_detected,
  type: eddy.eddy_type,
  retention: eddy.retention_potential
})
```

### Test OpenDrift Dispersal
```javascript
import { simulateHABDispersal, generateDispersingWarning } from './lib/opendrift-dispersal'

const dispersal = await simulateHABDispersal(
  -42, -74,           // start position
  1000,               // cells/mL
  {u: 0.1, v: 0.05, magnitude: 0.11},  // currents
  {u: 2, v: 1, magnitude: 2.24},       // wind
  14,                 // days
  1000                // particles
)

console.log('Dispersal Results:', {
  max_distance: dispersal.displacement.max_distance_km,
  direction: dispersal.displacement.primary_direction,
  farming_zones: dispersal.coastal_impact.farming_zones_threatened
})

const warning = generateDispersingWarning(dispersal)
console.log('Warning Level:', warning.warning_level)
console.log('Actions:', warning.recommended_actions)
```

### Test EMODnet Validation
```javascript
import { fetchEMODnetData, validateModelWithEMODnet } from './lib/emodnet'

const emodnet = await fetchEMODnetData(-42, -74)
console.log('EMODnet Data:', emodnet)

const validation = validateModelWithEMODnet(
  { temperature: 14.5, salinity: 34.2, dissolved_oxygen: 6.0 },
  [emodnet]
)
console.log('Validation Metrics:', {
  temp_rmse: validation.model_vs_observed.temperature_rmse,
  agreement: validation.model_vs_observed.agreement_percentage
})
```

### Test IOOS Buoys
```javascript
import { fetchIOOSBuoyData, analyzeIOOSData } from './lib/ioos-buoys'

const buoys = await fetchIOOSBuoyData(-42, -74, 200) // 200km radius
console.log('Number of buoys found:', buoys.length)
console.log('First buoy:', buoys[0])

if (buoys.length > 0) {
  const analysis = analyzeIOOSData(buoys)
  console.log('IOOS Analysis:', {
    temperature_range: analysis.temperature_range,
    upwelling_signal: analysis.upwelling_signal,
    reliability: analysis.data_reliability
  })
}
```

### Test Bio-ORACLE Climatology
```javascript
import { fetchBioORACLEClimatology, calculateBioORACLEAnomalies } from './lib/bio-oracle'

const climatology = await fetchBioORACLEClimatology(-42, -74)
console.log('Bio-ORACLE Baseline:', {
  month: climatology.month,
  chl_mean: climatology.chlorophyll_a_mean,
  temp_mean: climatology.temperature_mean
})

const anomalies = calculateBioORACLEAnomalies(
  {
    chlorophyll_a: 2.5,
    temperature: 14,
    dissolved_oxygen: 5.5,
    nitrate: 12
  },
  climatology
)
console.log('Anomalies:', {
  chl_anomaly: anomalies.chlorophyll_anomaly,
  interpretation: anomalies.anomaly_interpretation
})
```

---

## Data Quality Checks

### Verify Source Availability
```bash
# If a source fails, check its fallback chain:
curl "http://localhost:3000/api/integrated-assessment?lat=-42&lon=-74" \
  | jq '.data.data_quality'
```

Expected output:
```json
{
  "sources_available": [
    "CMEMS",
    "Sentinel-3 OLCI",
    "AVISO Altimetry",
    "EMODnet",
    "IOOS Buoys",
    "Bio-ORACLE",
    "HAB Detection Algorithm"
  ],
  "sources_unavailable": [
    "NOAA Upwelling Index"
  ],
  "composite_confidence": 85
}
```

### Monitor Processing Time
```bash
curl "http://localhost:3000/api/integrated-assessment?lat=-42&lon=-74" \
  | jq '.processing_time_ms'
# Expected: 3000-8000 ms (3-8 seconds)
```

### Check Risk Assessment
```bash
curl "http://localhost:3000/api/integrated-assessment?lat=-42&lon=-74" \
  | jq '.data.risk_assessment'
```

Expected output:
```json
{
  "overall_risk_level": "AMARILLO",
  "risk_score": 52,
  "key_drivers": [
    "Clorofila elevada: 2.3 mg/m³",
    "Surgencia fuerte: índice 120"
  ],
  "recommended_actions": [
    "Aumentar monitoreo a frecuencia diaria",
    "Preparar muestras para análisis de toxina",
    "Coordinar con operadores de maricultura"
  ]
}
```

---

## Troubleshooting

### Issue: "CMEMS returned 401"
**Solution:** Check credentials in `.env`
```bash
# Verify CMEMS credentials are correct:
echo $CMEMS_USERNAME
echo $CMEMS_PASSWORD
```

### Issue: "Sentinel-3 Hub returned 401"
**Solution:** Check Copernicus authentication
```bash
# Register at: https://scihub.copernicus.eu/
# Update .env with correct credentials
COPERNICUS_USERNAME=your_username
COPERNICUS_PASSWORD=your_password
```

### Issue: Processing time > 15 seconds
**Possible causes:**
- Multiple API timeouts (slow fallback chains)
- Network latency to remote servers
- Parallel request congestion

**Solution:** Check individual source response times
```javascript
const start = Date.now()
const data = await fetchCMEMSNutrients(-42, -74)
console.log(`CMEMS took ${Date.now() - start}ms`)
```

### Issue: Risk level unexpectedly VERDE
**Debug:**
```bash
curl "http://localhost:3000/api/integrated-assessment?lat=-42&lon=-74" \
  | jq '.data.risk_assessment.key_drivers'
# Check which factors are contributing to score
```

### Issue: "EMODnet unavailable" fallback chain failing
**Check:** Both fallback endpoints
- Primary: EMODnet Physics WFS
- Fallback: CMEMS gateway
- If both fail: Returns null but assessment continues with other sources

---

## Performance Baseline

### Single Assessment (Chiloé)
```bash
time curl -s "http://localhost:3000/api/integrated-assessment?lat=-42&lon=-74" > /dev/null
```

Expected baseline:
- **Cold start** (no cache): 5-8 seconds
- **Cached** (within 1 hour): < 100ms
- **All sources available**: 5-6 seconds
- **Some sources unavailable**: 3-5 seconds

### Batch Assessment (3 locations)
```bash
time curl -s -X POST http://localhost:3000/api/integrated-assessment \
  -H "Content-Type: application/json" \
  -d @test_batch.json > /dev/null
```

Expected: 10-15 seconds (parallel fetch)

---

## Monitoring Recommendations

### Log Key Metrics
```javascript
// Add to your monitoring dashboard:
- Response time per request (target: < 8s)
- Source availability rate (target: > 80%)
- Composite confidence distribution (target: > 80%)
- Risk level distribution (VERDE/AMARILLO/ROJO %)
- API error rate (target: < 1%)
```

### Health Check Endpoint (Optional Future Implementation)
```bash
# Proposed: /api/health
# Returns: {
#   status: "healthy|degraded|unhealthy",
#   sources: {cmems: true, sentinel3: false, ...},
#   response_time_p95: 7200,
#   error_rate_24h: 0.5
# }
```

---

## Validation Test Cases

### Test Case 1: Spring Bloom Conditions
```json
{
  "latitude": -42.0,
  "longitude": -74.0,
  "expected_conditions": {
    "season": "spring (Sep-Oct)",
    "upwelling_index": "> 100",
    "chlorophyll": "> 2.0 mg/m³",
    "risk_level": "AMARILLO or ROJO"
  }
}
```

### Test Case 2: Winter Quiescence
```json
{
  "latitude": -42.0,
  "longitude": -74.0,
  "expected_conditions": {
    "season": "winter (Jun-Aug)",
    "chlorophyll": "< 0.8 mg/m³",
    "upwelling_index": "< 50",
    "risk_level": "VERDE"
  }
}
```

### Test Case 3: Eddy Retention Event
```json
{
  "latitude": -45.0,
  "longitude": -74.5,
  "expected_conditions": {
    "ssh_anomaly": "> 0.1 m",
    "eddy_type": "anticyclonic",
    "retention_potential": "high",
    "risk_increase": "1.5x"
  }
}
```

---

## Next Steps

1. ✅ Verify all endpoints respond with valid data
2. ✅ Check source availability and fallback chains work
3. ✅ Validate risk scores align with oceanographic conditions
4. ✅ Test batch assessment with multiple locations
5. ⏳ Deploy to staging environment
6. ⏳ Connect to frontend dashboard
7. ⏳ Integration testing with aquaculture operations

---

**For questions:** See `docs/API_REFERENCE.md`
**Report issues:** Create GitHub issue with test location and error details
**Last Updated:** 2026-05-26
