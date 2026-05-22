import type { NextConfig } from 'next'

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // En desarrollo, deshabilitar PWA para evitar problemas con hot reload
  disable: process.env.NODE_ENV === 'development',
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
  experimental: { typedRoutes: true },
  // Optimizaciones para PWA
  swcMinify: true,
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
