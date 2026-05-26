import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const ahora = new Date()
    const hace24Horas = new Date(ahora.getTime() - 24 * 60 * 60 * 1000)
    const hace7Dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      alertasRecientes,
      alertasUltimos7,
      centrosActivos,
      usuariosActivos,
      eventosHAB,
    ] = await Promise.all([
      db.alerta.findMany({
        where: { createdAt: { gte: hace24Horas } },
      }),
      db.alerta.findMany({
        where: { createdAt: { gte: hace7Dias } },
      }),
      db.centro.findMany({
        where: { activo: true },
      }),
      db.user.findMany({
        where: {
          centros: {
            some: { activo: true },
          },
        },
      }),
      db.hABAlert.findMany({
        where: { fecha: { gte: hace7Dias } },
      }),
    ])

    const estadisticas24h = {
      alertasRojo: alertasRecientes.filter((a) => a.nivel === 'ROJO').length,
      alertasAmarillo: alertasRecientes.filter((a) => a.nivel === 'AMARILLO')
        .length,
      alertasVerde: alertasRecientes.filter((a) => a.nivel === 'VERDE').length,
    }

    const estadisticas7d = {
      alertasRojo: alertasUltimos7.filter((a) => a.nivel === 'ROJO').length,
      alertasAmarillo: alertasUltimos7.filter((a) => a.nivel === 'AMARILLO')
        .length,
      alertasVerde: alertasUltimos7.filter((a) => a.nivel === 'VERDE').length,
    }

    // Agrupar alertas por zona (últimos 7 días)
    const alertasPorZona = alertasUltimos7.reduce(
      (acc, alerta) => {
        acc[alerta.zona] = (acc[alerta.zona] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    // Distribuir eventos HAB por especie
    const habPorEspecie = eventosHAB.reduce(
      (acc, evento) => {
        acc[evento.especie] = (acc[evento.especie] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({
      fecha: ahora.toISOString(),
      resumen: {
        centrosActivos: centrosActivos.length,
        usuariosActivos: usuariosActivos.length,
        eventosHABRecientes: eventosHAB.length,
      },
      ultimas24Horas: estadisticas24h,
      ultimos7Dias: estadisticas7d,
      alertasPorZona,
      habPorEspecie,
      tendencia: {
        alertasAumentando:
          estadisticas7d.alertasRojo + estadisticas7d.alertasAmarillo >
          estadisticas24h.alertasRojo + estadisticas24h.alertasAmarillo,
        riesgoPromedio:
          estadisticas7d.alertasRojo * 2 +
          estadisticas7d.alertasAmarillo +
          estadisticas7d.alertasVerde,
      },
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
