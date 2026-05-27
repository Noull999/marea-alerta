import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    const demoUser = await db.user.upsert({
      where: { email: 'demo@marea-alert.cl' },
      update: {},
      create: {
        email: 'demo@marea-alert.cl',
        name: 'Usuario Demo',
        image: '🦪',
      },
    })

    return NextResponse.json({
      success: true,
      user: demoUser,
      message: 'Usuario de demostración creado/verificado',
    })
  } catch (error) {
    console.error('Error creating demo user:', error)
    return NextResponse.json(
      { error: 'Error creating demo user', details: String(error) },
      { status: 500 }
    )
  }
}
