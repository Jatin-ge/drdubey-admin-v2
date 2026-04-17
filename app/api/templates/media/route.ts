import { NextResponse } from "next/server";
import { whatsappApi } from "@/lib/whatsapp-api";

// New way to configure route options in Next.js 13+
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file || !type) {
      return NextResponse.json(
        { error: "File and type are required" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = {
      IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
      VIDEO: ['video/mp4', 'video/3gpp'],
      DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };

    const allowedTypesForCategory = allowedTypes[type as keyof typeof allowedTypes] || [];
    if (allowedTypesForCategory.length && !allowedTypesForCategory.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types for ${type}: ${allowedTypesForCategory.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size (10MB max for images, 16MB for videos, 100MB for documents)
    const maxSizes = {
      IMAGE: 10 * 1024 * 1024,
      VIDEO: 16 * 1024 * 1024,
      DOCUMENT: 100 * 1024 * 1024
    };

    const maxSize = maxSizes[type as keyof typeof maxSizes] || 16 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size for ${type}: ${Math.floor(maxSize / (1024 * 1024))}MB` },
        { status: 400 }
      );
    }

    const mediaId = await whatsappApi.uploadMedia(file, type);
    return NextResponse.json({ id: mediaId });
  } catch (error: any) {
    console.error("[MEDIA_UPLOAD]", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to upload media",
        details: error.response?.data || error
      },
      { status: error.response?.status || 500 }
    );
  }
} 