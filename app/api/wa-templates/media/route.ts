import { NextResponse } from "next/server";
import { whatsappApi } from "@/lib/whatsapp-api";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ALLOWED = {
  IMAGE: { types: ['image/jpeg', 'image/png'], max: 5 * 1024 * 1024 },
  VIDEO: { types: ['video/mp4', 'video/3gpp'], max: 16 * 1024 * 1024 },
  DOCUMENT: {
    types: ['application/pdf'],
    max: 100 * 1024 * 1024,
  },
} as const;

type HeaderFormat = keyof typeof ALLOWED;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const format = formData.get('format') as string | null;

    if (!file || !format) {
      return NextResponse.json(
        { error: 'file and format (IMAGE | VIDEO | DOCUMENT) are required' },
        { status: 400 }
      );
    }

    const rules = ALLOWED[format as HeaderFormat];
    if (!rules) {
      return NextResponse.json(
        { error: `Unsupported format: ${format}` },
        { status: 400 }
      );
    }

    if (!rules.types.includes(file.type as never)) {
      return NextResponse.json(
        {
          error:
            `Invalid file type for ${format}. ` +
            `Allowed: ${rules.types.join(', ')}. Got: ${file.type || 'unknown'}`,
        },
        { status: 400 }
      );
    }

    if (file.size > rules.max) {
      return NextResponse.json(
        {
          error:
            `File too large. Max for ${format}: ` +
            `${Math.round(rules.max / (1024 * 1024))} MB`,
        },
        { status: 400 }
      );
    }

    const handle = await whatsappApi.uploadResumable(file, file.type);
    return NextResponse.json({ handle });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    console.error('[WA_TEMPLATE_MEDIA_UPLOAD]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
