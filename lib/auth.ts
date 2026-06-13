import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from './db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null
        const email = credentials.email as string

        // El acceso de demostración crea el usuario al vuelo para que siempre
        // funcione, sin depender de Google OAuth ni de un seed previo.
        if (email === 'demo@marea-alert.cl') {
          return db.user.upsert({
            where: { email },
            update: {},
            create: { email, name: 'Usuario Demo', image: '🦪' },
          })
        }

        const user = await db.user.findUnique({ where: { email } })
        return user ?? null
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      return session
    },
  },
})
