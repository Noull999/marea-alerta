import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from './db'

export const DEMO_USER_EMAIL = 'demo@marea-alert.cl'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google,
    // Login de demostración: SOLO habilita la cuenta demo y SOLO cuando
    // Google OAuth no está configurado. No autentica cuentas reales por
    // email — eso permitiría suplantar a cualquier usuario sin contraseña.
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
      },
      async authorize(credentials) {
        const googleConfigured = Boolean(process.env.GOOGLE_ID && process.env.GOOGLE_SECRET)
        if (googleConfigured) return null

        const email = credentials?.email as string | undefined
        if (email !== DEMO_USER_EMAIL) return null

        const user = await db.user.findUnique({ where: { email: DEMO_USER_EMAIL } })
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
