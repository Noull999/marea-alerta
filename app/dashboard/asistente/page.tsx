import { ChatAsistente } from '@/components/chat/ChatAsistente'

export default function AsistenteePage() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Asistente IA</h1>
        <p className="text-gray-600 mt-1">Obtén recomendaciones personalizadas sobre riesgo de marea roja</p>
      </div>

      <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden min-h-[500px]">
        <ChatAsistente />
      </div>
    </div>
  )
}
