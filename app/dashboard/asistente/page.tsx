import { ChatAsistente } from '@/components/chat/ChatAsistente'
import { PageHeader } from '@/components/dashboard/PageHeader'

export default function AsistenteePage() {
  return (
    <div className="flex h-full flex-col space-y-6">
      <PageHeader
        eyebrow="Asistente IA"
        title="Consultas de riesgo"
        description="Recomendaciones personalizadas sobre marea roja"
      />

      <div className="min-h-[500px] flex-1 overflow-hidden rounded-xl border border-border bg-card ring-1 ring-foreground/5">
        <ChatAsistente />
      </div>
    </div>
  )
}
