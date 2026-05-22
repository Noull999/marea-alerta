import type { NextConfig } from 'next'

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Deshabilitar PWA en Vercel (producción) por conflicto con Turbopack
  disable: process.env.NODE_ENV === 'production' || process.env.VERCEL === '1',
  // Archivos a incluir en el cache
  publicExcludes: ['!robots.txt', '!sitemap.xml'],
  // Configuración de runtime caching
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
})

const nextConfig: NextConfig = {
  typedRoutes: true,
  turbopack: {},
  // Asegurar que los assets estáticos se cacheen correctamente
  headers: async () => {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ]
  },
}

module.exports = withPWA(nextConfig)
