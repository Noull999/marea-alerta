import { ChatAsistente } from '@/components/chat/ChatAsistente'

export default function AsistenteePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Asistente IA</h1>
        <p className="text-gray-600 mt-1">Obtén recomendaciones personalizadas sobre riesgo de marea roja</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 h-[600px] flex flex-col">
        <ChatAsistente />
      </div>
    </div>
  )
}
