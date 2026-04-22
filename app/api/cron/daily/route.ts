import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const base = process.env.NEXTAUTH_URL ||
    'https://admin.drdubay.in'

  const [campaigns, reviews, resumed] = await Promise.all([
    fetch(`${base}/api/campaigns/send`, {
      method: 'POST'
    }).then(r => r.json()).catch(e => ({
      error: e.message
    })),
    fetch(`${base}/api/reviews/send`, {
      method: 'POST'
    }).then(r => r.json()).catch(e => ({
      error: e.message
    })),
    fetch(`${base}/api/campaigns/resume-stalled`, {
      method: 'POST'
    }).then(r => r.json()).catch(e => ({
      error: e.message
    })),
  ])

  return NextResponse.json({ campaigns, reviews, resumed })
}
