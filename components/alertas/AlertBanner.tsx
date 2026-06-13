'use client'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface AlertBannerProps {
  zonas: string[]
}

export function AlertBanner({ zonas }: AlertBannerProps) {
  return (
    <Alert className="border-red-500/40 bg-red-500/10">
      <AlertTriangle className="h-4 w-4 text-red-400" />
      <AlertTitle className="text-red-300">Alerta de Riesgo Alto</AlertTitle>
      <AlertDescription className="text-red-200/80">
        Se detectó alto riesgo de marea roja en: {zonas.join(', ')}.
        Evalúe cosechar de inmediato o contacte a SERNAPESCA.
      </AlertDescription>
    </Alert>
  )
}
