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
    <div className="flex h-full w-full flex-col overflow-hidden bg-card">
      {/* Messages Area */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-background/40 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs break-words rounded-2xl px-4 py-3 md:max-w-md lg:max-w-lg ${
                message.role === 'user'
                  ? 'rounded-br-sm bg-primary text-primary-foreground'
                  : 'rounded-bl-sm border border-border bg-card text-foreground'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </p>
            </div>
          </div>
        ))}

        {/* Quick Prompts */}
        {messages.length === 1 && !loading && (
          <div className="mt-6 space-y-2">
            <p className="px-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Preguntas frecuentes
            </p>
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
                  className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted hover:text-foreground"
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
            <div className="rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 text-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta..."
            disabled={loading}
            className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex min-w-[40px] items-center justify-center rounded-lg bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-40"
            title="Enviar"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
