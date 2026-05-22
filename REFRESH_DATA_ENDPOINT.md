# Endpoint para Limpiar Cache de Datos Oceanográficos

## Descripción

Se creó un nuevo endpoint `/api/refresh-data` que limpia el cache de FanDataCache en la base de datos. Esto obliga al sistema a obtener datos oceanográficos frescos en la próxima solicitud a `/api/fan-data`.

## Uso

### En desarrollo (localhost)
```bash
curl -X POST http://localhost:3000/api/refresh-data
```

### En producción (Vercel)
```bash
curl -X POST https://tu-dominio.vercel.app/api/refresh-data
```

## Respuesta Exitosa

```json
{
  "success": true,
  "message": "Cache limpiado. Los datos se actualizarán en la próxima solicitud."
}
```

## Propósito

- Limpia datos cacheados que pueden tener hasta 6 horas de antigüedad
- Fuerza la obtención de datos oceanográficos frescos de Open-Meteo
- Útil cuando los datos en el mapa no coinciden con el reporte de recomendaciones

## Archivo

- `app/api/refresh-data/route.ts` — Endpoint POST que limpia FanDataCache
