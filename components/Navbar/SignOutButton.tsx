'use client'
import { signOut } from 'next-auth/react'

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/sign-in' })}
      className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
    >
      Sign Out
    </button>
  )
}
