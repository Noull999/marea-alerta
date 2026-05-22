# MareaAlerta - Project Summary

## Overview

**MareaAlerta** is a Progressive Web App (PWA) designed to monitor and predict red tide (Harmful Algal Bloom / FAN - Floración Algal Nociva) risk in Los Lagos, Chile. The application provides real-time alerts, oceanographic data integration, and AI-powered guidance for shellfish farmers.

**Status**: Complete - Tasks 1-9 fully implemented. Ready for configuration and deployment.

---

## Technology Stack

### Frontend
- **Next.js 15** with App Router (TypeScript)
- **Tailwind CSS v4** with shadcn/ui components
- **Leaflet.js** for interactive mapping
- **React Query** for data fetching
- **Web APIs**: Service Workers, Push Notifications, Web Storage

### Backend
- **Next.js API Routes** (Node.js runtime)
- **Auth.js v5** with Google OAuth 2.0
- **Prisma v6** ORM with PostgreSQL

### Database
- **PostgreSQL** (via Neon)
- **9 Models**: User, Account, Session, Centro, BitacoraEntry, Alerta, AlertaCentro, PushSubscription, FanDataCache

### External Data Sources (5 Integrations)
1. **Open-Meteo API**: Wave height, wind, temperature (free, public)
2. **Subpesca / datos.gob.cl**: Fishing vedas sanitarias (Chilean fisheries bans)
3. **IFOP**: Red tide historical data via web scraping (Cheerio)
4. **Copernicus Marine**: SST and chlorophyll (optional, requires credentials)
5. **Custom Algorithm**: Risk calculation from multi-factor scoring

### AI & Chat
- **Anthropic Claude** via Vercel AI SDK
- Streaming responses for real-time chat
- Specialized system prompt for FAN risk guidance

### Deployment
- **Vercel** (Next.js native hosting)
- Serverless Functions with Fluid Compute
- Automatic HTTPS, CDN, edge caching

### Testing & DevTools
- **Jest** with TypeScript support
- **Prisma Studio** for database management
- **Vercel CLI** for local env simulation

---

## Project Structure

```
marea-alerta/
├── app/
│   ├── (auth)/                    # Login & auth pages
│   ├── (dashboard)/               # Protected dashboard routes
│   │   ├── page.tsx              # Home with stats & map
│   │   ├── alertas/              # Alerts listing
│   │   ├── centros/              # Farm center management
│   │   ├── bitacora/             # Logbook entries
│   │   ├── asistente/            # AI chat assistant
│   │   └── configuracion/         # Settings & notifications
│   ├── api/
│   │   ├── auth/[...nextauth]/   # OAuth endpoints
│   │   ├── centros/              # Center CRUD operations
│   │   ├── bitacora/             # Logbook CRUD
│   │   ├── fan-data/             # Aggregated oceanographic data
│   │   ├── vedas/                # Fishing ban data
│   │   ├── fan-historico/        # Historical FAN events
│   │   ├── riesgo/               # Risk calculation
│   │   ├── chat/                 # AI streaming chat
│   │   ├── push/                 # Push notification endpoints
│   │   │   ├── subscribe/        # Subscribe to notifications
│   │   │   ├── unsubscribe/      # Unsubscribe from notifications
│   │   │   └── send/             # Internal broadcast notifications
│   │   └── push/
│   └── layout.tsx                # Root with PWA metadata
├── components/
│   ├── mapa/                     # Leaflet map & markers
│   ├── alertas/                  # Alert display components
│   ├── centros/                  # Center management UI
│   ├── bitacora/                 # Logbook forms & tables
│   ├── chat/                     # Chat assistant UI
│   ├── notifications/            # Push notification toggles
│   └── app/                      # App-wide utilities (ServiceWorkerInit)
├── lib/
│   ├── auth.ts                   # Auth.js config
│   ├── db.ts                     # Prisma singleton
│   ├── risk-calculator.ts        # Risk scoring engine
│   ├── open-meteo.ts            # Wave/weather data
│   ├── subpesca.ts              # Vedas data
│   ├── ifop.ts                  # FAN scraping
│   ├── copernicus.ts            # SST/chlorophyll (optional)
│   ├── push-notifications.ts    # Client push utilities
│   ├── send-push-notification.ts # Server push sender
│   ├── chat-context.ts          # Chat system prompt context
│   ├── vapid-keys-generator.js  # VAPID key generation script
│   └── __tests__/               # Unit tests
├── prisma/
│   └── schema.prisma            # Database schema
├── public/
│   ├── sw.js                    # Service Worker
│   ├── manifest.json            # PWA manifest
│   └── icons/                   # App icons (multiple sizes)
├── vercel.json                  # Vercel deployment config
├── next.config.ts               # Next.js + PWA config
├── package.json                 # Dependencies & scripts
└── Documentation/
    ├── README.md                # Project overview
    ├── SETUP_CHECKLIST.md       # Configuration requirements
    ├── PUSH_NOTIFICATIONS_SETUP.md # Push setup guide
    ├── VERCEL_DEPLOYMENT.md     # Deployment guide
    ├── CHANGELOG.md             # Version history
    ├── .env.example             # Template env vars
    └── PROJECT_SUMMARY.md       # This file
```

---

## Key Features

### 1. Real-Time Risk Assessment
- **Multi-factor scoring**: Temperature anomalies, historical FAN events, wave conditions, fishing bans
- **Color-coded alerts**: VERDE (0-29), AMARILLO (30-59), ROJO (≥60)
- **6-hour cached data** from 5 external sources
- **API endpoint**: `GET /api/riesgo/[zona]` with detailed factor breakdown

### 2. Interactive Map
- **Leaflet.js** with OpenStreetMap base layer
- **Dynamic markers** for 5 reference zones (color-coded by risk)
- **User farm locations** in blue pins
- **Pop-ups** with zone names, risk levels, recommendations
- **Legend** showing risk colors and center indicator

### 3. Farm Center Management
- Create, read, update, delete farm centers
- Store latitude/longitude for each center
- Link centers to risk zones for personalized alerts
- Database persistence via Prisma

### 4. Digital Logbook (Bitácora)
- Log daily observations: risk level, observations, recommendations
- Date-based entries with automatic timestamps
- Table view with sorting/filtering capability
- Database-backed storage

### 5. AI-Powered Assistant
- **Anthropic Claude** streaming chat
- Specialized knowledge of FAN risk, maritime conditions, farming decisions
- Context-aware responses using user's centers and recent alerts
- 4 quick-prompt suggestions for common questions
- Real-time streaming with loading indicators

### 6. Push Notifications (PWA)
- **Web Push API** with Service Worker
- Subscribe/unsubscribe UI toggle
- Browser permissions handling
- Push subscription persistence
- Internal endpoint for broadcasting alerts
- Background sync support

### 7. Progressive Web App (PWA)
- **Service Worker** for offline capability
- **Runtime caching** with NetworkFirst strategy
- **Web manifest** with app metadata, icons, shortcuts
- **Installable** on iOS, Android, desktop
- **next-pwa** library integration

### 8. Authentication & Authorization
- **Google OAuth 2.0** via Auth.js v5
- User session management
- Protected dashboard routes
- Role-based access control ready (extensible)

### 9. Data Aggregation & Caching
- **FAN Data Endpoint** (`GET /api/fan-data`): Combines 5 data sources
- **Vedas Endpoint** (`GET /api/vedas`): Active fishing ban periods
- **Historical FAN** (`GET /api/fan-historico`): Past events by zone
- **6-hour cache** via Prisma FanDataCache model
- Fallback handling for optional APIs (Copernicus)

---

## Risk Calculator Algorithm

### Scoring Factors

| Factor | Threshold | Points | Logic |
|--------|-----------|--------|-------|
| **SST Anomaly** | ≥2°C | +35 | Major warming |
| | >1°C | +15 | Moderate warming |
| **Historical FAN Events** (30 days) | ≥2 events | +40 | Pattern established |
| | 1 event | +20 | Recent occurrence |
| **Wave Height** | <0.5m | +15 | Calm seas favor bloom |
| **Active Veda** | Present | Variable | Fishing ban indicator |

### Result Levels

- **VERDE (0-29)**: Low risk - Safe for harvesting
- **AMARILLO (30-59)**: Moderate risk - Monitor conditions, consider harvest timing
- **ROJO (≥60)**: High risk - Avoid harvesting, implement protection measures

---

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in with Google
- `GET /api/auth/callback/google` - OAuth callback
- `GET /api/auth/signout` - Sign out

### Data & Risk
- `GET /api/fan-data` - Aggregated oceanographic data (5 sources)
- `GET /api/vedas` - Current fishing bans
- `GET /api/fan-historico?zona=[zone]` - Historical FAN events
- `GET /api/riesgo/[zona]` - Risk level with factors

### Farm Centers
- `GET /api/centros` - List user's centers
- `POST /api/centros` - Create center
- `PUT /api/centros/[id]` - Update center
- `DELETE /api/centros/[id]` - Delete center

### Logbook
- `GET /api/bitacora` - List entries
- `POST /api/bitacora` - Add entry
- `DELETE /api/bitacora/[id]` - Delete entry

### Chat
- `POST /api/chat` - Stream chat with Claude (streaming)

### Notifications
- `POST /api/push/subscribe` - Subscribe to push notifications
- `POST /api/push/unsubscribe` - Unsubscribe
- `POST /api/push/send` - Broadcast notification (internal)

---

## Environment Variables

### Required for All Environments
```
DATABASE_URL=postgresql://user:password@neon.tech/database
GOOGLE_ID=xxx.apps.googleusercontent.com
GOOGLE_SECRET=GOCSPX-xxxxx
NEXTAUTH_SECRET=(openssl rand -base64 32)
NEXTAUTH_URL=https://yourdomain.vercel.app
NEXT_PUBLIC_VAPID_PUBLIC_KEY=xxxxx
VAPID_PRIVATE_KEY=xxxxx
INTERNAL_API_KEY=(openssl rand -hex 32)
```

### Optional
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
COPERNICUS_USERNAME=user@example.com
COPERNICUS_PASSWORD=password
RESEND_API_KEY=re_xxxxx
```

See `.env.example` for full template.

---

## Getting Started

### 1. Prerequisites
- Node.js 20.x or higher
- npm or yarn
- PostgreSQL database (Neon recommended)
- Google Cloud project for OAuth
- Vercel account (for deployment)

### 2. Installation
```bash
cd marea-alerta
npm install
```

### 3. Configuration
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

### 4. Database Setup
```bash
# Generate VAPID keys (for push notifications)
node lib/vapid-keys-generator.js

# Run migrations
npx prisma migrate dev --name init

# Optional: Open Prisma Studio to inspect database
npx prisma studio
```

### 5. Development Server
```bash
npm run dev
# Navigate to http://localhost:3000
```

### 6. Building for Production
```bash
npm run build
npm start
```

---

## Testing

### Run Unit Tests
```bash
npm test
```

### Test Coverage
- Risk calculator (3 test cases): VERDE, AMARILLO, ROJO scenarios
- Mock API responses
- Extensible for component & integration tests

---

## Deployment to Vercel

### Automatic Deployment
1. Push code to GitHub
2. Connect repository to Vercel Dashboard
3. Configure environment variables in Vercel Settings
4. Vercel auto-deploys on main branch push

### Manual Deployment
```bash
npm i -g vercel
vercel env pull  # Load environment variables locally
vercel deploy    # Deploy to production
```

See `VERCEL_DEPLOYMENT.md` for detailed deployment guide with troubleshooting.

---

## Security Considerations

- **OAuth tokens** stored securely in httpOnly cookies
- **Database passwords** never in version control (use `.env.local`)
- **INTERNAL_API_KEY** required for broadcast notifications
- **Service Worker** validates all API requests
- **CORS & CSRF** handled by Next.js defaults
- **NextAuth Secret** required for session encryption

---

## Performance Optimizations

- **Image optimization**: Next.js Image component with lazy loading
- **Code splitting**: Dynamic imports for Leaflet (SSR-unsafe)
- **Data caching**: 6-hour cache for FAN data to reduce API calls
- **Service Worker**: Offline caching with NetworkFirst strategy
- **Edge caching**: Vercel CDN for static assets (1 year TTL)
- **Streaming**: AI chat responses stream in real-time
- **Database**: Prisma query optimization, indexed lookups

---

## Accessibility & Mobile-First

- **Responsive design**: Tailwind breakpoints for all screen sizes
- **WCAG 2.1 AA**: Color contrast, semantic HTML, ARIA labels
- **Touch targets**: Minimum 44px for mobile usability
- **Mobile-first CSS**: Desktop styles layer on top
- **PWA install**: Installable on home screen (iOS/Android)
- **Offline-capable**: Service Worker enables offline logbook viewing

---

## Future Roadmap

### Phase 2 (Planned)
- Email alerts when risk level changes
- Webhook integration with external farm management systems
- Advanced charting for historical trend analysis
- Multi-user team collaboration
- Dark mode support
- Multilingual support (Spanish, English, French)

### Phase 3 (Future)
- Mobile app (React Native)
- Predictive modeling (7-day forecasts)
- Integration with aquaculture management systems
- IoT sensor integration
- Automated harvesting recommendations

---

## Contributing

This is a closed project for MareaAlerta. For modifications or feature requests, contact the project maintainer.

---

## Support & Troubleshooting

See these guides for common issues:
- **Setup**: `SETUP_CHECKLIST.md`
- **Deployment**: `VERCEL_DEPLOYMENT.md`
- **Notifications**: `PUSH_NOTIFICATIONS_SETUP.md`
- **Logs**: Vercel Dashboard → Project → Functions

---

## License

© 2026 MareaAlerta. All rights reserved.

---

## Summary: What Was Built

**10 Complete Implementation Tasks:**

1. ✅ **Project Scaffolding** - Next.js 15, TypeScript, Tailwind, shadcn/ui, next-pwa
2. ✅ **Database Schema** - Prisma with 9 models, PostgreSQL connection
3. ✅ **Authentication** - Auth.js v5 + Google OAuth with protected routes
4. ✅ **5 Data Sources** - Open-Meteo, Subpesca, IFOP scraping, Copernicus, Vedas
5. ✅ **Risk Calculator** - Multi-factor scoring with VERDE/AMARILLO/ROJO levels
6. ✅ **Dashboard & Map** - Interactive Leaflet map, risk markers, center management
7. ✅ **Web Push Notifications** - Service Worker, subscriptions, background sync
8. ✅ **AI Chat Assistant** - Anthropic Claude streaming with specialized prompts
9. ✅ **PWA & Deployment** - Service Worker, manifest, Vercel configuration
10. ✅ **Documentation** - Setup guides, API docs, deployment instructions

**Ready for:**
- Local development with `npm run dev`
- Database configuration with Neon
- OAuth setup with Google Cloud
- VAPID key generation
- Deployment to Vercel

Start with `SETUP_CHECKLIST.md` to configure your environment variables and external services.
