# Configuración de Notificaciones Push

Esta guía te ayudará a configurar las notificaciones push en MareaAlerta.

## 1. Generar Claves VAPID

Las claves VAPID (Voluntary Application Server Identification) son necesarias para autenticar tu servidor de aplicaciones con el servicio push del navegador.

### Paso 1: Instalar dependencia web-push

```bash
npm install web-push
```

### Paso 2: Generar las claves

```bash
node lib/vapid-keys-generator.js
```

Este comando generará algo como:

```
=== VAPID KEYS GENERADAS ===

NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKZ...
VAPID_PRIVATE_KEY=H8k...

=== FIN ===
```

## 2. Configurar Variables de Entorno

Abre tu archivo `.env.local` y agrega las claves generadas:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu_clave_publica_aqui
VAPID_PRIVATE_KEY=tu_clave_privada_aqui
INTERNAL_API_KEY=un_valor_secreto_fuerte_para_autenticar_solicitudes_internas
```

### Variables Requeridas:

- **NEXT_PUBLIC_VAPID_PUBLIC_KEY**: Clave pública (se envía al navegador)
- **VAPID_PRIVATE_KEY**: Clave privada (se mantiene segura en el servidor)
- **INTERNAL_API_KEY**: Clave secreta para autenticar solicitudes internas del servidor

## 3. Agregar Manifest al Layout Principal

Asegúrate de que tu `app/layout.tsx` incluya la referencia al manifest:

```tsx
export const metadata: Metadata = {
  manifest: '/manifest.json',
  // ... otros metadatos
}
```

## 4. Crear Iconos PWA

Necesitas crear iconos de diferentes tamaños para la aplicación. Coloca los siguientes archivos en la carpeta `public/`:

- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`
- `icon-maskable-192x192.png` (con fondo transparente)
- `icon-maskable-512x512.png` (con fondo transparente)
- `badge-72x72.png` (badge para notificaciones)

Puedes generar estos iconos usando herramientas como:
- https://www.pwabuilder.com/
- https://imageresizer.com/
- Cualquier herramienta de redimensionamiento de imágenes

## 5. Habilitar Notificaciones en Configuración

Los usuarios pueden habilitar/deshabilitar notificaciones en:
- `/dashboard/configuracion` → Sección "Notificaciones"

## 6. Probar Notificaciones

### En Desarrollo:

1. Abre la aplicación en `http://localhost:3000`
2. Ve a `/dashboard/configuracion`
3. Haz clic en "Activar" en la sección de Notificaciones
4. Permite los permisos del navegador
5. Las notificaciones se guardarán en la base de datos

### Enviar una Notificación de Prueba:

Usa curl o Postman para enviar una solicitud POST a `/api/push/send`:

```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_internal_api_key" \
  -d '{
    "title": "Alerta de Prueba",
    "body": "Esta es una notificación de prueba",
    "zona": "Zona de Prueba",
    "nivel": "ROJO",
    "url": "/dashboard/alertas"
  }'
```

## 7. Integración con Alertas

Para enviar notificaciones automáticas cuando se crean alertas, usa la función `sendPushNotification`:

```typescript
import { sendPushNotification } from '@/lib/send-push-notification'

// En tu endpoint de alertas
await sendPushNotification(
  'Alerta de Marea Roja',
  'Se detectó alto riesgo en Zona X',
  'Zona X',
  'ROJO',
  '/dashboard/alertas'
)
```

## Consideraciones de Seguridad

1. **Mantén VAPID_PRIVATE_KEY segura**: Nunca la expongas en el navegador
2. **INTERNAL_API_KEY**: Usa un valor fuerte y único en producción
3. **Validación de solicitudes**: El endpoint `/api/push/send` valida el header de autorización
4. **HTTPS requerido**: Los service workers y push notifications requieren HTTPS en producción

## Solución de Problemas

### "Service Worker no registrado"
- Asegúrate que la app está en HTTPS (o localhost en desarrollo)
- Verifica que `public/sw.js` existe
- Revisa la consola del navegador para errores

### "Permisos de notificación denegados"
- El usuario debe permitir notificaciones en la configuración del navegador
- En Firefox: Preferences → Privacy → Notificaciones
- En Chrome: Settings → Privacy and security → Site Settings → Notifications

### "VAPID keys no configuradas"
- Verifica que `.env.local` tiene las claves correctas
- Reinicia el servidor de desarrollo después de cambiar `.env.local`
- Usa el formato exacto sin espacios extras

## Referencias

- [Web Push Protocol](https://tools.ietf.org/html/draft-thomson-webpush-protocol)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [PWA Manifest](https://web.dev/add-manifest/)
