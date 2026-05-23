# API Oceanográfica Integrada - Marea Alerta

Documentación completa de los nuevos endpoints oceanográficos que integran múltiples fuentes de datos para predicción de riesgo de mareas rojas.

## Endpoints Disponibles

### 1. GET `/api/oceanographic-data` - Datos Oceanográficos Unificados

**Descripción:** Endpoint principal que integra todas las fuentes de datos oceanográficas en una sola respuesta.

**Parámetros Query:**
- `lat` (number): Latitud (-90 a 90)
- `lon` (number): Longitud (-180 a 180)
- `zona` (string, opcional): Nombre de la zona para contexto

**Ejemplo de Solicitud:**
```bash
curl "http://localhost:3000/api/oceanographic-data?lat=-42.48&lon=-73.77&zona=Castro"
```

**Respuesta JSON:**
```json
{
  "zona": "Castro",
  "lat": -42.48,
  "lon": -73.77,
  "timestamp": "2026-05-23T14:30:00Z",
  "sst": {
    "temperature": 14.2,
    "anomaly": 1.2,
    "fetchedAt": "2026-05-23T14:30:00Z"
  },
  "chlorophyll": {
    "concentration": 0.8,
    "fetchedAt": "2026-05-23T14:30:00Z"
  },
  "hab_alerts": [
    {
      "id": "noaa-hab-1",
      "intensity": "MODERATE",
      "species": "Pseudo-nitzschia"
    }
  ],
  "ifop_events": [
    {
      "fecha": "2026-05-20",
      "especie": "Gymnodinium catenatum",
      "toxicidad": 650,
      "nivelAlerta": "ALERTA"
    }
  ],
  "tide_prediction": {
    "fecha": "2026-05-23",
    "nivelPromedio": 145.5,
    "variabilidad": 180,
    "optimo": true
  },
  "sea_state": {
    "alturaOlas": "0.5-1.5 m",
    "direccionViento": "NW",
    "velocidadViento": "15-20 km/h",
    "tendencia": "Sin cambios"
  },
  "risk_level": "AMARILLO",
  "risk_factors": {
    "wave_height": 0.8,
    "sst_anomaly": 1.2,
    "chlorophyll_level": "moderate",
    "hab_probability": 0.35,
    "active_ifop_alerts": 1,
    "tide_variability": 180
  }
}
```

**Niveles de Riesgo:**
- `VERDE` (< 40): Riesgo bajo, operaciones normales
- `AMARILLO` (40-70): Riesgo moderado, monitoreo continuo
- `ROJO` (> 70): Riesgo alto, considere acciones defensivas

---

### 2. GET `/api/copernicus-data` - Datos de Temperatura y Clorofila

**Descripción:** Datos de Copernicus Marine con TSM y concentración de clorofila-a.

**Parámetros Query:**
- `lat` (number, opcional): Latitud específica
- `lon` (number, opcional): Longitud específica
- `zona` (string, opcional): Nombre de zona predefinida

**Ejemplo - Punto específico:**
```bash
curl "http://localhost:3000/api/copernicus-data?lat=-42.48&lon=-73.77"
```

**Ejemplo - Todas las zonas:**
```bash
curl "http://localhost:3000/api/copernicus-data"
```

**Respuesta (todas las zonas):**
```json
{
  "type": "all_zones",
  "zonas": [
    {
      "nombre": "Castro",
      "lat": -42.48,
      "lon": -73.77,
      "sst": 14.2,
      "clorofila": 0.8,
      "anomalia": 1.2,
      "fetchedAt": "2026-05-23T14:30:00Z"
    }
  ],
  "timestamp": "2026-05-23T14:30:00Z"
}
```

**Cache:** 24 horas

---

### 3. GET `/api/noaa-hab` - Pronósticos de Mareas Rojas

**Descripción:** Pronósticos de HAB (Harmful Algal Blooms) de NOAA.

**Parámetros Query:**
- `type` (string): `forecast` | `history` | `all` (default)
- `zona` (string, opcional): Filtrar por zona
- `days` (number, default 90): Días de historial

**Ejemplo - Solo pronósticos:**
```bash
curl "http://localhost:3000/api/noaa-hab?type=forecast"
```

**Ejemplo - Historial con filtro:**
```bash
curl "http://localhost:3000/api/noaa-hab?type=history&zona=Castro&days=30"
```

**Respuesta:**
```json
{
  "type": "forecast",
  "alerts": [
    {
      "id": "noaa-hab-1",
      "lat": -42.48,
      "lon": -73.77,
      "date": "2026-05-23T00:00:00Z",
      "intensity": "MODERATE",
      "species": "Pseudo-nitzschia",
      "description": "Harmful diatom bloom detected",
      "source": "noaa",
      "url": "https://..."
    }
  ],
  "timestamp": "2026-05-23T14:30:00Z"
}
```

**Cache:** 48 horas

---

### 4. GET `/api/ifop-data` - Monitoreo IFOP de Mareas Rojas

**Descripción:** Datos de toxicidad y alertas del Instituto de Fomento Pesquero (IFOP) de Chile.

**Parámetros Query:**
- `type` (string): `current` | `history` | `zone` | `all` (default)
- `zona` (string, opcional): Zona a filtrar
- `años` (number, default 5): Años de historial

**Ejemplo - Solo alertas actuales:**
```bash
curl "http://localhost:3000/api/ifop-data?type=current"
```

**Ejemplo - Historial por zona:**
```bash
curl "http://localhost:3000/api/ifop-data?type=zone&zona=Castro&años=2"
```

**Respuesta:**
```json
{
  "current_alerts": [
    {
      "id": "ifop-actual-1",
      "zona": "Castro",
      "fecha": "2026-05-23",
      "especie": "Gymnodinium catenatum",
      "toxicidad": 650,
      "nivelAlerta": "ALERTA",
      "notas": "Alerta activa - PSP detectada",
      "fuente": "ifop"
    }
  ],
  "historical_events": [
    {
      "id": "ifop-1-1234567890",
      "zona": "Chiloé Central",
      "fecha": "2026-05-10",
      "especie": "Pseudo-nitzschia",
      "toxicidad": 450,
      "nivelAlerta": "ALERTA",
      "notas": "Monitoreo IFOP",
      "fuente": "ifop"
    }
  ],
  "zona": "all",
  "años": 5,
  "timestamp": "2026-05-23T14:30:00Z"
}
```

**Niveles de Alerta IFOP:**
- `NORMAL`: Toxicidad < 400 µg/kg
- `ALERTA`: Toxicidad 400-1000 µg/kg
- `CUARENTENA`: Toxicidad > 1000 µg/kg

**Cache:** 12 horas

---

### 5. GET `/api/shoa-data` - Predicciones de Mareas y Estado del Mar

**Descripción:** Datos del Servicio Hidrográfico y Oceanográfico de la Armada (SHOA) de Chile.

**Parámetros Query:**
- `type` (string): `mareas` | `estado-mar` | `puertos` | `all` (default)
- `puerto` (string): Puerto/zona a consultar
- `dias` (number, default 3): Días de predicción

**Ejemplo - Predicción de mareas:**
```bash
curl "http://localhost:3000/api/shoa-data?type=mareas&puerto=Castro&dias=3"
```

**Ejemplo - Estado del mar:**
```bash
curl "http://localhost:3000/api/shoa-data?type=estado-mar"
```

**Respuesta (mareas):**
```json
{
  "type": "tide_predictions",
  "puerto": "Castro",
  "dias": 3,
  "predicciones": [
    {
      "puerto": "Castro",
      "fecha": "2026-05-23",
      "puntos": [
        {
          "hora": "02:00",
          "altura": 145,
          "tipo": "PLEAMAR"
        },
        {
          "hora": "08:00",
          "altura": 95,
          "tipo": "BAJAMAR"
        }
      ],
      "fuente": "shoa"
    }
  ],
  "condiciones": [
    {
      "fecha": "2026-05-23",
      "nivelPromedio": 145.5,
      "variabilidad": 180,
      "optimo": true
    }
  ],
  "timestamp": "2026-05-23T14:30:00Z"
}
```

**Cache:** 24 horas

---

## Factores de Riesgo Considerados

El cálculo integrado del riesgo (escala 0-100) considera:

| Factor | Peso | Descripción |
|--------|------|-------------|
| Altura de Olas | 30% | < 0.5m (óptimo) a > 1.5m (alto) |
| Anomalía TSM | 20% | Desviación de temperatura histórica |
| Clorofila | 20% | Baja (<0.5) a Alta (>1.5) mg/m³ |
| Probabilidad HAB | 20% | Cálculo de NOAA + Copernicus |
| Alertas IFOP | 10% | Número de alertas activas |
| Variabilidad Mareas | 5% | Cambios de nivel de marea (cm) |

---

## Uso en Frontend

### Componente React para datos oceanográficos:

```tsx
import { OceanographicDataPanel } from '@/components/oceanograficos/OceanographicDataPanel'

export function MyComponent() {
  return (
    <OceanographicDataPanel
      lat={-42.48}
      lon={-73.77}
      zona="Castro"
    />
  )
}
```

### Fetch manual en cliente:

```typescript
const response = await fetch('/api/oceanographic-data?lat=-42.48&lon=-73.77&zona=Castro')
const data = await response.json()

console.log(data.risk_level) // 'VERDE' | 'AMARILLO' | 'ROJO'
console.log(data.risk_factors)
```

---

## Nuevas Páginas del Dashboard

1. **Dashboard Principal** (`/dashboard`)
   - Ahora incluye panel oceanográfico integrado para el primer centro del usuario

2. **Análisis Oceanográfico** (`/dashboard/oceanografico`)
   - Vista detallada de datos para múltiples zonas
   - Comparación de factores de riesgo
   - Historial y tendencias

---

## Integración de Base de Datos

Cuando la base de datos esté disponible, ejecute:

```bash
npx prisma migrate dev --name "add-oceanographic-data-tables"
```

Esto creará las siguientes tablas:
- `CopernicusDataCache` - Cache de datos SST/Clorofila
- `HABAlert` - Historial de eventos HAB
- `IFOPMonitoring` - Registros de monitoreo IFOP
- `SHOAMareasCache` - Cache de predicciones de mareas
- `EstadoMarCache` - Cache de estado del mar

---

## Mejoras Futuras

- [ ] Integración con Grafana para visualización en tiempo real
- [ ] Webhook para notificaciones automáticas
- [ ] Exportación de datos a CSV/PDF
- [ ] Análisis histórico avanzado
- [ ] Integración con redes sociales para alertas
- [ ] Predicciones con Machine Learning

---

Última actualización: 2026-05-23
