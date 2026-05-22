# Checklist de Configuración - MareaAlerta

## Base de Datos (Prisma + Neon PostgreSQL)

- [ ] Crear cuenta en [Neon](https://neon.tech)
- [ ] Crear una base de datos PostgreSQL
- [ ] Copiar `DATABASE_URL` a `.env.local`
- [ ] Ejecutar: `npx prisma migrate dev --name init`
- [ ] Verificar tablas creadas: `npx prisma studio`

## Autenticación (Auth.js + Google OAuth)

- [ ] Crear proyecto en [Google Cloud Console](https://console.cloud.google.com)
- [ ] Crear credenciales OAuth 2.0 (Authorized JavaScript origins + Authorized redirect URIs)
- [ ] Agregar a `.env.local`:
  ```
  GOOGLE_ID=tu_client_id
  GOOGLE_SECRET=tu_client_secret
  NEXTAUTH_SECRET=valor_aleatorio_fuerte
  NEXTAUTH_URL=http://localhost:3000 (desarrollo) o tu_dominio.com (producción)
  ```

## API Keys Externas

### Open-Meteo (Oleaje)
- [ ] No requiere configuración (API pública)
- [ ] Datos automáticamente disponibles

### SUBPESCA (Vedas Sanitarias)
- [ ] No requiere configuración (API pública via CKAN)
- [ ] Datos automáticamente disponibles

### IFOP (Eventos FAN)
- [ ] Web scraping automático (sin API key)
- [ ] Se ejecuta en `/api/fan-historico`

### Copernicus (Datos Oceanográficos - Opcional)
- [ ] Crear cuenta en [Copernicus](https://data.marine.copernicus.eu)
- [ ] Si quieres usar, agregar a `.env.local`:
  ```
  COPERNICUS_USERNAME=tu_usuario
  COPERNICUS_PASSWORD=tu_contraseña
  ```

### Resend (Emails - Opcional)
- [ ] Crear cuenta en [Resend](https://resend.com)
- [ ] Agregar a `.env.local`:
  ```
  RESEND_API_KEY=tu_api_key
  ```

## Notificaciones Push (Web Push API)

- [ ] Ejecutar: `node lib/vapid-keys-generator.js`
- [ ] Copiar claves a `.env.local`:
  ```
  NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu_clave_publica
  VAPID_PRIVATE_KEY=tu_clave_privada
  INTERNAL_API_KEY=valor_secreto_fuerte
  ```
- [ ] Crear iconos PWA (ver PUSH_NOTIFICATIONS_SETUP.md)
- [ ] Colocar iconos en `public/` (icon-*.png, badge-*.png)

## AI Chat (Anthropic Claude)

- [ ] Crear cuenta en [Anthropic](https://console.anthropic.com)
- [ ] Crear API key
- [ ] Instalar SDK: `npm install @ai-sdk/anthropic`
- [ ] Agregar a `.env.local`:
  ```
  ANTHROPIC_API_KEY=tu_api_key
  ```

## Despliegue (Vercel - Opcional)

- [ ] Instalar Vercel CLI: `npm install -g vercel`
- [ ] Conectar repositorio Git
- [ ] Usar: `vercel` para desplegar
- [ ] Configurar variables de entorno en Vercel dashboard
- [ ] Habilitar PostgreSQL serverless (si usas Vercel Postgres)

## Variables de Entorno Completas (.env.local)

```env
# Base de Datos
DATABASE_URL=postgresql://...

# Auth.js
GOOGLE_ID=...
GOOGLE_SECRET=...
NEXTAUTH_SECRET=... (genera con: openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000

# AI
ANTHROPIC_API_KEY=...

# Web Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
INTERNAL_API_KEY=...

# Opcionales
COPERNICUS_USERNAME=...
COPERNICUS_PASSWORD=...
RESEND_API_KEY=...
```

## Instalación de Dependencias

```bash
# Instalar todas las dependencias
npm install

# Instalar @ai-sdk/anthropic si no lo instalaste
npm install @ai-sdk/anthropic

# Instalar web-push para VAPID keys
npm install web-push
```

## Validación Final

- [ ] Ejecutar: `npm run dev`
- [ ] Acceder a: `http://localhost:3000`
- [ ] Probar login con Google
- [ ] Crear un centro de cultivo
- [ ] Ver mapa con marcadores
- [ ] Crear entrada de bitácora
- [ ] Habilitar notificaciones push
- [ ] Probar chat IA
- [ ] Revisar alertas

## Despliegue a Producción

- [ ] Cambiar `NEXTAUTH_URL` a dominio real
- [ ] Generar nuevo `NEXTAUTH_SECRET`
- [ ] Actualizar Google OAuth redirect URIs
- [ ] Usar base de datos PostgreSQL en producción (Neon)
- [ ] Cambiar a HTTPS
- [ ] Ejecutar: `npm run build`
- [ ] Desplegar en Vercel o servidor propio

## Monitoreo Después del Despliegue

- [ ] Verificar logs del servidor
- [ ] Probar autenticación
- [ ] Probar APIs externas
- [ ] Probar notificaciones push
- [ ] Verificar que el service worker está registrado
- [ ] Revisar Core Web Vitals en Lighthouse

## Notas Importantes

- Los cambios en `.env.local` requieren reiniciar el servidor de desarrollo
- Nunca commitees `.env.local` al repositorio (está en `.gitignore`)
- Usa valores fuertes para `NEXTAUTH_SECRET` e `INTERNAL_API_KEY` en producción
- Mantén las claves privadas seguras (VAPID_PRIVATE_KEY, credenciales, etc.)
- Los emails de debug se imprimirán en consola si `RESEND_API_KEY` no está configurada
