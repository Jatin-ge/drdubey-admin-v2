import { createUploadthing } from "uploadthing/next";
import type { FileRouter } from "uploadthing/types";

const f = createUploadthing();

export const ourFileRouter = {
  galleryImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(() => {}),
  blogImage1: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(() => {}),
  blogImage2: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(() => {}),
  // WhatsApp template header media — image (poster/photo), video clip
  // (OPD camp footage), or PDF (instructions, brochure). Stored at a
  // public UploadThing URL (utfs.io) so Meta can fetch it both at
  // template-creation time and at message-send time.
  // Size limits match Meta's WhatsApp Cloud API limits for sending.
  // Meta's WhatsApp Cloud API send-time limits map roughly to:
  //   IMAGE 5MB → UploadThing's nearest cap is 8MB
  //   VIDEO 16MB → 16MB
  //   PDF 100MB → 128MB (UT bucket size, we stay under Meta's limit)
  waTemplateMedia: f({
    image: { maxFileSize: "8MB",   maxFileCount: 1 },
    video: { maxFileSize: "16MB",  maxFileCount: 1 },
    pdf:   { maxFileSize: "128MB", maxFileCount: 1 },
  }).onUploadComplete(() => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
