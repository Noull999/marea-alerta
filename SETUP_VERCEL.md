# Configuración de MareaAlerta en Vercel

## Variables de Entorno Requeridas

Para que la aplicación funcione completamente en Vercel, necesitas configurar las siguientes variables de entorno:

### 1. Base de Datos
```
DATABASE_URL=postgresql://user:password@host:5432/database_name
```

### 2. Autenticación Google OAuth
```
GOOGLE_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
NEXTAUTH_URL=https://marea-alerta.vercel.app
```

### 3. API de Inteligencia Artificial (IMPORTANTE para el Asistente)
```
ANTHROPIC_API_KEY=your_anthropic_api_key
```
**Nota:** Sin esta variable, el asistente no funcionará y mostrará un mensaje de error.

Para obtener tu API key:
1. Ve a https://console.anthropic.com
2. Crea una cuenta o inicia sesión
3. Genera una nueva API key
4. Copia la key

### 4. Notificaciones Push
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
INTERNAL_API_KEY=your_internal_api_key
```

### 5. (Opcional) Servicios Adicionales
```
COPERNICUS_USERNAME=your_copernicus_username
COPERNICUS_PASSWORD=your_copernicus_password
RESEND_API_KEY=your_resend_api_key
```

## Cómo Configurar en Vercel

### Opción 1: Dashboard de Vercel
1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto "marea-alerta"
3. Ve a "Settings" → "Environment Variables"
4. Agrega cada variable una por una
5. Redeploy automáticamente

### Opción 2: Vercel CLI
```bash
# Instalar Vercel CLI
npm install -g vercel

# Conectar con Vercel (si no estás autenticado)
vercel login

# Configurar variables
vercel env add DATABASE_URL
vercel env add ANTHROPIC_API_KEY
# ... agregar el resto de variables

# Redeploy
vercel deploy --prod
```

## Checklist

- [ ] DATABASE_URL configurada
- [ ] GOOGLE_ID y GOOGLE_SECRET configuradas
- [ ] NEXTAUTH_SECRET generada
- [ ] NEXTAUTH_URL = https://marea-alerta.vercel.app
- [ ] ANTHROPIC_API_KEY configurada (para el asistente)
- [ ] VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY configuradas (para notificaciones)

## Verificación

Después de configurar las variables:
1. Redeploy el proyecto en Vercel
2. Intenta loguearte con Google
3. Verifica que el dashboard cargue datos
4. Prueba el asistente (debería responder a preguntas)
5. Revisa que el mapa muestre zonas de riesgo

## Solución de Problemas

### El asistente muestra "no está disponible"
- Verifica que `ANTHROPIC_API_KEY` esté configurada en Vercel
- Comprueba que la API key sea válida

### El dashboard no muestra datos
- Verifica que `DATABASE_URL` sea accesible desde Vercel
- Revisa los logs: `vercel logs` en CLI

### Google OAuth no funciona
- Verifica que `GOOGLE_ID` y `GOOGLE_SECRET` sean correctas
- Confirma que `NEXTAUTH_URL` apunte a tu dominio en Vercel

## Contacto

Para más información sobre las APIs:
- Anthropic: https://console.anthropic.com
- Google OAuth: https://console.cloud.google.com
- Vercel: https://vercel.com/docs
