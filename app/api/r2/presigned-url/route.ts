import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

// Initialize S3 client for R2
const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export async function GET(request: Request) {
  try {
    // Verify credentials
    if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
      console.error("R2 credentials not configured");
      return NextResponse.json(
        { error: "Storage configuration missing" },
        { status: 500 }
      );
    }

    // Get the key from query params
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: "File key is required" },
        { status: 400 }
      );
    }

    // Create the command
    const command = new GetObjectCommand({
      Bucket: process.env.R2_EVENTS_BUCKET_NAME,
      Key: key,
    });

    // Generate signed URL (valid for 5 minutes)
    const signedUrl = await getSignedUrl(S3, command, { 
      expiresIn: 300,
    });

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate presigned URL",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 