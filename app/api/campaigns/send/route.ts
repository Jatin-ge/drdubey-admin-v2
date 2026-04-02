import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const now = new Date()

    const dueCampaigns = await db.campaign.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: { lte: now }
      }
    })

    console.log('Due campaigns:', dueCampaigns.length)

    for (const campaign of dueCampaigns) {
      await db.campaign.update({
        where: { id: campaign.id },
        data: { status: 'SENDING' }
      })

      const patients = await db.lead.findMany({
        where: {
          id: { in: campaign.patientIds }
        },
        select: {
          id: true,
          name: true,
          phone: true,
        }
      })

      const template = await db.whatsAppTemplate.findUnique({
        where: { id: campaign.templateId }
      })

      if (!template) continue

      let sentCount = 0
      let failedCount = 0

      const PHONE_ID = process.env.WHATSAPP_PHONE_ID
      const TOKEN = process.env.WHATSAPP_API_TOKEN

      for (const patient of patients) {
        try {
          if (!patient.phone) {
            throw new Error('No phone number')
          }

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
                    name: template.metaName,
                    language: {
                      code: campaign.language === 'hi' ? 'hi' : 'en'
                    },
                  }
                })
              }
            )
          }

          await db.campaignLog.create({
            data: {
              campaignId: campaign.id,
              patientId: patient.id,
              patientName: patient.name || '',
              phone: patient.phone || '',
              status: 'SENT',
              sentAt: new Date(),
            }
          })
          sentCount++

          await new Promise(r => setTimeout(r, 100))

        } catch (err: any) {
          await db.campaignLog.create({
            data: {
              campaignId: campaign.id,
              patientId: patient.id,
              patientName: patient.name || '',
              phone: patient.phone || '',
              status: 'FAILED',
              error: err.message,
            }
          })
          failedCount++
        }
      }

      await db.campaign.update({
        where: { id: campaign.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          sentCount,
          failedCount,
        }
      })
    }

    return NextResponse.json({
      processed: dueCampaigns.length
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    )
  }
}
