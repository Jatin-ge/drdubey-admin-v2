import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
export const dynamic = 'force-dynamic'

const GOOGLE_REVIEW_LINK =
  'https://g.page/r/PLACEHOLDER_REVIEW_LINK/review'

export async function POST() {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const thirtyOneDaysAgo = new Date()
    thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31)

    const patients = await db.lead.findMany({
      where: {
        patientStatus: 'IPD',
        doad: {
          gte: thirtyOneDaysAgo,
          lte: thirtyDaysAgo,
        },
        phone: { not: null },
      },
      select: {
        id: true,
        name: true,
        phone: true,
      },
      take: 50,
    })

    console.log('Review requests to send:', patients.length)

    const PHONE_ID = process.env.WHATSAPP_PHONE_ID
    const TOKEN = process.env.WHATSAPP_API_TOKEN

    let sent = 0

    for (const patient of patients) {
      try {
        if (!patient.phone) continue

        const phone = patient.phone
          .replace(/\D/g, '')
          .replace(/^0/, '')
        const fullPhone = phone.startsWith('91')
          ? phone : `91${phone}`

        if (PHONE_ID && TOKEN) {
          await fetch(
            `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: fullPhone,
                type: 'template',
                template: {
                  name: 'google_review_request_hi',
                  language: { code: 'hi' },
                  components: [{
                    type: 'body',
                    parameters: [
                      {
                        type: 'text',
                        text: patient.name || 'आपका'
                      },
                      {
                        type: 'text',
                        text: GOOGLE_REVIEW_LINK
                      },
                    ]
                  }]
                }
              })
            }
          )
        }

        sent++
        await new Promise(r => setTimeout(r, 200))

      } catch (err) {
        console.error('Failed for patient:', patient.id, err)
      }
    }

    return NextResponse.json({
      checked: patients.length,
      sent,
    })

  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    )
  }
}
