import { NextResponse } from 'next/server'
import { fetchFANHistoricoIFOP, fetchFANPorZonaIFOP } from '@/lib/ifop'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const zona = searchParams.get('zona')

  let datos
  if (zona) {
    datos = await fetchFANPorZonaIFOP(zona)
  } else {
    datos = await fetchFANHistoricoIFOP()
  }

  return NextResponse.json({
    datos,
    fuente: 'IFOP',
    zona: zona || 'todos',
    timestamp: new Date().toISOString()
  })
}
