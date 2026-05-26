# 🚀 MareaAlerta - Red Tide Prediction Implementation Roadmap

**Status**: Phase 1 Complete - Phase 2 Ready  
**Last Updated**: 2026-05-26

---

## ✅ PHASE 1: SCIENTIFIC FOUNDATION (COMPLETE)

### What Was Fixed
1. **Risk Model Correction** ✅
   - Changed from wave-height-only model to oceanographic multi-factor model
   - Implemented proper weighting: SST Anomaly (40%) + Chlorophyll (40%) + Wave Height (20%)
   - File: `/api/fan-data/route.ts`

2. **Documentation** ✅
   - Created RED_TIDE_PREDICTION_FIX.md (scientific basis)
   - Created RED_TIDE_DATA_SOURCES.md (comprehensive data sources)
   - Identified 10 critical oceanographic variables

3. **Data Source Integration** ✅
   - Copernicus Marine: SST + Chlorophyll-a (already active)
   - Open-Meteo: Wave data (already active)
   - NOAA HAB: HAB forecasts (already active)
   - IFOP: Toxicity monitoring (already active)

---

## 🔄 PHASE 2: MODEL VALIDATION (RECOMMENDED NEXT - 2-4 WEEKS)

### Step 1: Historical Data Collection
**Goal**: Gather 10-15 years of IFOP toxicity alerts + satellite data

**Actions**:
```bash
# 1. Contact IFOP for historical data
- Request: "Boletín de Ficotoxinas" 2010-2025
- Data needed: Date, Zone, Species, Toxicity (µg/kg), Closure status
- Contact: IFOP data@ifop.cl

# 2. Download historical Copernicus data
- Use: Copernicus Marine API or ERDDAP
- Variables: SST, SST Anomaly, Chlorophyll
- Period: 2010-2025 (same as IFOP)
- Regions: Chiloé zones only

# 3. Extract NOAA upwelling index
- Use: https://www.ncei.noaa.gov/products/upwelling-data
- Period: 2010-2025
- Location: Point 150 (offshore Chile, relevant to Chiloé)
```

**Deliverable**: CSV/Database with historical record
```
Date | Zone | IFOP_Toxicity | IFOP_Species | Closure | SST | SST_Anomaly | Chlorophyll | Upwelling_Index
```

### Step 2: Hindcast Validation
**Goal**: Test if model would have predicted historical closures

**Method**:
```typescript
// Pseudo-code for validation
for each_date in 2010-2025:
  if date in IFOP_data:
    predicted_risk = calcularPuntajeRiesgo({
      sstAnomaly: historical_sst_anomaly[date],
      chlorophyll: historical_chlorophyll[date],
      waveHeight: historical_wave[date]
    })
    actual_toxicity = IFOP_data[date].toxicity
    
    // Calculate metrics
    if predicted_risk == ROJO and actual_toxicity > 400:
      true_positive++
    elif predicted_risk == ROJO and actual_toxicity < 400:
      false_positive++
    // etc...

// Performance metrics
accuracy = (TP + TN) / N
sensitivity = TP / (TP + FN)  // Catch how many real blooms
specificity = TN / (TN + FP)  // Avoid false alarms
lead_time = days_before_IFOP_alert
```

**Target Performance**:
- Sensitivity ≥ 80% (catch most closures)
- Specificity ≥ 70% (avoid false alarms)
- Lead time: 7-21 days before IFOP alert

### Step 3: Threshold Optimization
**Goal**: Find optimal risk score thresholds

**Current Thresholds** (from Phase 1):
- ROJO: score ≥ 70
- AMARILLO: score ≥ 40
- VERDE: score < 40

**Optimization Method**:
```python
from sklearn.metrics import roc_curve, auc

# Find optimal threshold for ROJO
fpr, tpr, thresholds = roc_curve(
  actual_high_risk,  # 1 if toxicity > 400, else 0
  predicted_scores   # 0-100 from model
)

# Choose threshold that maximizes sensitivity
optimal_rojo_threshold = thresholds[argmax(tpr - fpr)]
```

**Expected Outcome**: Thresholds refined based on real data
- May adjust ROJO to 65-75 instead of 70
- May adjust AMARILLO to 35-45 instead of 40

---

## 📊 PHASE 3: ADVANCED FEATURES (WEEKS 4-8)

### Feature 1: Upwelling Index Integration
**Why**: Upwelling brings nutrients; creates predictable 14-21 day lag

**Implementation**:
```typescript
// In /api/fan-data/route.ts

// Fetch current upwelling index
const upwellingIndex = await fetchNOAAUpwellingIndex(lat, lon)

// Add lagged upwelling (14 days earlier)
const laggedUpwellingRisk = 
  if (upwellingIndex_14d_ago > 100) 0.8 else 0.2

// Updated risk calculation
const totalScore = 
  (sstScore × 0.35) +        // Reduced from 0.4
  (chloroScore × 0.35) +     // Reduced from 0.4
  (waveScore × 0.15) +       // Same 0.2
  (upwellingRisk × 0.15)     // NEW

// New thresholds after upwelling integration
if (totalScore >= 65) return 'ROJO'
if (totalScore >= 35) return 'AMARILLO'
return 'VERDE'
```

**Data Source**:
```bash
# NOAA provides daily upwelling index
curl "https://www.ncei.noaa.gov/data/..."
# Free, public API
```

### Feature 2: Species-Specific Risk
**Why**: Different species have different optimal conditions + toxicity

**Implementation**:
```typescript
// In /api/oceanographic-data/route.ts

interface SpeciesRisk {
  species: 'Gymnodinium_catenatum' | 'Pseudo_nitzschia' | 'Chattonella'
  probability: number // 0-1
  toxicity_potential: 'low' | 'moderate' | 'high'
}

function calcularRiesgoPorEspecie(
  sstAnomaly: number,
  chlorophyll: number,
  currentSpecies?: string
): SpeciesRisk[] {
  // Gymnodinium: loves 12-16°C warm water
  if (sstAnomaly > 1.5 && chlorophyll > 0.8) {
    return [{
      species: 'Gymnodinium_catenatum',
      probability: 0.8,
      toxicity_potential: 'high'
    }]
  }
  
  // Pseudo-nitzschia: cooler water (8-14°C)
  if (sstAnomaly < 1.0 && chlorophyll > 1.0) {
    return [{
      species: 'Pseudo_nitzschia',
      probability: 0.5,
      toxicity_potential: 'moderate'
    }]
  }
  
  // etc...
}
```

**Data Source**: IFOP monitoring already identifies species

### Feature 3: Machine Learning Refinement
**Why**: Non-linear relationships between factors

**Approach**:
```python
# Train on historical data from Phase 2
from sklearn.ensemble import RandomForestRegressor

X = historical_data[['sst_anomaly', 'chlorophyll', 'wave_height', 'upwelling_index']]
y = actual_toxicity_levels  # Continuous (0-2000 µg/kg)

model = RandomForestRegressor(n_estimators=100)
model.fit(X, y)

# Features importance
# Reveals which variables actually matter most in historical data
print(model.feature_importances_)
# Might show: SST=45%, Chlorophyll=30%, Upwelling=20%, Waves=5%
```

**Implementation**:
```typescript
// Backend endpoint using ML model
// /api/predict-toxicity (calls trained model)

const toxicity_prediction = await mlModel.predict({
  sst_anomaly: 1.8,
  chlorophyll: 1.5,
  wave_height: 0.4,
  upwelling_index: 150
})
// Returns: 650 µg/kg (matches IFOP closure threshold!)
```

---

## 📈 PHASE 4: OPERATIONAL INTEGRATION (WEEKS 8-12)

### Feature 1: Early Warning System
**Goal**: Alert users 7-14 days before expected closure

**Implementation**:
```typescript
// In dashboard
// Show: "ALERTA TEMPRANA - Riesgo en 10-14 días"

// Based on:
// - High upwelling index today (will deliver nutrients)
// - Warm water anomaly developing (species arriving)
// - Historical pattern matching (similar to closure events)
```

### Feature 2: Stakeholder Integration
**Who needs alerts**:
- Harvesters (when to stop/start harvesting)
- IFOP (validates model predictions)
- Authorities (public health decisions)
- Researchers (study opportunities)

**Notification Channels**:
- Email alerts (daily 6am summary)
- WhatsApp/SMS for high-risk zones
- API for partner systems
- Public dashboard

### Feature 3: Confidence Score
**Goal**: Show model confidence (uncertainty quantification)

```typescript
interface PredictionWithConfidence {
  risk_level: 'VERDE' | 'AMARILLO' | 'ROJO'
  risk_score: number      // 0-100
  confidence: number      // 0-100 (85% = quite confident)
  sources_used: string[]  // ['copernicus', 'ifop', 'noaa']
  recommendation: string
  lead_time_days: number  // How many days in advance
}

// Confidence based on:
// - Data freshness
// - Historical model accuracy for this zone
// - Agreement between multiple prediction methods
// - Current conditions clarity
```

---

## 🎯 PHASE 5: CONTINUOUS IMPROVEMENT (ONGOING)

### Monthly Validation
```
Every month:
1. Compare predictions to actual IFOP alerts
2. Calculate sensitivity/specificity
3. Adjust thresholds if needed
4. Retrain ML model with new data
5. Update documentation
```

### Seasonal Calibration
```
Every 3 months:
1. Check if thresholds shift with season
2. Validate species composition (changes annually)
3. Update historical baselines for anomaly calculation
```

### Annual Review
```
Every year:
1. Full model performance audit
2. Scientific literature update
3. New data sources evaluation
4. Stakeholder feedback incorporation
5. Major feature planning
```

---

## 💾 DATABASE SCHEMA NEEDED

To support full implementation, need these tables:

```typescript
// Historical oceanographic data cache
model OceanographicDataCache {
  id: String @id
  date: DateTime
  zona: String
  
  // Temperature
  sst: Float
  sst_anomaly: Float
  
  // Chlorophyll & biology
  chlorophyll: Float
  npp: Float  // Net Primary Productivity
  
  // Waves & circulation
  wave_height: Float
  wave_direction: String
  current_velocity: Float
  
  // Atmospheric
  wind_speed: Float
  upwelling_index: Float
  
  createdAt: DateTime
}

// HAB monitoring (from IFOP)
model HABMonitoring {
  id: String @id
  date: DateTime
  zona: String
  
  // Species data
  species: String  // Gymnodinium, Pseudo-nitzschia, etc
  cell_density: Int  // cells/mL
  
  // Toxicity
  toxicity_type: String  // PSP, DA, etc
  toxicity_level: Int    // µg/kg
  alert_status: String   // NORMAL, ALERTA, CUARENTENA
  
  // Closure info
  market_closed: Boolean
  closure_reason: String
  
  createdAt: DateTime
}

// Model predictions (for hindcasting)
model PredictionRecord {
  id: String @id
  date: DateTime
  zona: String
  
  predicted_score: Float        // 0-100
  predicted_level: String       // VERDE/AMARILLO/ROJO
  predicted_toxicity: Float     // µg/kg estimate
  
  actual_toxicity: Float
  actual_closed: Boolean
  
  // Metrics
  was_accurate: Boolean
  lead_time_days: Int
  
  createdAt: DateTime
}

// Model metadata
model ModelVersion {
  id: String @id
  version: String  // "1.0", "1.1", etc
  
  // Parameters
  weights: Json  // Which factors weighted how
  thresholds: Json  // ROJO/AMARILLO boundaries
  
  // Performance
  accuracy: Float
  sensitivity: Float
  specificity: Float
  
  // When active
  active: Boolean
  deployed_date: DateTime
  
  createdAt: DateTime
}
```

---

## 🔗 INTEGRATION WITH EXISTING COMPONENTS

### Current API Endpoints (Already Functional)
- ✅ `/api/copernicus-data` → SST + Chlorophyll
- ✅ `/api/fan-data` → CORRECTED RISK CALCULATION
- ✅ `/api/ifop-data` → Species + Toxicity (for validation)
- ✅ `/api/noaa-hab` → HAB alerts
- ✅ `/api/shoa-data` → Tide predictions
- ✅ `/api/oceanographic-data` → Integrated endpoint

### Frontend Pages (Already Present)
- `/dashboard/oceanografico` → Perfect for Phase 3-4 features
- `/dashboard/alertas` → Shows risk levels (will improve with validation)
- `/dashboard/asistente` → AI chat (can explain predictions)

### What's Missing
- No historical data collection mechanism
- No ML model training pipeline
- No confidence/uncertainty quantification
- No species-specific predictions
- No upwelling integration

---

## 💡 QUICK START RECOMMENDATIONS

### Immediate (This Week)
1. ✅ Deploy the corrected fan-data endpoint (DONE)
2. Add NOAA upwelling index endpoint
3. Create `/api/predict-toxicity` endpoint that combines all factors

### Next 2 Weeks
1. Start collecting IFOP historical data
2. Write script to validate model against 2020-2025 period
3. Calculate current sensitivity/specificity

### Week 3-4
1. Optimize thresholds based on validation
2. Add confidence score calculation
3. Display in frontend dashboard

### Month 2
1. Integrate species-specific predictions
2. Set up automatic monthly validation reports
3. Begin discussions with IFOP for official partnership

---

## 📞 KEY CONTACTS FOR COLLABORATION

### Scientific Validation
- **IFOP** (Instituto de Fomento Pesquero)
  - Email: contact@ifop.cl
  - They have 30+ years of HAB data
  - Can validate model predictions
  - May want to adopt improved system

### Data Sources
- **Copernicus** (EU - free)
  - High-quality oceanographic data
  - API access (no auth needed)
  
- **NOAA** (USA - free)
  - Upwelling indices
  - HAB alerts
  
- **SHOA** (Chile - some free)
  - Official tides & sea state
  - Authority on Chilean waters

### ML/Research Support
- **Universidad de Concepción** (Chile)
  - Strong oceanography program
  - Could partner on ML development
  
- **Universidad Austral** (Chile)
  - Chiloé-specific research
  - HAB expertise

---

## ✨ SUCCESS METRICS

### Phase 2 Success (Validation)
- [ ] Hindcast accuracy ≥ 75%
- [ ] Sensitivity ≥ 80% (catch real closures)
- [ ] Lead time ≥ 7 days before IFOP alert
- [ ] Thresholds optimized based on real data

### Phase 3 Success (Advanced Features)
- [ ] Species-specific predictions implemented
- [ ] Upwelling integration reduces false positives
- [ ] ML model improves over baseline by ≥ 10%
- [ ] Confidence scores accurate

### Phase 4 Success (Operational)
- [ ] Early warnings validated by IFOP
- [ ] <5% false alarm rate
- [ ] Stakeholder adoption (harvesters using system)
- [ ] Public trust demonstrated

### Phase 5 Success (Sustainability)
- [ ] Automatic monthly validation running
- [ ] Model continuously improving
- [ ] Integration with official harvest closures
- [ ] Used for real-time management decisions

---

## 📚 REQUIRED KNOWLEDGE/RESOURCES

To successfully implement this roadmap, team needs:

| Skill | Why | Resource |
|---|---|---|
| **Oceanography** | Understand data meaning | IFOP collaboration |
| **Statistical Modeling** | Validate & improve model | Coursework or hire consultant |
| **Time Series Analysis** | Lagged variables (upwelling) | Python: statsmodels |
| **Machine Learning** | Non-linear relationship modeling | scikit-learn, TensorFlow |
| **Data Engineering** | Historical data collection/cleaning | Pandas, DuckDB |
| **Full-stack Dev** | Implement endpoints/dashboard | Already present in team |

---

**Status**: Ready to begin Phase 2 validation  
**Next Step**: Contact IFOP for historical data + begin hindcast testing

**Time Estimate**:
- Phase 2 (Validation): 2-4 weeks
- Phase 3 (Advanced): 4-8 weeks
- Phase 4 (Operational): 4 weeks
- Phase 5 (Continuous): Ongoing
- **Total to full implementation**: ~4 months
