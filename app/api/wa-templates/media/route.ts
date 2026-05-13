import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { whatsappApi } from '@/lib/whatsapp-api'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Dual-destination upload for WhatsApp template header media.
//
// Meta's WhatsApp Cloud API requires TWO different things for media
// templates that we have to support simultaneously:
//
// 1. For template CREATION it needs an `example.header_handle` value
//    which must be a "resumable upload handle" (like "4::aW1...") —
//    a URL is silently rejected with the unhelpful error
//    "Missing sample parameter for title type". The handle is
//    obtained by uploading the file to /APP_ID/uploads in Meta's
//    Graph API.
//
// 2. For message SENDING it needs a publicly-fetchable HTTPS URL in
//    the `link` field — the handle from (1) doesn't work here.
//
// We do both uploads in parallel so the team only has to pick the
// file once. The handle goes into headerMediaUrl (used by
// buildMetaComponents at template-creation time). The Blob URL goes
// into headerMediaSendUrl (used by resolveSendMediaUrl at send time).
const ALLOWED = {
  IMAGE:    { types: ['image/jpeg', 'image/png'],                      max: 5 * 1024 * 1024 },
  VIDEO:    { types: ['video/mp4', 'video/3gpp'],                      max: 16 * 1024 * 1024 },
  DOCUMENT: { types: ['application/pdf'],                              max: 100 * 1024 * 1024 },
} as const

type Format = keyof typeof ALLOWED

function sanitizeName(name: string): string {
  const dot = name.lastIndexOf('.')
  const stem = (dot > 0 ? name.slice(0, dot) : name)
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 60)
  const ext = (dot > 0 ? name.slice(dot) : '').toLowerCase()
  return (stem || 'file') + ext
}

export async function POST(req: Request) {
  try {
    const fd = await req.formData()
    const file = fd.get('file') as File | null
    const format = (fd.get('format') as string | null)?.toUpperCase() as Format | undefined

    if (!file) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }
    if (!format || !(format in ALLOWED)) {
      return NextResponse.json({ error: 'format must be IMAGE / VIDEO / DOCUMENT' }, { status: 400 })
    }

    const rules = ALLOWED[format]
    if (!rules.types.includes(file.type as never)) {
      return NextResponse.json({
        error: `Invalid file type for ${format}. Got ${file.type || 'unknown'}, expected ${rules.types.join(' / ')}`,
      }, { status: 400 })
    }
    if (file.size > rules.max) {
      return NextResponse.json({
        error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max for ${format}: ${Math.round(rules.max / 1024 / 1024)} MB`,
      }, { status: 400 })
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({
        error:
          'Vercel Blob is not connected. In Vercel dashboard go to ' +
          'Storage → Create → Blob → connect to this project, then redeploy.',
      }, { status: 500 })
    }
    if (!process.env.WHATSAPP_APP_ID) {
      return NextResponse.json({
        error: 'WHATSAPP_APP_ID env var missing — required by Meta resumable upload for template creation',
      }, { status: 500 })
    }

    const key = `wa-headers/${Date.now()}-${sanitizeName(file.name)}`

    // Run both uploads in parallel. If Meta's resumable upload fails the
    // user still gets a clear error before the template create flow even
    // starts — better than failing during the auto-submit step.
    const [blob, handle] = await Promise.all([
      put(key, file, {
        access: 'public',
        contentType: file.type,
        addRandomSuffix: false,
      }),
      whatsappApi.uploadResumable(file, file.type),
    ])

    return NextResponse.json({
      url: blob.url,        // public URL for sending
      handle,               // Meta resumable handle for template creation
      key,
      size: file.size,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Upload failed'
    console.error('[WA_TEMPLATE_MEDIA_UPLOAD]', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
