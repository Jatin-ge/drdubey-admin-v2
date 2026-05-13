import { NextResponse } from 'next/server'
import { fetchFromR2 } from '@/lib/r2-upload'

// Public proxy for WhatsApp template header media stored in R2. The
// bucket itself stays private; this route is what Meta fetches when
// rendering a template preview or sending a message.
//
// Cache-Control headers below let Vercel's edge cache the response for
// a year after the first hit — Meta typically fetches each template
// image once, then caches it on their CDN, so the per-image function
// cost is effectively a single invocation.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: { key: string[] } },
) {
  const key = (params.key || []).map(decodeURIComponent).join('/')
  if (!key || key.includes('..')) {
    return new NextResponse('Bad request', { status: 400 })
  }

  const obj = await fetchFromR2(key)
  if (!obj) {
    return new NextResponse('Not found', { status: 404 })
  }

  return new NextResponse(obj.buffer, {
    status: 200,
    headers: {
      'Content-Type': obj.contentType,
      'Content-Length': String(obj.buffer.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
      // Mark the response as cacheable by Vercel's edge so subsequent
      // fetches for the same file are served from the edge cache and
      // don't re-invoke this function (Vercel docs: s-maxage).
      'CDN-Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
