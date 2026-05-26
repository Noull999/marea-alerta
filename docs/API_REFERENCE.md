# Marea Alert - API Reference
## Complete Oceanographic Data Integration

---

## Overview

Marea Alert integrates 9 major oceanographic data sources to provide comprehensive HAB risk assessment with 14-21 day lead time. All APIs are optimized for Chilean/Peruvian aquaculture zones and support fallback chains for reliability.

---

## Data Sources

### Phase 1: Core Oceanographic APIs (Priority 1)

#### 1. CMEMS (Copernicus Marine Service)
**File:** `lib/cmems.ts`

- **Primary Endpoint:** `https://data.marine.copernicus.eu/api/v1/data/grid-series`
- **Fallback:** OpenDAP via CMEMS public archive
- **Resolution:** 0.083° (~9km)
- **Update Frequency:** Daily
- **Key Variables:**
  - Temperature (°C)
  - Salinity (PSU)
  - Nitrate (mmol/m³)
  - Phosphate (mmol/m³)
  - Silicate (mmol/m³)
  - Dissolved oxygen (ml/l)
  - Mixed layer depth (m)

**Key Functions:**
- `fetchCMEMSNutrients(lat, lon)` - Fetch nutrient profiles
- `analyzeCMEMSNutrients(data, upwellingIndex)` - Analyze vertical stratification and nutrient limitation
- `compareNutrientLimitation(copernicusChl, cmemsTnitrate, cmetsPhosphate)` - Redfield ratio analysis

**Environmental Variables:**
- `CMEMS_USERNAME` / `CMEMS_PASSWORD`

---

#### 2. Sentinel-3 OLCI (High-Resolution Chlorophyll)
**File:** `lib/sentinel-3-olci.ts`

- **Primary Endpoint:** `https://scihub.copernicus.eu/odata/v1/Products`
- **Fallback:** Google Earth Engine API
- **Resolution:** 300m (10x better than NASA 1km)
- **Update Frequency:** Daily
- **Key Variables:**
  - Chlorophyll-a (mg/m³)
  - Turbidity (FNU)
  - Suspended matter (g/m³)
  - HAB Index (0-100)
  - Phycocyanin (μg/L) - cyanobacteria pigment

**Key Functions:**
- `fetchSentinel3OLCIData(lat, lon)` - Fetch high-resolution satellite data
- `detectHABFromSentinel3(olciData, recentTrend)` - Multi-factor HAB detection algorithm
- `compareSentinelWithCopernicus(sentinel3Chl, copernicusChl)` - Validate coastal resolution advantage

**HAB Detection Scoring:**
- Chlorophyll > 2.0 mg/m³ = 25 points
- Turbidity > 3.0 FNU = 20 points
- Suspended matter > 20 g/m³ = 15 points
- Phycocyanin > 1.0 μg/L = 25 points
- Threshold for detection: score > 35

**Environmental Variables:**
- `COPERNICUS_USERNAME` / `COPERNICUS_PASSWORD`
- `GOOGLE_EARTH_ENGINE_KEY`

---

#### 3. AVISO Altimetry (Eddy Detection)
**File:** `lib/aviso-ssh.ts`

- **Primary Endpoint:** `https://tds.hycom.org/thredds/dodsC/GLBu0.08/expt_91.1`
- **Fallback:** Copernicus Marine Service SSH products
- **Resolution:** 0.08° (~9km)
- **Update Frequency:** Daily
- **Key Variables:**
  - Sea Surface Height anomaly (m)
  - Geostrophic currents u, v (m/s)
  - Absolute dynamic topography (m)

**Key Functions:**
- `fetchAVISOAltimetry(lat, lon)` - Fetch sea surface height data
- `detectEddy(altimetryData, spatialContext)` - Classify eddy type and retention potential
- `analyzeVorticity(altimetryData, spatialGradients)` - Calculate vorticity metrics
- `eddyHABRetention(eddyData, chlLevel)` - Assess cell concentration factor

**Eddy Classification:**
- **Anticyclonic:** SSH > 0.1m → high retention (DANGEROUS)
- **Cyclonic:** SSH < -0.1m → low retention
- Retention potential factors: eddy strength, diameter > 80km

**Retention Score Interpretation:**
- Score > 80: HIGH risk of cell concentration
- Score 50-80: MODERATE retention
- Score < 50: LOW retention potential

---

#### 4. OpenDrift Dispersal Simulation
**File:** `lib/opendrift-dispersal.ts`

- **Type:** Local particle tracking simulation
- **Resolution:** 1000 particles per simulation
- **Time Step:** 6 hours
- **Forecast Duration:** 14 days (configurable)
- **Key Physics:**
  - Ekman transport (wind-driven)
  - Geostrophic currents
  - Sinking (0.5 m/s, depth > 50m)
  - Degradation (0.02/day from UV/toxins)

**Key Functions:**
- `simulateHABDispersal(startLat, startLon, startConcentration, currentField, windField, durationDays, particleCount)` - Main simulation
- `generateDispersingWarning(result, threshold)` - Generate VERDE/AMARILLO/ROJO alert

**Output Metrics:**
- Max/mean displacement (km)
- Primary direction (N, NE, E, SE, S, SW, W, NW)
- Affected beaches and farming zones
- Sinking loss percentage
- Timeline at 2-day intervals

**Coastal Database:**
- Chiloé (-42.0, -74.0)
- Aysén (-45.0, -74.5)
- Magallanes (-53.0, -71.0)
- Valparaíso (-33.0, -71.5)

---

### Phase 2: Validation & Context APIs (Priority 2)

#### 5. EMODnet (European In-Situ Validation)
**File:** `lib/emodnet.ts`

- **Primary Endpoint:** `https://www.emodnet-physics.eu/MAP/REST/metadata/search`
- **Fallback:** CMEMS gateway
- **Coverage:** Europe + Adjacent Basins
- **Key Variables:**
  - Temperature, salinity, oxygen (multi-depth profiles)
  - Nitrate, phosphate
  - Chlorophyll-a
  - Quality-controlled in-situ data

**Key Functions:**
- `fetchEMODnetData(lat, lon, depth)` - Get validated observations
- `validateModelWithEMODnet(modelData, observedData)` - Compare model to in-situ
- `emodnetQualityAssurance(data)` - Quality flags and confidence

**Validation Metrics:**
- Temperature RMSE
- Salinity RMSE
- Oxygen RMSE
- Agreement percentage (0-100%)

---

#### 6. IOOS Buoys (Real-Time US Coastal Observations)
**File:** `lib/ioos-buoys.ts`

- **Primary Endpoint:** `https://erddap.sensors.ioos.us/erddap/griddap/allData`
- **Fallback:** IOOS CSV catalog
- **Coverage:** US coasts (Atlantic, Pacific, Gulf)
- **Update Frequency:** Hourly to real-time
- **Key Variables:**
  - Sea temperature, salinity
  - Currents (u, v components)
  - Wave height, wave period
  - Wind speed, wind direction
  - Sea level
  - Chlorophyll-a (if available)
  - Dissolved oxygen (if available)

**Key Functions:**
- `fetchIOOSBuoyData(lat, lon, radiusKm)` - Get nearby buoy data within radius
- `analyzeIOOSData(buoyData)` - Calculate statistics and upwelling signal
- `validateWithIOOS(modelCurrents, buoyCurrents)` - Compare model currents to observations

**Network Status:**
- ~287 total stations
- ~256 active (typical)
- Data latency: ~15 minutes

---

#### 7. Bio-ORACLE (Global Biogeochemical Climatology)
**File:** `lib/bio-oracle.ts`

- **Primary Endpoint:** `https://www.bio-oracle.org/`
- **Fallback:** Synthetic climatology from latitude zones
- **Resolution:** 5 arcminutes (~9.3km)
- **Update Frequency:** Climatological (2-3 year cycle)
- **Coverage:** Global ocean
- **Key Variables:**
  - Monthly climatologies (1980-2020 baseline)
  - Chlorophyll-a mean & std dev
  - Nutrients (N, P, Si)
  - Temperature, salinity
  - Oxygen, pH, calcite saturation

**Key Functions:**
- `fetchBioORACLEClimatology(lat, lon, month)` - Get baseline climatology
- `calculateBioORACLEAnomalies(currentObs, climatology)` - Compare to normal
- `assessBloomPotentialVsCLimatology(currentObs, climatology)` - Risk assessment

**Anomaly Interpretation:**
- Chlorophyll > climatology + 50% = possible active bloom
- Temperature anomaly ± 2°C = significant deviation
- Seasonal phase detection (spring bloom, summer peak, etc.)

---

### Integrated Services

#### 8. Integrated Oceanographic Assessment
**File:** `lib/integrated-oceanographic-data.ts`

**Function:** `integratedOceanographicAssessment(latitude, longitude, forecastDays)`

Combines all 7 data sources into unified assessment:

**Output Structure:**
```typescript
{
  timestamp: ISO 8601
  location: {latitude, longitude, region}
  water_mass: {temperature, salinity, density}
  biological_indicators: {chlorophyll_a, phycocyanin, blooming_stage}
  nutrient_status: {limiting_nutrient, nitrate, phosphate, silicate}
  physical_dynamics: {eddy_present, eddy_type, retention_potential, currents}
  dispersal_forecast: {max_distance_km, primary_direction, farming_zones, timeline}
  anomaly_analysis: {chlorophyll_anomaly_percent, temperature_anomaly}
  model_validation: {model_agreement_percent, in_situ_comparisons}
  risk_assessment: {
    overall_risk_level: VERDE|AMARILLO|ROJO
    risk_score: 0-100
    key_drivers: [string[]]
    recommended_actions: [string[]]
  }
  data_quality: {sources_available, sources_unavailable, composite_confidence}
}
```

**Risk Level Calculation:**
- **ROJO (Red):** Risk score ≥ 70 - Implement preventive closures
- **AMARILLO (Yellow):** Risk score 40-69 - Increase monitoring
- **VERDE (Green):** Risk score < 40 - Continue normal operations

---

#### 9. Comprehensive Regional Report
**Function:** `generateComprehensiveReport(assessments[])`

Aggregates multiple assessments into regional summary:

**Output:**
```typescript
{
  summary: string
  regional_status: Map<region, status>
  critical_zones: Array<{location, risk, reason}>
  next_24_hours: string
  next_7_days: string
}
```

---

## API Routes

### Integrated Assessment Endpoint
**Route:** `/api/integrated-assessment`

#### GET Request
```
/api/integrated-assessment?lat=-42&lon=-74&days=14
```

**Parameters:**
- `lat` (required): Latitude (-90 to 90)
- `lon` (required): Longitude (-180 to 180)
- `days` (optional): Forecast days (default: 14)

**Response:**
```json
{
  "success": true,
  "data": { IntegratedOceanographicAssessment },
  "processing_time_ms": 5000,
  "status": {
    "sources_available": 7,
    "sources_unavailable": 2,
    "confidence_percent": 85
  }
}
```

#### POST Request (Batch)
```json
{
  "locations": [
    {"latitude": -42.0, "longitude": -74.0, "name": "Chiloé"},
    {"latitude": -45.0, "longitude": -74.5, "name": "Aysén"}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assessments": [ IntegratedOceanographicAssessment[] ],
    "report": {
      "Chiloé": "ALERTA AMARILLA",
      "Aysén": "NORMAL"
    },
    "critical_zones": [ {...} ],
    "summary": "..."
  }
}
```

---

## Configuration

### Required Environment Variables

```bash
# CMEMS
CMEMS_USERNAME=<your_cmems_username>
CMEMS_PASSWORD=<your_cmems_password>

# Copernicus Sentinel Hub
COPERNICUS_USERNAME=<your_copernicus_username>
COPERNICUS_PASSWORD=<your_copernicus_password>

# Google Earth Engine (optional fallback)
GOOGLE_EARTH_ENGINE_KEY=<your_gee_api_key>
```

### Recommended Locations for Testing

**Chile:**
- Chiloé: -42.0, -74.0
- Aysén: -45.0, -74.5
- Magallanes: -53.0, -71.0
- Valparaíso: -33.0, -71.5
- Antofagasta: -23.6, -70.4

**Peru:**
- Callao: -12.0, -77.2
- Ilo: -17.6, -71.3
- Piura: -5.2, -80.6

---

## Data Quality & Reliability

### Source Availability Matrix

| Source | Resolution | Update Freq | Coastal Accuracy | Reliability |
|--------|-----------|------------|-----------------|------------|
| CMEMS | 0.083° | Daily | Good | Very High |
| Sentinel-3 | 300m | Daily | Excellent | Very High |
| AVISO | 0.08° | Daily | Good | Very High |
| HYCOM | 1/12° | Daily | Good | High |
| Upwelling Index | Regional | Daily | Excellent | Very High |
| EMODnet | Variable | Daily-Monthly | Excellent | Very High |
| IOOS | Point | Real-time | Excellent | High |
| Bio-ORACLE | 5 arcmin | Climatological | Good | Very High |
| Argo | Point | Variable | Good | Very High |

### Confidence Weighting

- Sentinel-3 OLCI: 25% (highest resolution + daily)
- CMEMS: 15%
- HYCOM: 15%
- Upwelling Index: 10%
- AVISO: 10%
- EMODnet: 10%
- IOOS: 5%
- Bio-ORACLE: 5%
- Argo: 5%

**Composite Confidence = Sum of weighted available sources**

---

## Examples

### Python Integration

```python
import requests

url = "https://marea-alert.example.com/api/integrated-assessment"
params = {
    "lat": -42.0,
    "lon": -74.0,
    "days": 14
}

response = requests.get(url, params=params)
data = response.json()

print(f"Risk Level: {data['data']['risk_assessment']['overall_risk_level']}")
print(f"Sources Available: {data['status']['sources_available']}")
print(f"Confidence: {data['status']['confidence_percent']}%")

for action in data['data']['risk_assessment']['recommended_actions']:
    print(f"- {action}")
```

### JavaScript Integration

```javascript
const baseUrl = 'https://marea-alert.example.com/api/integrated-assessment'

async function getAssessment(lat, lon, days = 14) {
  const params = new URLSearchParams({ lat, lon, days })
  const response = await fetch(`${baseUrl}?${params}`)
  const data = await response.json()
  
  console.log(`Risk Level: ${data.data.risk_assessment.overall_risk_level}`)
  console.log(`Confidence: ${data.status.confidence_percent}%`)
  
  return data
}

// Batch assessment
async function batchAssessment(locations) {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locations })
  })
  return response.json()
}
```

---

## Error Handling

All APIs implement graceful degradation:

1. **Primary endpoint fails** → Fallback endpoint activated
2. **Both fail** → Cached data or synthetic data (if available)
3. **All fail** → Return null, continue assessment with other sources

Composite confidence decreases as sources become unavailable.

---

## Performance Notes

- **Typical Assessment Time:** 3-8 seconds (depends on source availability)
- **Cache Duration:** 1 hour for GET requests
- **Batch Assessments:** ~1 second per location (parallel fetch)
- **Memory Usage:** ~50-100MB per concurrent assessment

---

## References

- [CMEMS Documentation](https://data.marine.copernicus.eu/)
- [Sentinel-3 OLCI](https://sentinel.esa.int/web/sentinel/missions/sentinel-3)
- [AVISO Altimetry](https://www.aviso.altimetry.fr/)
- [EMODnet](https://www.emodnet.eu/)
- [IOOS](https://ioos.noaa.gov/)
- [Bio-ORACLE](https://www.bio-oracle.org/)
- [OpenDrift](https://www.opendrift.org/)

---

**Last Updated:** 2026-05-26
**Version:** 3.0 (Phase 2 Complete)
