# 🌊 MareaAlerta

Aplicación web progresiva (PWA) para monitoreo en tiempo real de riesgo de marea roja en Los Lagos, Chile.

## Características Principales

✨ **Monitoreo de Riesgo en Tiempo Real**
- Mapa interactivo con niveles de riesgo (Verde/Amarillo/Rojo)
- Datos oceanográficos en tiempo real
- Historial de eventos FAN
- Vedas sanitarias de SERNAPESCA

🔔 **Notificaciones Push**
- Alertas inmediatas
- Compatible con todos los navegadores
- Funciona offline

🤖 **Asistente IA**
- Recomendaciones personalizadas
- Análisis de tendencias
- Asesoría sobre decisiones

## Stack Tecnológico

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Leaflet
- **Backend**: Node.js, Prisma v6, PostgreSQL
- **Auth**: Auth.js v5 (Google OAuth)
- **AI**: Anthropic Claude
- **PWA**: Service Worker, Web Push API
- **Datos**: Open-Meteo, IFOP, SUBPESCA, Copernicus

## Instalación Rápida

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Base de datos
npx prisma migrate dev --name init

# Generar VAPID keys
node lib/vapid-keys-generator.js

# Ejecutar desarrollo
npm run dev
```

## Documentación

- [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) - Configuración completa
- [PUSH_NOTIFICATIONS_SETUP.md](./PUSH_NOTIFICATIONS_SETUP.md) - Notificaciones
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Despliegue

## Versión

1.0.0 - Producción listo ✅

**Última actualización**: 2026-05-22
