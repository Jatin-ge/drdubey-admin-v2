import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const currentProfile = async () => {
  const session = await getServerSession(authOptions)
  if (!session) return null
  return {
    ...session.user,
    userId: (session.user as any)?.id ?? '',
    imageUrl: session.user?.image ?? null,
  }
}
