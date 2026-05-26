# 🔑 CREDENCIALES REQUERIDAS - Marea Alerta

## Estado Actual (26-May-2026)

```
✅ SANOS (2/12):
   - Database: OK
   - NASA API: OK (tiene CLAVE)

⚠️ DEGRADADOS (2/12):
   - SHOA (opcional)
   - IFOP (opcional)

❌ SIN CONFIGURAR (10/12):
   - NOAA Upwelling Index
   - CMEMS
   - HyCOM
   - Argo Floats
   - AVISO
   - Sentinel-3 OLCI
   - EMODnet
   - IOOS
   - Bio-ORACLE
   - NextAuth (error crítico)

CONFIDENCE ACTUAL: 20% (solo 2 de 9 fuentes oceanográficas)
```

---

## 🔴 CRÍTICAS (Bloquean funcionalidad)

### 1. **NEXTAUTH_SECRET y NEXTAUTH_URL**
**Estado**: ❌ FALTA en variables de entorno del sistema  
**Impacto**: Autenticación no funciona  
**Solución**:
```bash
# Generar secret seguro (ejecutar en terminal):
openssl rand -base64 32

# Agregar a .env:
NEXTAUTH_SECRET="<output_del_comando_anterior>"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. **CMEMS (Copernicus Marine)**
**Estado**: ⚠️ Credenciales en .env, pero URLs faltando  
**Actualmente**: CMEMS_USERNAME="joseestebanasencio@gmail.com", CMEMS_PASSWORD="..."  
**Falta**: CMEMS_API_URL  
**Solución**:
```bash
# Agregar a .env:
CMEMS_API_URL="https://data.marine.copernicus.eu/api/v1/data/grid-series"
```
Ref: https://data.marine.copernicus.eu/

### 3. **NOAA Upwelling Index**
**Estado**: ❌ Faltando API key  
**Requerido**: NOAA_API_KEY, NOAA_UPWELLING_BASE_URL  
**Obtener en**: https://www.ncei.noaa.gov/products/upwelling-indices  
**Solución**:
```bash
NOAA_API_KEY="your_key_here"
NOAA_UPWELLING_BASE_URL="https://tidesonline.noaa.gov/api/prod/datagetter"
```

### 4. **HyCOM (HYCOM Ocean Model)**
**Estado**: ❌ Faltando URLs  
**Requerido**: HYCOM_ERDDAP_URL, HYCOM_DATASET_ID  
**Solución**:
```bash
HYCOM_ERDDAP_URL="https://www.ncei.noaa.gov/erddap/griddap"
HYCOM_DATASET_ID="govhcossh"
```
Ref: https://www.ncei.noaa.gov/products/hycom-global-ocean-model

### 5. **Argo Floats**
**Estado**: ❌ Faltando URLs  
**Requerido**: ARGO_ERDDAP_URL, ARGO_DATASET_ID  
**Solución**:
```bash
ARGO_ERDDAP_URL="https://www.ncei.noaa.gov/erddap/tabledap"
ARGO_DATASET_ID="argo_profiles"
```

---

## 🟠 IMPORTANTES (Impactan análisis)

### 6. **AVISO (Sea Surface Height / Eddies)**
**Estado**: ❌ Faltando credenciales  
**Requerido**: AVISO_API_URL, AVISO_USERNAME, AVISO_PASSWORD  
**Obtener en**: https://nrt.cmems-du.eu/  
**Solución**:
```bash
AVISO_API_URL="https://nrt.cmems-du.eu/motu-web/Motu"
AVISO_USERNAME="your_cmems_username"
AVISO_PASSWORD="your_cmems_password"
```
(Usar mismas credenciales que CMEMS)

### 7. **Sentinel-3 OLCI (Chlorophyll Detection)**
**Estado**: ❌ Faltando múltiples keys  
**Requerido**: GOOGLE_EARTH_ENGINE_KEY, SENTINEL_HUB_TOKEN, SENTINEL_3_ERDDAP_URL  

**Google Earth Engine**:
1. Ir a: https://console.cloud.google.com/
2. Crear proyecto
3. Habilitar Google Earth Engine API
4. Crear service account
5. Descargar JSON key

```bash
GOOGLE_EARTH_ENGINE_KEY="your-gee-service-account-key"
```

**Sentinel Hub**:
1. Registrarse en: https://www.sentinel-hub.com/
2. Crear cuenta
3. Obtener API token

```bash
SENTINEL_HUB_TOKEN="your-sentinel-hub-token"
SENTINEL_3_ERDDAP_URL="https://oceandata.sci.gsfc.nasa.gov/erddap/griddap"
```

### 8. **EMODnet (European Data)**
**Estado**: ❌ Faltando credenciales  
**Requerido**: EMODNET_API_URL, EMODNET_USERNAME, EMODNET_PASSWORD  
**Obtener en**: https://www.emodnet.eu/  
**Solución**:
```bash
EMODNET_API_URL="https://www.emodnet.eu/api/v1"
EMODNET_USERNAME="your_emodnet_username"
EMODNET_PASSWORD="your_emodnet_password"
```

### 9. **IOOS (US Integrated Ocean Observing System)**
**Estado**: ❌ Faltando URL  
**Requerido**: IOOS_ERDDAP_URL  
**Solución**:
```bash
IOOS_ERDDAP_URL="https://erddap.ioos.us/erddap/tabledap"
```
(No requiere autenticación, es público)

### 10. **Bio-ORACLE (Climatological Data)**
**Estado**: ❌ Faltando URL  
**Requerido**: BIO_ORACLE_API_URL  
**Solución**:
```bash
BIO_ORACLE_API_URL="https://www.biooracle.org/api/v1"
```

---

## 🟡 OPCIONALES (Mejoran análisis pero no bloquean)

### 11. **SHOA (Servicio Hidrográfico y Oceanográfico - Chile)**
**Estado**: ⚠️ Opcional  
**Requerido**: SHOA_API_URL, SHOA_API_KEY  
**Obtener en**: https://www.shoa.cl/  
**Solución**:
```bash
SHOA_API_URL="https://www.shoa.cl/php/web/api"
SHOA_API_KEY="your_shoa_api_key"
```

### 12. **IFOP (Instituto de Fomento Pesquero - Chile)**
**Estado**: ⚠️ Opcional  
**Requerido**: IFOP_API_URL, IFOP_API_KEY  
**Obtener en**: https://www.ifop.cl/  
**Solución**:
```bash
IFOP_API_URL="https://www.ifop.cl/api"
IFOP_API_KEY="your_ifop_api_key"
```

---

## 📋 ORDEN DE PRIORIDAD PARA CONFIGURAR

### Fase 1: CRÍTICA (necesaria para que funcione)
```
1. NEXTAUTH_SECRET + NEXTAUTH_URL
2. CMEMS_API_URL (ya tiene user/pass)
3. NOAA_API_KEY + NOAA_UPWELLING_BASE_URL
```

### Fase 2: IMPORTANTE (para cobertura oceanográfica)
```
4. HyCOM_ERDDAP_URL + HYCOM_DATASET_ID
5. Argo_URLs
6. AVISO_URLs + credenciales
7. Sentinel-3 (GEE + Sentinel Hub)
8. EMODnet
```

### Fase 3: COMPLEMENTARIOS
```
9. IOOS_URL
10. BIO_ORACLE_URL
11. SHOA (opcional)
12. IFOP (opcional)
```

---

## 🔄 CÓMO ACTUALIZAR .env

```bash
# 1. Editar archivo .env en la raíz del proyecto
nano .env  # o tu editor favorito

# 2. Agregar cada variable faltante (copiar del .env.example)

# 3. Guardar y salir

# 4. IMPORTANTE: Reiniciar servidor para cargar variables
pkill -f "next dev"
npm run dev
```

---

## ✅ VERIFICAR CONFIGURACIÓN

Después de agregar credenciales, verificar:

```bash
# 1. Test health check básico
curl http://localhost:3000/api/health

# 2. Test health check extendido (muestra todas las credenciales)
curl http://localhost:3000/api/health/extended | python3 -m json.tool

# Debe mostrar:
# - "overall_status": "healthy" o "degraded"
# - NO "unhealthy"
```

---

## 📊 IMPACTO DE CADA FUENTE EN CONFIANZA

```
Sentinel-3 OLCI:       25% de confianza total
CMEMS:                 15%
HyCOM:                 15%
NOAA Upwelling:        10%
AVISO:                 10%
EMODnet:               10%
IOOS:                  5%
Bio-ORACLE:            5%
Argo:                  5%
────────────────────
TOTAL:                 100%
```

**Situación actual**: 20% (solo CMEMS + Bio-ORACLE)  
**Con todas las fuentes**: 100% confianza

---

## 🚀 PRÓXIMOS PASOS DESPUÉS DE CONFIGURAR

1. ✅ Llenar TODAS las credenciales del .env
2. ✅ Reiniciar servidor (`npm run dev`)
3. ✅ Verificar `/api/health/extended` muestra "healthy" o "degraded"
4. ✅ Probar `/api/integrated-assessment?lat=-42&lon=-74&days=14`
5. ✅ Verificar que `composite_confidence` sube de 20% a 100%
6. ✅ Probar en `/dashboard/oceanografico` con datos reales

---

## 📞 SOPORTE

Si alguna API requiere:
- **Acceso académico**: Usar email educativo (.edu, etc)
- **Límite de datos**: Puede que necesites plan pago
- **Cambios de URL**: Checar documentación oficial de cada servicio

**Ref. completa de APIs**: Ver `.env.example` con descripción de cada variable
