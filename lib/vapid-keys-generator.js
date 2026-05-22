// Ejecutar con: node lib/vapid-keys-generator.js
// Genera claves VAPID para web push notifications

const webpush = require('web-push')

const vapidKeys = webpush.generateVAPIDKeys()

console.log('\n=== VAPID KEYS GENERADAS ===\n')
console.log('Copia estas claves en tu archivo .env.local:\n')
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`)
console.log('\n=== FIN ===\n')
