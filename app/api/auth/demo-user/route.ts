import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEMO_USER_EMAIL } from '@/lib/auth'

export async function POST() {
  try {
    // Solo disponible en modo demo (sin Google OAuth configurado).
    if (process.env.GOOGLE_ID && process.env.GOOGLE_SECRET) {
      return NextResponse.json({ error: 'Not available' }, { status: 404 })
    }

    await db.user.upsert({
      where: { email: DEMO_USER_EMAIL },
      update: {},
      create: {
        email: DEMO_USER_EMAIL,
        name: 'Usuario Demo',
        image: '🦪',
      },
    })

    // No exponemos el objeto User completo.
    return NextResponse.json({
      success: true,
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
