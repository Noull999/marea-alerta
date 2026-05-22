import { NextResponse } from 'next/server'
import { fetchVedasActivas } from '@/lib/subpesca'

export async function GET() {
  const vedas = await fetchVedasActivas()
  return NextResponse.json({ vedas, timestamp: new Date().toISOString() })
}
