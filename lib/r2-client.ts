import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const R2_CLIENT = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  }
});

export const r2Client = {
  async getFile(key: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key
      });

      const response = await R2_CLIENT.send(command);
      if (!response.Body) {
        throw new Error('No file content received from R2');
      }

      // Get the content type
      const contentType = response.ContentType;
      console.log('File content type:', contentType);

      // Convert stream to buffer
      const chunks = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      console.error('Error fetching file from R2:', error);
      throw error;
    }
  }
}; 