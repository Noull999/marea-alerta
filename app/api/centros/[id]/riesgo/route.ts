import { NextResponse } from 'next/server'
import { generateCentroRiskReport } from '@/lib/report-generator'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const report = await generateCentroRiskReport(id)

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error generating centro risk report:', error)
    return NextResponse.json(
      { error: 'Failed to generate risk report' },
      { status: 500 }
    )
  }
}
