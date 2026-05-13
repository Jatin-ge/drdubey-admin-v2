import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 client. Uses the same env vars as the existing
// /api/r2/presigned-url route so we don't duplicate config.
//
// We use R2 for WhatsApp template header media because:
// 1. Creds + bucket are already configured on Vercel — zero setup cost
// 2. Free tier: 10 GB storage, 10M Class A ops, UNLIMITED egress
//    (vs. UploadThing 2 GB / Vercel Blob 1 GB)
// 3. Files served via a thin /api/wa-media proxy (next route), so we
//    don't need the R2 bucket to be public — keeps it simple and lets
//    Vercel's edge cache the response after the first fetch.

const BUCKET = process.env.R2_EVENTS_BUCKET_NAME || 'drdubey-events-media'

let _client: S3Client | null = null
function client(): S3Client {
  if (_client) return _client
  _client = new S3Client({
    region: 'auto',
    endpoint:
      process.env.R2_ENDPOINT ||
      `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
  })
  return _client
}

export interface UploadedR2Object {
  key: string
  contentType: string
  size: number
}

export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string,
): Promise<UploadedR2Object> {
  await client().send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    // Long cache — once the file lives in R2 it's content-addressed by
    // its timestamp-prefixed key, so it never needs revalidation.
    CacheControl: 'public, max-age=31536000, immutable',
  }))
  return { key, contentType, size: buffer.length }
}

export async function fetchFromR2(
  key: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const res = await client().send(new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }))
    if (!res.Body) return null
    const chunks: Buffer[] = []
    for await (const chunk of res.Body as AsyncIterable<Buffer>) {
      chunks.push(chunk)
    }
    return {
      buffer: Buffer.concat(chunks),
      contentType: res.ContentType || 'application/octet-stream',
    }
  } catch (e) {
    console.error('[r2 fetch]', key, e instanceof Error ? e.message : e)
    return null
  }
}

// Build the public URL we hand back to the form (and that Meta will
// fetch at template-creation + message-send time). Uses the admin host
// so we don't have to manage a public R2 bucket.
export function publicUrlFor(key: string, originHost: string): string {
  const host = originHost.replace(/\/$/, '')
  // Each segment encoded so spaces / unicode in filenames don't break.
  const encodedKey = key.split('/').map(encodeURIComponent).join('/')
  return `${host}/api/wa-media/${encodedKey}`
}
