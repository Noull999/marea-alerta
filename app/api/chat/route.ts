import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { auth } from '@/lib/auth'

const systemPrompt = `Eres MareaAlerta Assistant, un experto en acuicultura y alertas de marea roja (Floraciones Algales Nocivas - FAN) en Los Lagos, Chile.

Tu rol es ayudar a cultores de moluscos a:
1. Entender el riesgo de marea roja (FAN) en sus zonas de cultivo
2. Tomar decisiones informadas sobre cosecha, protección y seguridad
3. Interpretar datos científicos: oleaje, temperatura, historial de FAN
4. Cumplir con regulaciones de SERNAPESCA (Servicio Nacional de Pesca)
5. Optimizar sus operaciones frente a condiciones adversas

INFORMACIÓN DE RIESGO:
- VERDE (0-29 puntos): Sin riesgo detectado
- AMARILLO (30-59 puntos): Precaución, monitorear constantemente
- ROJO (≥60 puntos o veda activa): Alto riesgo, evaluar cosecha inmediata o contactar SERNAPESCA

TU TONO:
- Profesional pero accesible
- Basado en evidencia científica
- Práctico y accionable
- Empático con presiones operacionales

PAUTAS:
- Responde siempre en español
- Proporciona recomendaciones específicas cuando sea posible
- Si falta información crítica, sugiere acciones
- En situaciones de alto riesgo, enfatiza contactar autoridades
- Valida que entiendas ubicación/zona del usuario cuando sea relevante`

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { messages } = await req.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({
          error: 'Asistente no configurado',
          message: 'La API de IA no está configurada. Por favor, contacta al administrador.',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const result = streamText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      system: systemPrompt,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.7,
    })

    return (await result).toTextStreamResponse()
  } catch (error) {
    console.error('Chat error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    if (errorMessage.includes('401') || errorMessage.includes('authentication')) {
      return new Response(
        'Error de autenticación con el servicio de IA. Verifica que ANTHROPIC_API_KEY esté configurado.',
        { status: 503 }
      )
    }

    return new Response('Error procesando tu pregunta. Intenta de nuevo.', { status: 500 })
  }
}
