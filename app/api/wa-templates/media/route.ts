import { NextResponse } from 'next/server'
import { uploadToR2, publicUrlFor } from '@/lib/r2-upload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Meta WhatsApp Cloud API send-time limits, matched here so the user
// gets a clear client-side error rather than a Meta-side rejection on
// the first send.
const ALLOWED = {
  IMAGE:    { types: ['image/jpeg', 'image/png'],                      max: 5 * 1024 * 1024 },
  VIDEO:    { types: ['video/mp4', 'video/3gpp'],                      max: 16 * 1024 * 1024 },
  DOCUMENT: { types: ['application/pdf'],                              max: 100 * 1024 * 1024 },
} as const

type Format = keyof typeof ALLOWED

function sanitizeName(name: string) {
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

    const buffer = Buffer.from(await file.arrayBuffer())
    const key = `wa-headers/${Date.now()}-${sanitizeName(file.name)}`
    await uploadToR2(buffer, key, file.type)

    // Construct the public URL using our own host so Meta fetches the
    // file via the /api/wa-media proxy route below. Avoids requiring a
    // public R2 bucket / custom domain.
    const origin =
      process.env.NEXTAUTH_URL ||
      (req.headers.get('host') ? `https://${req.headers.get('host')}` : '')
    const url = publicUrlFor(key, origin)

    return NextResponse.json({ url, key, size: file.size })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Upload failed'
    console.error('[WA_TEMPLATE_MEDIA_UPLOAD]', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
