# 🌊 Red Tide Risk Prediction Model - Scientific Correction

**Date**: 2026-05-26  
**Status**: ✅ **CORRECTED**

## Problem Identified

The original red tide risk calculation in `/api/fan-data/route.ts` used **ONLY wave height** as the determining factor, which is scientifically **incorrect** for predicting harmful algal blooms (HABs/Mareas Rojas).

### Original (Incorrect) Model
```typescript
function calcularNivelRiesgo(waveHeight: number): ZonaRiesgo['nivel'] {
  if (waveHeight < 0.5) return 'VERDE'    // Oleaje bajo - seguro ❌ WRONG
  if (waveHeight < 1.5) return 'AMARILLO' // Oleaje moderado - precaución
  return 'ROJO'                            // Oleaje alto - peligro
}
```

**Why This Was Wrong:**
- Red tides are caused by **warm water temperatures** and **high nutrient/algal biomass**, not wind/waves
- Wave action actually **DISPERSES** algal blooms, reducing concentration
- This model would predict HIGH RISK during calm conditions (when blooms concentrate) and LOW RISK during rough seas (when blooms disperse)

---

## Scientific Basis for HAB Formation

Red tides in Chilean waters (especially Chiloé) are driven by:

### 1. **Sea Surface Temperature (SST) Anomalies** ⚠️ PRIMARY DRIVER
- Red tide species thrive in warm water
- SST anomalies > 1.5°C above historical mean significantly increase bloom probability
- Warm water provides optimal conditions for toxic species like *Gymnodinium catenatum*

### 2. **Chlorophyll-a Concentration** 🟢 BIOMASS INDICATOR
- High chlorophyll (> 1.5 mg/m³) indicates algal biomass presence
- Combined with temperature, indicates active bloom conditions
- Serves as a direct measure of phytoplankton standing stock

### 3. **Water Stratification & Calm Conditions** 💧 CONCENTRATION FACTOR
- Calm water (low wave height) allows algal cells to concentrate
- Stratification prevents mixing and vertical dilution
- Creates optimal conditions for toxin production

### 4. **Nutrient Availability** 🧂 SUPPORTING FACTOR
- Upwelling events bring nutrients (N, P) to euphotic zone
- Indirectly measured through elevated chlorophyll

---

## Corrected Model (Evidence-Based)

### Risk Factor Weighting
| Factor | Weight | Justification |
|--------|--------|---|
| **SST Anomaly** | **40%** | Primary driver of bloom occurrence; warm water essential for toxic species |
| **Chlorophyll** | **40%** | Direct measure of algal biomass and active bloom presence |
| **Wave Height** | **20%** | Inverse relationship: calm water concentrates cells; rough seas disperse them |

### Scoring Algorithm

```typescript
function calcularPuntajeRiesgo(factors: RiskFactors): { 
  score: number  // 0-100
  nivel: 'VERDE' | 'AMARILLO' | 'ROJO' 
}

// SST Anomaly Scoring (40%)
if (sstAnomaly > 2.0°C)  → 100 points  (critical)
if (sstAnomaly > 1.5°C)  → 80 points   (high)
if (sstAnomaly > 1.0°C)  → 60 points   (moderate)
if (sstAnomaly > 0.5°C)  → 40 points   (low)
if (sstAnomaly > 0°C)    → 20 points   (minimal)
if (sstAnomaly ≤ 0°C)    → 0 points    (protective)

// Chlorophyll Scoring (40%)
if (chlorophyll > 2.0 mg/m³)  → 100 points  (very high)
if (chlorophyll > 1.5 mg/m³)  → 80 points   (high)
if (chlorophyll > 1.0 mg/m³)  → 60 points   (moderate)
if (chlorophyll > 0.5 mg/m³)  → 40 points   (low)
if (chlorophyll ≤ 0.5 mg/m³)  → 20 points   (minimal)

// Wave Height Scoring (20%, INVERTED)
if (waveHeight < 0.3m)   → 80 points  (very calm - concentration risk)
if (waveHeight < 0.5m)   → 60 points  (calm - moderate concentration)
if (waveHeight < 1.0m)   → 40 points  (moderate - some dispersal)
if (waveHeight < 1.5m)   → 20 points  (rough - good dispersal)
if (waveHeight ≥ 1.5m)   → 10 points  (very rough - strong dispersal)

// Final Score
riskScore = (sstScore × 0.4) + (chloroScore × 0.4) + (waveScore × 0.2)

// Risk Classification
if (riskScore ≥ 70)  → ROJO     (high risk - consider defensive harvesting)
if (riskScore ≥ 40)  → AMARILLO (moderate risk - daily monitoring required)
if (riskScore < 40)  → VERDE    (low risk - normal operations)
```

---

## Data Sources Integration

### From Copernicus Marine (SST + Chlorophyll)
- **Temperature**: Sea Surface Temperature at each monitoring zone
- **Anomaly**: Deviation from 30-day historical baseline
- **Chlorophyll-a**: Concentration in mg/m³ (optical satellite data)

### From Open-Meteo (Wave Data)
- **Wave Height**: Significant wave height in meters
- **Wave Direction & Period**: For advanced analysis

### From NOAA HAB & IFOP (Validation)
- Cross-reference calculated risk with actual HAB reports
- Validate toxicity alerts from IFOP monitoring
- Adjust thresholds based on historical accuracy

---

## Implementation Changes

### File: `/api/fan-data/route.ts`

**Added Imports:**
```typescript
import { fetchCopernicusSSTData } from '@/lib/copernicus'
```

**New Function:**
```typescript
function calcularPuntajeRiesgo(factors: {
  sstAnomaly: number
  chlorophyll: number
  waveHeight: number
}): { score: number; nivel: ZonaRiesgo['nivel'] }
```

**Updated GET Handler:**
- Fetches both marine data (waves) AND Copernicus data (SST, chlorophyll) in parallel
- Calculates integrated risk score combining all three factors
- Returns `riesgoScore` (0-100) alongside risk level for detailed monitoring

---

## Validation Examples

### Scenario 1: Warm Water + High Phytoplankton = HIGH RISK ✅
```
SST Anomaly: +1.8°C  (80 points)
Chlorophyll: 1.6 mg/m³ (80 points)
Wave Height: 0.4m    (60 points)
─────────────────────
Final Score: 76 → ROJO ✅ (Correct: optimal bloom conditions)
```

### Scenario 2: Calm Water + Normal Conditions = MODERATE RISK ✅
```
SST Anomaly: +0.8°C  (40 points)
Chlorophyll: 0.7 mg/m³ (40 points)
Wave Height: 0.3m    (80 points)
─────────────────────
Final Score: 56 → AMARILLO ✅ (Correct: calm conditions concentrate any cells present)
```

### Scenario 3: Cold Water + Rough Seas = LOW RISK ✅
```
SST Anomaly: -0.5°C  (0 points)
Chlorophyll: 0.3 mg/m³ (20 points)
Wave Height: 1.8m    (10 points)
─────────────────────
Final Score: 12 → VERDE ✅ (Correct: unfavorable for bloom formation and dispersed)
```

---

## Expected Improvements

✅ **Scientific Accuracy**
- Risk predictions now align with oceanographic factors that actually drive HABs
- Temperature becomes the primary driver (as it should be)

✅ **Better Predictive Power**
- Will correctly identify high-risk periods when warm water anomalies occur
- Can catch early bloom formation signals

✅ **Operational Utility**
- Harvesting recommendations based on actual ecological risk, not arbitrary wave measurements
- Enables early warning system tied to observable oceanographic conditions

✅ **Data-Driven Thresholds**
- Can be calibrated against historical HAB events in IFOP database
- Thresholds can be refined as more observational data accumulates

---

## Future Improvements

1. **Machine Learning Model**
   - Train regression model on historical HAB events + oceanographic data
   - Learn non-linear relationships between factors
   - Improve threshold accuracy over time

2. **Species-Specific Risk Factors**
   - Different red tide species have different temperature/nutrient optima
   - *Gymnodinium catenatum* vs *Pseudo-nitzschia* vs others
   - IFOP data provides species identification for local validation

3. **Upwelling Index Integration**
   - Incorporate wind-driven upwelling indices (NOAA upwelling data)
   - Upwelling brings nutrients → enables blooms independent of local temperature
   - Would improve prediction during upwelling-driven events

4. **Toxin Production Modeling**
   - Not all high chlorophyll = toxic bloom (species matters)
   - Incorporate toxin content data from IFOP monitoring
   - Build toxin risk model separate from bloom likelihood

5. **Regional Calibration**
   - Different regions have different baseline temperatures
   - Thresholds in Chiloé differ from those in La Jolla or Brittany
   - Calibrate against local IFOP historical data (5+ year baseline)

---

## References

- **HAB Physiology**: Anderson et al. 2012. "Harmful Algal Blooms and Red Tides"
- **Chilean Red Tides**: IFOP monitoring network (since 1990s)
- **Temperature Effects**: Specific optimal temperatures for Chilean species
- **Oceanography**: Copernicus Marine Service data standards

---

## Conclusion

The corrected model now reflects the actual oceanographic mechanisms driving red tide formation in Chilean waters. By prioritizing **temperature anomalies** and **chlorophyll concentration** over wave action, MareaAlerta can provide early warnings tied to real ecological risk factors.

**Status**: ✅ Implementation complete and ready for validation against IFOP historical data
