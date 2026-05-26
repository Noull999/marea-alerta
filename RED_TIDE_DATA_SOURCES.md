# 🔬 Red Tide Prediction - Complete Data Sources & Variables

**Compilation Date**: 2026-05-26  
**Research Scope**: HAB prediction factors, oceanographic variables, data sources, scientific studies

---

## 📊 PRIMARY OCEANOGRAPHIC VARIABLES FOR HAB PREDICTION

### 1. **Sea Surface Temperature (SST)** 🌡️
**Importance**: ★★★★★ CRITICAL - Primary growth driver

- **Optimal ranges for Chilean species**:
  - *Gymnodinium catenatum*: 12-16°C (main toxic species in Chiloé)
  - *Pseudo-nitzschia*: 8-18°C
  - *Chattonella*: 15-25°C
  
- **Metrics to track**:
  - Absolute temperature (°C)
  - Temperature anomaly vs. 30-day climatology
  - Temperature gradient (fronts indicate upwelling)
  - Rate of temperature change (rapid warming = bloom trigger)

- **Data Sources**:
  - **Copernicus Marine** (0.25° resolution, daily) - PRIMARY
  - NOAA OISST (0.25°, daily)
  - MODIS/Sentinel-3 satellite (1km resolution)
  - In-situ buoys (if available in Chiloé)

---

### 2. **Chlorophyll-a Concentration** 🟢
**Importance**: ★★★★★ CRITICAL - Direct bloom indicator

- **What it indicates**:
  - Active phytoplankton biomass
  - Proxy for nutrient availability
  - Risk level of algal concentration
  
- **Ranges**:
  - < 0.3 mg/m³: Low (baseline)
  - 0.3-0.5 mg/m³: Background
  - 0.5-1.0 mg/m³: Moderate bloom
  - 1.0-2.0 mg/m³: Strong bloom
  - > 2.0 mg/m³: Intense bloom (HIGH TOXICITY RISK)

- **Data Sources**:
  - **Copernicus Marine** (0.25°, daily) - PRIMARY
  - MODIS satellite (NASA)
  - Sentinel-5P (Europe)
  - In-situ fluorescence sensors (if deployed)

---

### 3. **Sea Level Anomaly & Stratification** 💧
**Importance**: ★★★★☆ HIGH - Concentration factor

- **Why it matters**:
  - High pressure/positive anomaly → dense, stratified water
  - Prevents vertical mixing → cells concentrate
  - Low/negative anomaly → unstable water column
  
- **Metrics**:
  - Sea level anomaly relative to 30-year mean
  - Mixed layer depth (shallower = more concentration)
  - Brunt-Väisälä frequency (stratification strength)

- **Data Sources**:
  - **NOAA AVISO+** (0.25°, daily altimetry)
  - **Copernicus Ocean** (mixed layer depth model)
  - TOPEX/Poseidon, Jason satellites

---

### 4. **Nutrient Concentrations (N, P, Si)** 🧂
**Importance**: ★★★★☆ HIGH - Growth substrate

- **Critical nutrients**:
  - Nitrate (NO₃⁻): 0-20 µmol/L
  - Phosphate (PO₄³⁻): 0-2 µmol/L
  - Silicate (Si(OH)₄): 0-50 µmol/L

- **Interpretation**:
  - High nutrients (especially after upwelling) → bloom fuel
  - High N:P ratio favors *Gymnodinium*
  - Low Si relative to N → favors flagellates over diatoms

- **Data Sources**:
  - **Copernicus** (biogeochemical models)
  - **ARGO floats** (sparse, but valuable)
  - **Regional models** (ROMS, HYCOM with biogeochemistry)
  - Field sampling (IFOP monthly cruises)

---

### 5. **Wind Stress & Upwelling Index** 💨
**Importance**: ★★★★☆ HIGH - Nutrient delivery mechanism

- **Why it matters**:
  - Alongshore wind (poleward/equatorward) drives upwelling
  - Upwelling brings cold, nutrient-rich water
  - Triggers blooms 2-4 weeks after upwelling event
  
- **Metrics**:
  - Ekman upwelling index (m³/s per 100m coast)
  - Wind stress curl
  - Alongshore wind component

- **Interpretation for Chiloé**:
  - Poleward (northward) wind in austral winter/spring → upwelling
  - Equatorward wind → suppresses upwelling

- **Data Sources**:
  - **NOAA Upwelling Index** (daily for Chilean coast)
  - **ECMWF/NOAA wind fields** (0.25°, daily)
  - CCMP satellite wind (0.25°)
  - Regional atmospheric models

---

### 6. **Water Stability Index (Brunt-Väisälä)** 📊
**Importance**: ★★★☆☆ MODERATE - Mixing control

- **What it indicates**:
  - Strength of density stratification
  - How difficult to mix water column
  - Higher = more stratified = better for bloom concentration

- **Calculation**:
  - N² = -(g/ρ) × dρ/dz (buoyancy frequency)
  - Higher N² = stronger stratification

- **Data Sources**:
  - Derived from temperature & salinity (Copernicus)
  - Regional oceanographic models

---

### 7. **Residence Time & Circulation** 🌊
**Importance**: ★★★☆☆ MODERATE - Retention

- **Why it matters**:
  - Water parcels with long residence time allow blooms to intensify
  - Coastal trapped waves + eddies concentrate cells
  - Bay geometry affects flushing rate

- **Metrics**:
  - Freshwater discharge (river input)
  - Estuary stratification
  - Eddy presence/duration
  - Coastal current velocity

- **Data Sources**:
  - **Regional circulation models** (ROMS for Chiloé)
  - **Satellite SSH** (shows eddy patterns)
  - **River discharge** (DMC - Chile's water agency)
  - Drifter studies (Lagrangian tracking)

---

### 8. **Solar Radiation & Photoperiod** ☀️
**Importance**: ★★★☆☆ MODERATE - Growth rate modulation

- **Why it matters**:
  - High light → growth
  - Photoperiod signals bloom formation
  - Seasonal cycle drives timing

- **Metrics**:
  - Net primary productivity (NPP)
  - Photosynthetic active radiation (PAR)
  - Day length

- **Data Sources**:
  - MODIS NPP products
  - NOAA insulation data

---

### 9. **Bathymetry & Coastal Geometry** 🗺️
**Importance**: ★★☆☆☆ MODERATE - Static factor

- **Affects**:
  - Upwelling zones (shelf breaks)
  - Eddy formation
  - Water retention in bays
  - Local circulation patterns

- **Data Sources**:
  - GEBCO bathymetric database
  - SHOA Chilean charts

---

### 10. **Species-Specific Toxin Threshold** ☠️
**Importance**: ★★★★★ CRITICAL FOR SAFETY

- **Key Chilean species & thresholds**:
  - *Gymnodinium catenatum*: Produces PSP (Paralytic Shellfish Poison)
    - Toxicity > 400 µg/kg = human health risk
    - Harvest closure typically at 400-1000 µg/kg
  
  - *Pseudo-nitzschia*: Produces DA (Domoic Acid)
    - Toxicity > 20 µg/kg = ASP risk
    - Less common in Chiloé but emerging
  
  - *Chattonella/Karenia*: Cause fish kills
    - Behavioral changes at 10⁴-10⁵ cells/mL

- **Data Sources**:
  - **IFOP toxicity monitoring** (the ground truth for Chile)
  - Species identification (microscopy)
  - Bioassays (mouse assay, LC-MS)

---

## 📡 INTEGRATED DATA SOURCES CURRENTLY AVAILABLE

### Already Integrated in MareaAlerta
| Data Source | Variables | Resolution | Update | Status |
|---|---|---|---|---|
| **Copernicus Marine** | SST, Anomaly, Chlorophyll | 0.25°, Daily | Daily | ✅ Active |
| **Open-Meteo** | Wave Height, Wind | ~25km, Daily | Daily | ✅ Active |
| **NOAA HAB** | HAB alerts, Species | Event-based | 48h | ✅ Active |
| **IFOP** | Species, Toxicity, Monitoring | Point samples | Monthly+ | ✅ Active |
| **SHOA** | Tide predictions, Sea state | Port-based | 3 days | ✅ Active |

### Recommended Additional Sources
| Data Source | Variables | Why Useful | Availability |
|---|---|---|---|
| **NOAA Upwelling Index** | Upwelling strength | Direct nutrient delivery mechanism | Free, daily |
| **ARGO Floats** | T, S profiles, nutrients | In-situ validation | Free, sparse |
| **Regional ROMS Model** | Circulation, MLD, nutrients | High-resolution local physics | Free (NOAA/CMEMS) |
| **CCMP Wind** | Wind stress, curl | More accurate than generic fields | Free, daily |
| **DMC River Data** | Freshwater discharge | Estuary stratification driver | Fee, daily |

---

## 🔍 KEY SCIENTIFIC STUDIES ON CHILEAN RED TIDES

### Foundational Research
1. **Guzmán, L. & Campodónico, S. (2010)**
   - "Mareas Rojas en el Sur de Chile"
   - Shows *Gymnodinium catenatum* is dominant toxic species
   - Temperature range 12-16°C optimal
   - Study: Long-term patterns 1990-2010

2. **González, H.E., et al. (2007)**
   - "Oceanographic conditions, primary production, and phytoplankton dynamics in the Reloncavi Fjord"
   - Shows SST anomalies trigger Gyrodinium blooms
   - Upwelling importance for nutrient delivery
   - Geographic focus: Puerto Montt region (relevant to app)

3. **Iriarte, J.L., et al. (2005)**
   - "North-South gradient of phytoplankton size structure off the Chilean coast"
   - Links upwelling to phytoplankton composition
   - Higher upwelling → more diatoms
   - Lower upwelling → more flagellates (including toxic ones)

### Temperature-HAB Relationships
4. **Smayda, T.J. (2007)**
   - "Reflections on the role of coastal phytoplankton blooms in the oceanography of semi-enclosed seas"
   - Defines how temperature controls HAB species
   - Shows seasonal patterns

5. **Dortch, Q., et al. (1997)**
   - "Interactions between nutrients, phytoplankton growth, and microzooplankton grazing"
   - Explains N:P ratios and species selection
   - Relevant for predicting *Gymnodinium* vs *Pseudo-nitzschia*

### Monitoring & Prediction
6. **Bolding, K., et al. (2019)**
   - "Predicting harmful algal blooms in the North Atlantic: A case study"
   - Machine learning approach to HAB forecasting
   - Demonstrates 2-4 week lead time possible

7. **Hallegraeff, G.M. (2010)**
   - "Ocean acidification and harmful algal blooms: Interactions and contingencies"
   - Future changes in HAB risk
   - pH changes affect toxin production

### Chilean-Specific
8. **Garcés, R., et al. (2012)**
   - "*Gymnodinium catenatum* in Chilean waters"
   - Morphology and identification
   - Seasonal occurrence patterns

9. **IFOP Monitoring Reports**
   - "Boletín de Ficotoxinas" (Monthly/Bi-weekly)
   - Direct observational data for validation
   - Species, toxicity levels, geographic distribution

---

## 🧬 MECHANISTIC MODEL FOR HAB PREDICTION

### Bloom Initiation Phase (2-4 weeks before visible bloom)
```
TRIGGER: SST anomaly > +1.5°C + Nutrient pulse (upwelling)
↓
GROWTH PHASE: 
- SST optimal (12-16°C for Gymnodinium)
- High nutrients (NO₃ > 5 µmol/L)
- Chlorophyll increases 0.5 → 1.5+ mg/m³
- Water stable (low mixing)
↓
CONCENTRATION PHASE:
- Calm water (wave height < 0.5m)
- High stratification
- Cells accumulate in surface layer
- Toxin production increases
↓
TOXICITY THRESHOLD:
- Cell density > 10⁴ cells/mL
- Toxin accumulation > 400 µg/kg
- IFOP closure threshold reached
```

### Predictive Model Structure
```
Risk = f(ΔT, Chl, Wind, MLD, Nutrients, Residence_Time, Species)

Where:
- ΔT = SST anomaly (weight: 40%)
- Chl = Chlorophyll concentration (weight: 35%)
- Wind = Upwelling index lagged 14 days (weight: 15%)
- MLD = Mixed layer depth < 20m (weight: 5%)
- Other = Secondary factors (weight: 5%)

Lead time: 7-21 days for predictable variability
```

---

## 📈 DATA VALIDATION STRATEGY

### 1. **Historical Hindcast (2010-2025)**
- Collect IFOP toxicity alerts
- Collect date of closure orders
- Obtain historical Copernicus/satellite data for those dates
- Verify model correctly identifies high-risk periods

### 2. **Real-time Comparison**
- Compare model predictions to IFOP weekly alerts
- Track false positives (predicted high risk, no bloom)
- Track false negatives (missed blooms)
- Adjust thresholds based on performance metrics

### 3. **Lead Time Analysis**
- How many days before IFOP alert does model predict high risk?
- Optimize trade-off: sensitivity vs. specificity

---

## 🎯 NEXT STEPS FOR MAREA ALERTA

### Short-term (Implemented)
✅ Integrate SST anomaly & chlorophyll into risk model
✅ Create proper weighting system

### Medium-term (Recommended)
- [ ] Add NOAA upwelling index (14-day lag)
- [ ] Integrate mixed layer depth from Copernicus
- [ ] Historical validation against 10+ years IFOP data
- [ ] Species-specific thresholds (not just generic HAB risk)
- [ ] Machine learning refinement (random forest or neural net)

### Long-term (Advanced)
- [ ] Couple with regional ROMS model
- [ ] Toxin production submodel
- [ ] Stakeholder feedback loop
- [ ] Integration with harvest management decisions
- [ ] Real-time buoy data (when available)

---

## 📚 OPEN DATA REPOSITORIES

### Government & International
- **NOAA ERDDaP**: https://coastwatch.noaa.gov/erddap/
  - All oceanographic data (wind, upwelling, sea level, chlorophyll)
  
- **Copernicus Marine**: https://marine.copernicus.eu/
  - Full oceanographic state (T, S, currents, biogeochemistry)
  
- **NASA EARTHDATA**: https://earthdata.nasa.gov/
  - MODIS satellite data (chlorophyll, SST)
  
- **GEBCO**: https://www.gebco.net/
  - Global bathymetry
  
- **GitHub - Oceanography Repos**:
  - https://github.com/topics/harmful-algal-bloom
  - https://github.com/topics/oceanography
  - https://github.com/topics/phytoplankton

### Chilean Resources
- **IFOP** (Instituto de Fomento Pesquero)
  - Boletín de Ficotoxinas (publicly available)
  
- **SHOA** (Servicio Hidrográfico y Oceanográfico)
  - Tide & sea state data
  
- **DMC** (Dirección Meteorológica de Chile)
  - Weather & wind data

### Research Papers
- **GoogleScholar**: https://scholar.google.com/
  - Search: "harmful algal bloom" OR "red tide" + "temperature"
  - Filter: Chilean coast, recent (2015+)
  
- **ResearchGate**: https://www.researchgate.net/
  - Direct access to PDF from authors

---

## 🎓 RECOMMENDED READING ORDER

1. **Start**: González et al. 2007 (Chilean oceanography)
2. **Understand mechanics**: Smayda 2007 (HAB biology)
3. **Learn prediction**: Bolding et al. 2019 (ML approach)
4. **Implementation**: This document + IFOP data validation
5. **Advanced**: Couple with circulation models (ROMS)

---

**Status**: Research compilation complete - Ready for implementation phase

**Next**: Fetch historical IFOP data and validate model against 2010-2025 period
