import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
export const dynamic = 'force-dynamic'

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const updated = await db.whatsAppTemplate.update({
      where: { id: params.id },
      data: {
        name: body.name,
        nameHi: body.nameHi,
        category: body.category,
        language: body.language,
        bodyHi: body.bodyHi,
        bodyEn: body.bodyEn,
        metaName: body.metaName,
        isApproved: body.isApproved,
        isActive: body.isActive ?? true,
        updatedAt: new Date(),
      },
    })
    return NextResponse.json(updated)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if template was submitted to Meta
    const template = await db.whatsAppTemplate.findUnique({
      where: { id: params.id },
    })

    if (template?.metaName && template.metaStatus !== 'DRAFT') {
      // Try to delete from Meta first
      const TOKEN = process.env.WHATSAPP_API_TOKEN
      const WABA_ID = process.env.WHATSAPP_WABA_ID
      if (TOKEN && WABA_ID) {
        try {
          await fetch(
            `https://graph.facebook.com/v22.0/${WABA_ID}/message_templates?name=${template.metaName}`,
            {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${TOKEN}` },
            }
          )
        } catch {
          // Continue with DB delete even if Meta delete fails
        }
      }
    }

    await db.whatsAppTemplate.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
