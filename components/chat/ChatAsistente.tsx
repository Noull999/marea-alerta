'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const QUICK_PROMPTS = [
  '¿Cuál es el riesgo actual en mi zona?',
  '¿Debo cosechar ahora o esperar?',
  '¿Cómo interpretar los datos de oleaje?',
  '¿Qué significa una alerta ROJO?',
]

export function ChatAsistente() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Hola 👋 Soy el asistente de MareaAlerta. Puedo ayudarte con:\n\n• Interpretación de riesgo de marea roja (FAN)\n• Decisiones sobre cosecha y protección\n• Análisis de datos oceanográficos\n• Recomendaciones según condiciones actuales\n\n¿En qué puedo ayudarte hoy?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (response.status === 503) {
        const errorData = await response.json().catch(() => ({}))
        const errorContent = errorData.message || 'El asistente no está disponible en este momento.'
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ ${errorContent}`,
        }
        setMessages((prev) => [...prev, errorMessage])
        setLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let content = ''

      if (reader) {
        let done = false
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '',
        }
        setMessages((prev) => [...prev, assistantMessage])

        while (!done) {
          const { value, done: streamDone } = await reader.read()
          done = streamDone
          const chunk = decoder.decode(value)
          content += chunk

          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1].content = content
            return updated
          })
        }
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          '❌ Error procesando tu mensaje. Por favor, verifica tu conexión e intenta de nuevo.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-lg overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg break-words ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                  : 'bg-white text-gray-900 rounded-bl-none shadow-sm border border-gray-200'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
          </div>
        ))}

        {/* Quick Prompts */}
        {messages.length === 1 && !loading && (
          <div className="space-y-2 mt-6">
            <p className="text-xs text-gray-500 font-medium px-2">Preguntas frecuentes:</p>
            <div className="grid grid-cols-1 gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInput(prompt)
                    setTimeout(() => {
                      const form = document.querySelector('form') as HTMLFormElement
                      form?.dispatchEvent(new Event('submit', { bubbles: true }))
                    }, 100)
                  }}
                  className="text-left text-xs px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 transition active:bg-blue-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 px-4 py-3 rounded-lg rounded-bl-none shadow-sm border border-gray-200">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta..."
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center min-w-[40px]"
            title="Enviar"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
