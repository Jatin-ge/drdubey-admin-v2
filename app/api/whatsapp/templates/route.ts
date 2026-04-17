import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const TOKEN = process.env.WHATSAPP_API_TOKEN
  const WABA_ID = process.env.WHATSAPP_WABA_ID

  if (!TOKEN || !WABA_ID) {
    return NextResponse.json([])
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v22.0/${WABA_ID}/message_templates?limit=100&fields=name,status,language,category`,
      {
        headers: { 'Authorization': `Bearer ${TOKEN}` },
      }
    )
    const data = await res.json()

    if (!res.ok) {
      console.error('[WA_TEMPLATES]', data.error?.message)
      return NextResponse.json([])
    }

    // Only return APPROVED templates
    const approved = (data.data || []).filter(
      (t: any) => t.status === 'APPROVED'
    )

    return NextResponse.json(approved)
  } catch (error) {
    console.error('[WA_TEMPLATES]', error)
    return NextResponse.json([])
  }
}
