# 🚀 Quick Start API - Nuevos Endpoints

## 1️⃣ Generar Alerta Oceanográfica

```bash
# Crear alerta para región Los Lagos
curl -X POST http://localhost:3000/api/alerts/generate \
  -H "Content-Type: application/json" \
  -d '{
    "zona": "Región de Los Lagos",
    "latitude": -41.5,
    "longitude": -72.5,
    "centroIds": ["centro-id-1", "centro-id-2"]
  }'

# Respuesta:
{
  "zona": "Región de Los Lagos",
  "nivel": "AMARILLO",
  "score": 55,
  "factores": [
    "Clorofila elevada: 1.8 mg/m³",
    "Surgencia detectada: índice 45"
  ],
  "recomendaciones": [
    "Aumentar frecuencia de monitoreo a DIARIA",
    "Preparar muestras para análisis de toxina",
    ...
  ],
  "datosOceanograficos": {
    "clorofila": 1.8,
    "surgencia": true,
    "remolinos": 0,
    "confianza": 68,
    "fuentes": ["Sentinel-3", "NOAA", "HyCOM"]
  }
}
```

---

## 2️⃣ Obtener Evaluación con Recomendaciones

```bash
# Evaluación completa oceanográfica
curl "http://localhost:3000/api/oceanographic/assessment-with-recommendations?lat=-41.5&lon=-72.5&days=14"

# Respuesta:
{
  "assessment": {
    "timestamp": "2026-05-26T15:30:00Z",
    "location": { "latitude": -41.5, "longitude": -72.5, "region": "Chile" },
    "water_mass": { "temperature": 12.3, "salinity": 34.2, "density": 1024.5 },
    "biological_indicators": {
      "chlorophyll_a": 1.8,
      "chlorophyll_source": "Sentinel-3 OLCI",
      "blooming_stage": "HAB probable",
      ...
    },
    "risk_assessment": {
      "overall_risk_level": "AMARILLO",
      "risk_score": 55,
      "key_drivers": ["Clorofila elevada", "Surgencia detectada"],
      "recommended_actions": [...]
    },
    ...
  },
  "recommendations": {
    "inmediatas": [
      "⚠️ Aumentar muestreo a cada 6-12 horas"
    ],
    "preventivas": [
      "La surgencia está inyectando nutrientes - alto riesgo"
    ],
    "monitoreo": [
      "Monitorear Sentinel-3 OLCI DIARIAMENTE"
    ]
  }
}
```

---

## 3️⃣ Analizar Tendencias

```bash
# Últimos 7 días
curl "http://localhost:3000/api/alerts/trends?zona=Región%20de%20Los%20Lagos&days=7"

# Respuesta:
{
  "zona": "Región de Los Lagos",
  "trend": {
    "tendencia": "empeorando",
    "cambio_porcentaje": 45,
    "puntos_datos": [
      { "fecha": "2026-05-19", "score": 40 },
      { "fecha": "2026-05-20", "score": 45 },
      { "fecha": "2026-05-21", "score": 50 },
      { "fecha": "2026-05-26", "score": 58 }
    ]
  }
}
```

---

## 4️⃣ Obtener Reporte de Zona

```bash
# Reporte semanal
curl "http://localhost:3000/api/oceanographic/reports/Región%20de%20Los%20Lagos"

# Respuesta:
{
  "zona": "Región de Los Lagos",
  "periodo": {
    "inicio": "2026-05-19T15:30:00.000Z",
    "fin": "2026-05-26T15:30:00.000Z"
  },
  "resumen": {
    "dias_rojo": 1,
    "dias_amarillo": 3,
    "dias_verde": 3,
    "nivel_promedio": "AMARILLO",
    "tendencia": "EMPEORANDO"
  },
  "indicadores": {
    "clorofila_promedio": 1.8,
    "clorofila_max": 2.1,
    "surgencia_dias": 4,
    "remolinos_detectados": 2,
    "confianza_datos": 72
  },
  "recomendaciones": [
    "⚠️ Aumentar monitoreo a frecuencia diaria",
    "⚠️ Preparar muestras para análisis de toxina"
  ],
  "centros_afectados": [
    {
      "nombre": "Centro Isla Tenglo",
      "latitud": -41.52,
      "longitud": -72.48,
      "riesgo_actual": "AMARILLO"
    },
    ...
  ]
}
```

---

## 5️⃣ Riesgo Específico de Centro

```bash
# Evaluación para un centro específico
curl "http://localhost:3000/api/centros/centro-id/riesgo"

# Respuesta:
{
  "centro": {
    "nombre": "Centro Isla Tenglo",
    "latitud": -41.52,
    "longitud": -72.48,
    "especie": "MEJILLON"
  },
  "assessment": { ... },
  "riesgo_actual": "AMARILLO",
  "score": 55,
  "factores_clave": [
    "Clorofila elevada: 1.8 mg/m³",
    "Surgencia detectada: índice 45"
  ],
  "recomendaciones": [
    "Aumentar monitoreo a frecuencia diaria",
    "Preparar muestras para análisis de toxina",
    "Coordinar con operadores de maricultura"
  ],
  "dispersal_forecast": {
    "max_distance_km": 45,
    "primary_direction": "SW",
    "affected_farming_zones": ["Zona 1", "Zona 2"],
    "timeline_days": 14
  }
}
```

---

## 6️⃣ Estadísticas Globales

```bash
# Métricas del sistema
curl "http://localhost:3000/api/dashboard/statistics"

# Respuesta:
{
  "fecha": "2026-05-26T15:30:00.000Z",
  "resumen": {
    "centrosActivos": 23,
    "usuariosActivos": 18,
    "eventosHABRecientes": 3
  },
  "ultimas24Horas": {
    "alertasRojo": 1,
    "alertasAmarillo": 3,
    "alertasVerde": 5
  },
  "ultimos7Dias": {
    "alertasRojo": 5,
    "alertasAmarillo": 12,
    "alertasVerde": 18
  },
  "alertasPorZona": {
    "Región de Los Lagos": 8,
    "Región de Aysén": 5,
    "Perú Norte": 4
  },
  "tendencia": {
    "alertasAumentando": false,
    "riesgoPromedio": 28
  }
}
```

---

## 7️⃣ Ejecutar Generación Automática de Alertas

```bash
# Iniciar monitoreo de 7 zonas estratégicas
curl -X POST http://localhost:3000/api/cron/generate-alerts \
  -H "x-cron-token: your-cron-secret-token"

# Respuesta:
{
  "success": true,
  "timestamp": "2026-05-26T15:30:00.000Z",
  "zonesProcessed": 7,
  "results": [
    {
      "zona": "Región de Los Lagos",
      "nivel": "AMARILLO",
      "score": 55,
      "alertasGeneradas": 1
    },
    {
      "zona": "Región de Aysén",
      "nivel": "VERDE",
      "score": 25,
      "alertasGeneradas": 0
    },
    ...
  ]
}
```

---

## 🧪 Plan de Testing Completo

### Test 1: Sin Credenciales (Estado Actual)
```bash
# Las alertas mostrarán:
# - "confianza": 0
# - "fuentes": [] (vacío)
# - Datos simulados con valores base
```

### Test 2: Con Credenciales Configuradas
```bash
# Las alertas mostrarán:
# - "confianza": 60-100%
# - "fuentes": ["Sentinel-3 OLCI", "NOAA Upwelling Index", ...]
# - Datos reales de las APIs oceanográficas
```

### Test 3: Monitorear Cambios de Nivel
```bash
# Ejecutar alert generation múltiples veces
# Verificar que:
# 1. El "score" cambia según datos nuevos
# 2. El "nivel" escala correctamente (VERDE → AMARILLO → ROJO)
# 3. Las "recomendaciones" se actualizan dinámicamente
```

---

## 📋 Checklist de Validación

- [ ] `/api/alerts/generate` retorna alertas correctas
- [ ] `/api/oceanographic/assessment-with-recommendations` incluye recomendaciones
- [ ] `/api/alerts/trends` muestra tendencia correcta
- [ ] `/api/oceanographic/reports/[zona]` genera reportes
- [ ] `/api/centros/[id]/riesgo` retorna riesgo específico
- [ ] `/api/cron/generate-alerts` procesa todas las zonas
- [ ] `/api/dashboard/statistics` muestra métricas agregadas
- [ ] Las alertas aparecen en `/dashboard/alertas` (base de datos)
- [ ] Las recomendaciones aparecen en `/dashboard` (cards)
- [ ] El oceanographic panel muestra datos real-time

---

## 💡 Tips

1. **Para desarrollo:** Usa Postman/Insomnia para testing
2. **Para producción:** Configura cron job en Vercel
3. **Para debugging:** Revisa logs en `/api/health/extended`
4. **Para datos reales:** Completa credenciales en `.env`

---

Generated: 2026-05-26
