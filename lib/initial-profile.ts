import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const InitialProfile = async () => {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/sign-in')
  }
  return session.user
}
