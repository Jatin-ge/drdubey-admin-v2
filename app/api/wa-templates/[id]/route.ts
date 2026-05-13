import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  validateButtons,
  serializeButtons,
  type TemplateButton,
} from '@/lib/wa-template-buttons'
export const dynamic = 'force-dynamic'

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()

    // Buttons: only update buttonsJson when the client explicitly sent the
    // `buttons` field. If it's undefined we leave the existing column alone
    // — important for backward-compat with any older clients that don't
    // know about buttons yet (they'd accidentally wipe buttons otherwise).
    const data: Record<string, unknown> = {
      name: body.name,
      nameHi: body.nameHi,
      category: body.category,
      language: body.language,
      bodyHi: body.bodyHi,
      bodyEn: body.bodyEn,
      metaName: body.metaName,
      headerType: (body.headerType || 'NONE').toUpperCase(),
      headerText: body.headerText?.trim() || null,
      headerMediaUrl: body.headerMediaUrl?.trim() || null,
      footerText: body.footerText?.trim() || null,
      isApproved: body.isApproved,
      isActive: body.isActive ?? true,
      updatedAt: new Date(),
    }

    if (body.buttons !== undefined) {
      const incoming: TemplateButton[] = Array.isArray(body.buttons)
        ? body.buttons
        : []
      const check = validateButtons(incoming)
      if (!check.ok) {
        return NextResponse.json({ error: check.error }, { status: 400 })
      }
      data.buttonsJson = incoming.length ? serializeButtons(incoming) : null
    }

    const updated = await db.whatsAppTemplate.update({
      where: { id: params.id },
      data,
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
