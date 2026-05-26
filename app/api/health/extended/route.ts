import { NextRequest, NextResponse } from 'next/server'

interface HealthCheck {
  name: string
  status: 'ok' | 'warning' | 'error' | 'not_configured'
  message: string
  lastCheck?: string
}

interface SystemHealth {
  timestamp: string
  overall_status: 'healthy' | 'degraded' | 'unhealthy'
  database: HealthCheck
  api_config: HealthCheck
  data_sources: {
    [key: string]: HealthCheck
  }
  summary: {
    healthy: number
    degraded: number
    unhealthy: number
    not_configured: number
  }
}

export async function GET(request: NextRequest) {
  const checks: HealthCheck[] = []
  const dataSourceChecks: { [key: string]: HealthCheck } = {}

  // 1. Database check
  try {
    const db = process.env.DATABASE_URL
    if (!db) {
      checks.push({
        name: 'Database',
        status: 'not_configured',
        message: 'DATABASE_URL not set'
      })
    } else {
      checks.push({
        name: 'Database',
        status: 'ok',
        message: 'Database URL configured'
      })
    }
  } catch (error) {
    checks.push({
      name: 'Database',
      status: 'error',
      message: `Database check failed: ${error}`
    })
  }

  // 2. Auth configuration check
  try {
    const secret = process.env.NEXTAUTH_SECRET
    const url = process.env.NEXTAUTH_URL

    if (!secret || !url) {
      checks.push({
        name: 'Authentication',
        status: 'error',
        message: 'Missing NEXTAUTH_SECRET or NEXTAUTH_URL'
      })
    } else {
      checks.push({
        name: 'Authentication',
        status: 'ok',
        message: 'NextAuth configured'
      })
    }
  } catch (error) {
    checks.push({
      name: 'Authentication',
      status: 'error',
      message: `Auth check failed: ${error}`
    })
  }

  // 3. Data source configuration checks
  const dataSources = [
    {
      name: 'NOAA Upwelling Index',
      envVars: ['NOAA_API_KEY', 'NOAA_UPWELLING_BASE_URL'],
      optional: false
    },
    {
      name: 'CMEMS',
      envVars: ['CMEMS_USERNAME', 'CMEMS_PASSWORD', 'CMEMS_API_URL'],
      optional: false
    },
    {
      name: 'HyCOM',
      envVars: ['HYCOM_ERDDAP_URL', 'HYCOM_DATASET_ID'],
      optional: false
    },
    {
      name: 'Argo Floats',
      envVars: ['ARGO_ERDDAP_URL', 'ARGO_DATASET_ID'],
      optional: false
    },
    {
      name: 'AVISO',
      envVars: ['AVISO_API_URL', 'AVISO_USERNAME', 'AVISO_PASSWORD'],
      optional: false
    },
    {
      name: 'Sentinel-3 OLCI',
      envVars: ['GOOGLE_EARTH_ENGINE_KEY', 'SENTINEL_HUB_TOKEN', 'SENTINEL_3_ERDDAP_URL'],
      optional: false
    },
    {
      name: 'EMODnet',
      envVars: ['EMODNET_API_URL', 'EMODNET_USERNAME', 'EMODNET_PASSWORD'],
      optional: false
    },
    {
      name: 'IOOS',
      envVars: ['IOOS_ERDDAP_URL'],
      optional: false
    },
    {
      name: 'Bio-ORACLE',
      envVars: ['BIO_ORACLE_API_URL'],
      optional: false
    },
    {
      name: 'SHOA',
      envVars: ['SHOA_API_URL', 'SHOA_API_KEY'],
      optional: true
    },
    {
      name: 'IFOP',
      envVars: ['IFOP_API_URL', 'IFOP_API_KEY'],
      optional: true
    },
    {
      name: 'NASA',
      envVars: ['NASA_API_KEY'],
      optional: true
    }
  ]

  dataSources.forEach(({ name, envVars, optional }) => {
    const missingVars = envVars.filter((v) => !process.env[v])

    if (missingVars.length === 0) {
      dataSourceChecks[name] = {
        name,
        status: 'ok',
        message: `All required variables configured (${envVars.length})`
      }
    } else if (optional) {
      dataSourceChecks[name] = {
        name,
        status: 'warning',
        message: `Optional - Missing: ${missingVars.join(', ')}`
      }
    } else {
      dataSourceChecks[name] = {
        name,
        status: 'error',
        message: `Missing required: ${missingVars.join(', ')}`
      }
    }
  })

  // Calculate summary
  const allChecks = [...checks, ...Object.values(dataSourceChecks)]
  const summary = {
    healthy: allChecks.filter((c) => c.status === 'ok').length,
    degraded: allChecks.filter((c) => c.status === 'warning').length,
    unhealthy: allChecks.filter((c) => c.status === 'error').length,
    not_configured: allChecks.filter((c) => c.status === 'not_configured').length
  }

  const overallStatus: 'healthy' | 'degraded' | 'unhealthy' =
    summary.unhealthy > 0 ? 'unhealthy' : summary.degraded > 0 ? 'degraded' : 'healthy'

  const health: SystemHealth = {
    timestamp: new Date().toISOString(),
    overall_status: overallStatus,
    database: checks.find((c) => c.name === 'Database') || {
      name: 'Database',
      status: 'error',
      message: 'Unknown'
    },
    api_config: checks.find((c) => c.name === 'Authentication') || {
      name: 'Authentication',
      status: 'error',
      message: 'Unknown'
    },
    data_sources: dataSourceChecks,
    summary
  }

  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 202 : 503

  return NextResponse.json(health, { status: statusCode })
}
