'use client'
import { useEffect } from 'react'
import { registerServiceWorker } from '@/lib/push-notifications'

export function ServiceWorkerInit() {
  useEffect(() => {
    // Registrar service worker si está disponible
    if ('serviceWorker' in navigator) {
      registerServiceWorker().catch((err) => {
        console.error('Error registering service worker:', err)
      })
    }
  }, [])

  return null
}
