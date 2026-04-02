import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

export async function GET() {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/campaigns/send`,
    { method: 'POST' }
  )
  const data = await res.json()
  return NextResponse.json(data)
}
