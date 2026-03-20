import { createUploadthing } from "uploadthing/next";
import type { FileRouter } from "uploadthing/types";

const f = createUploadthing();

export const ourFileRouter = {
  galleryImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(() => {}),
  blogImage1: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(() => {}),
  blogImage2: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(() => {})
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
