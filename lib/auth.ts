import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        userName: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.userName || !credentials?.password) {
          return null
        }
        const admin = await db.adminProfile.findFirst({
          where: { userName: credentials.userName }
        })
        if (!admin) return null
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          admin.password
        )
        if (!passwordMatch) return null
        return {
          id: admin.id,
          name: admin.userName,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: { signIn: '/sign-in' },
  secret: process.env.NEXTAUTH_SECRET,
}
