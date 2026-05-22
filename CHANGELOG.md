# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-22

### ✨ Agregado

#### Autenticación & Usuarios
- Autenticación con Google OAuth via Auth.js v5
- Sistema de sesiones seguras
- Rutas protegidas con autenticación

#### Dashboard Principal
- Vista general con estadísticas de riesgo
- Mapa interactivo con Leaflet
- Marcadores de centros y zonas
- Leyenda de riesgos (Verde/Amarillo/Rojo)
- Vista rápida de alertas recientes

#### Gestión de Centros de Cultivo
- CRUD completo de centros
- Almacenamiento de coordenadas geográficas
- Visualización en mapa
- Asociación con usuarios

#### Sistema de Alertas
- Historial de alertas
- Filtrado por nivel de riesgo
- Detalles contextuales
- Integración con SERNAPESCA

#### Bitácora Digital
- Registro de observaciones
- Campos: fecha, riesgo, observación, recomendación
- Histórico de seguimiento
- Tabla con búsqueda

#### Asistente IA
- Chat en tiempo real con Claude
- Streaming de respuestas
- Contexto de usuario automático
- Prompts rápidos sugeridos
- Especialización en risk guidance

#### Notificaciones Push
- Registro e implementación de Service Worker
- VAPID keys para autenticación
- Suscripción a notificaciones
- Envío de alertas
- Almacenamiento seguro de suscripciones
- Sincronización en segundo plano

#### Fuentes de Datos Integradas
- **Open-Meteo**: Datos oceanográficos (oleaje, viento, temperatura)
- **IFOP**: Web scraping de eventos FAN históricos
- **SUBPESCA**: API CKAN para vedas sanitarias
- **Copernicus**: SST y datos de clorofila (opcional)

#### Algoritmo de Cálculo de Riesgo
- Puntuación multi-factor (0-100)
- Factores: vedas, SST anomalía, oleaje, historial FAN
- Niveles: Verde (0-29), Amarillo (30-59), Rojo (≥60)
- API endpoint `/api/riesgo/[zona]`

#### API REST Completa
- 10+ endpoints funcionales
- Autenticación en endpoints sensibles
- Manejo de errores robusto
- Rate limiting

#### PWA (Progressive Web App)
- Instalable en dispositivos
- Funciona offline
- Service Worker cache
- Manifest completo
- Iconos múltiples tamaños
- Apple Web App support

#### UI/UX
- Interfaz responsive
- Modo claro
- Componentes reutilizables
- Accesibilidad WCAG
- Tipografía clara

#### Base de Datos
- 9 modelos Prisma
- Migraciones automáticas
- Soporte PostgreSQL (Neon)
- Índices optimizados

#### Despliegue
- Configuración Vercel completa
- Soporte para CI/CD
- Variables de entorno seguras
- Health checks

#### Documentación
- README.md con instrucciones
- SETUP_CHECKLIST.md detallado
- PUSH_NOTIFICATIONS_SETUP.md
- VERCEL_DEPLOYMENT.md
- Comentarios en código

### 🔧 Técnico

- TypeScript para type-safety
- Tailwind CSS v4
- Next.js 15 App Router
- Prisma v6 ORM
- Jest para tests
- ESLint & Prettier

### 📚 Documentación Incluida

- Setup inicial paso a paso
- Variables de entorno
- Configuración de cada servicio externo
- Troubleshooting común
- Guía de despliegue Vercel

## Futuras Mejoras (Roadmap)

### v1.1.0 (Próximo)
- [ ] Integración SMS para alertas críticas
- [ ] Dashboard analítico avanzado
- [ ] Exportar reportes a PDF
- [ ] Predicción de riesgo con ML
- [ ] Multi-idioma (Inglés, Francés)

### v1.2.0
- [ ] Integración con Slack/Teams
- [ ] APIs públicas para terceros
- [ ] Historial de cambios de riesgo
- [ ] Comparativas entre centros
- [ ] Widget embebible

### v2.0.0
- [ ] App móvil nativa (React Native)
- [ ] Sistema de reportes SERNAPESCA integrado
- [ ] Seguimiento de cosechas
- [ ] Precios de mercado integrados
- [ ] Blockchain para trazabilidad

## Notas

- Primer release de producción
- Todas las características principales implementadas
- Listo para usuarios beta
- Soporte técnico disponible

---

Para reportar bugs o sugerir features, abre un issue en GitHub.
