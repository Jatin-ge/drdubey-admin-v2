import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

export async function GET() {
  const PHONE_ID = process.env.WHATSAPP_PHONE_ID
  const TOKEN = process.env.WHATSAPP_API_TOKEN
  const WABA_ID = process.env.WHATSAPP_WABA_ID

  if (!PHONE_ID || !TOKEN) {
    return NextResponse.json({
      status: 'error',
      message: 'Missing env vars',
      PHONE_ID: !!PHONE_ID,
      TOKEN: !!TOKEN,
    })
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v22.0/${PHONE_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
        }
      }
    )
    const data = await res.json()

    return NextResponse.json({
      status: res.ok ? 'connected' : 'error',
      phoneNumberId: PHONE_ID,
      wabaId: WABA_ID,
      phoneData: res.ok ? {
        displayPhone: data.display_phone_number,
        verifiedName: data.verified_name,
        qualityRating: data.quality_rating,
        status: data.status,
      } : null,
      error: res.ok ? null : data.error?.message,
    })
  } catch (e: any) {
    return NextResponse.json({
      status: 'error',
      message: e.message,
    })
  }
}
