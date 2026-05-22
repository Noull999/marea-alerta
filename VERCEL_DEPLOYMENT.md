# Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar MareaAlerta en Vercel.

## Requisitos Previos

1. Cuenta en [Vercel](https://vercel.com)
2. Repositorio Git (GitHub, GitLab o Bitbucket)
3. Todas las variables de entorno configuradas
4. Base de datos PostgreSQL (Neon)

## Paso 1: Preparar el Repositorio

### Inicializar Git (si no lo hiciste)

```bash
cd marea-alerta
git init
git add .
git commit -m "Initial commit: MareaAlerta PWA"
```

### Subir a GitHub (o tu plataforma de Git)

```bash
# Crear repositorio en GitHub: https://github.com/new
# Luego:
git remote add origin https://github.com/tu-usuario/marea-alerta.git
git branch -M main
git push -u origin main
```

## Paso 2: Configurar Base de Datos (Neon PostgreSQL)

1. Ve a [Neon Console](https://console.neon.tech)
2. Crea un nuevo proyecto
3. Copia la `DATABASE_URL` completa
4. La usarás en Vercel

## Paso 3: Obtener Credenciales de Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto: "MareaAlerta"
3. Habilita OAuth 2.0:
   - Authorized JavaScript origins: 
     - `http://localhost:3000` (desarrollo)
     - `https://tu-dominio.vercel.app` (producción)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://tu-dominio.vercel.app/api/auth/callback/google`
4. Obtén `Client ID` y `Client Secret`

## Paso 4: Generar Claves Secrets

### NEXTAUTH_SECRET

```bash
openssl rand -base64 32
# Copia la salida
```

### INTERNAL_API_KEY

```bash
openssl rand -hex 32
# Copia la salida
```

## Paso 5: Desplegar en Vercel

### Opción A: Vía Dashboard (Recomendado)

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en "Add New" → "Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Next.js
5. Configura las variables de entorno (ver abajo)
6. Haz clic en "Deploy"

### Opción B: Vía CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Seguir los prompts interactivos
```

## Paso 6: Configurar Variables de Entorno en Vercel

En el Dashboard de Vercel, ve a:
**Settings** → **Environment Variables**

Agrega todas estas variables:

```
DATABASE_URL=postgresql://...
GOOGLE_ID=tu_client_id
GOOGLE_SECRET=tu_client_secret
NEXTAUTH_SECRET=tu_secret_generado
NEXTAUTH_URL=https://tu-proyecto.vercel.app
NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu_clave_publica
VAPID_PRIVATE_KEY=tu_clave_privada
INTERNAL_API_KEY=tu_api_key_generada
ANTHROPIC_API_KEY=tu_anthropic_key (opcional)
COPERNICUS_USERNAME=usuario (opcional)
COPERNICUS_PASSWORD=contraseña (opcional)
RESEND_API_KEY=tu_resend_key (opcional)
```

**Importante**: 
- Las variables con `NEXT_PUBLIC_` se envían al navegador
- Las otras variables solo existen en el servidor

## Paso 7: Ejecutar Migraciones de Base de Datos

Después del primer despliegue:

```bash
# Conectarse al proyecto
vercel env pull

# Ejecutar migraciones
npx prisma migrate deploy

# O para desarrollo con cambios:
npx prisma migrate dev --name init
```

## Paso 8: Verificar la Aplicación

1. Abre `https://tu-proyecto.vercel.app`
2. Verifica que:
   - [ ] Login funciona (Google OAuth)
   - [ ] Puedes crear un centro
   - [ ] El mapa carga correctamente
   - [ ] Las alertas se muestran
   - [ ] Puedes habilitar notificaciones
   - [ ] El chat IA responde

## Paso 9: Configurar Dominio Personalizado

1. En Vercel Dashboard → "Domains"
2. Agrega tu dominio
3. Sigue las instrucciones de DNS de Vercel
4. Actualiza `NEXTAUTH_URL` con tu nuevo dominio

## Troubleshooting

### "Build failed"
- Revisa los logs en Vercel dashboard
- Verifica que todas las variables de entorno están configuradas
- Asegúrate que `npm run build` funciona localmente

### "Database connection error"
- Verifica que `DATABASE_URL` es correcta
- Comprueba que Neon permite conexiones desde Vercel
- En Neon: Settings → IP Whitelist → Agregar `0.0.0.0/0` o IPs de Vercel

### "OAuth redirect error"
- Verifica URLs en Google Cloud Console
- Asegúrate que `NEXTAUTH_URL` coincide exactamente con tu dominio
- Incluye el protocolo (https://) y sin trailing slash

### "Service Worker not registered"
- Asegúrate que `public/sw.js` existe
- HTTPS está habilitado (Vercel lo hace por defecto)
- Revisa la consola del navegador para errores

## Actualizar después del Despliegue

```bash
# Hacer cambios localmente
git add .
git commit -m "Actualizar feature X"
git push origin main

# Vercel deployará automáticamente
# Puedes seguir el progreso en: https://vercel.com/dashboard
```

## Monitoreo en Producción

1. **Logs**: Vercel Dashboard → Project → Functions
2. **Performance**: Vercel Analytics
3. **Uptime**: Integra con Monitoring (DataDog, etc.)

## Rollback

Si algo sale mal:

1. Vercel Dashboard → Deployments
2. Haz clic en el despliegue anterior
3. Elige "Promote to Production"

## Dominios Recomendados

- [Namecheap](https://www.namecheap.com)
- [GoDaddy](https://www.godaddy.com)
- [AWS Route53](https://aws.amazon.com/route53/)

## Recursos

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Auth.js Deployment](https://authjs.dev/guides/deployment)
