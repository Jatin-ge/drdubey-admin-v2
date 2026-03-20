"use client";

import { FileIcon, X } from "lucide-react";
import Image from "next/image";

import { UploadDropzone } from "@/lib/uploadthing";

import "@uploadthing/react/styles.css";
import toast from "react-hot-toast";

interface FileUploadProps {
  onChange: (url?: string) => void;
  value: string;
  endpoint: "galleryImage" | "blogImage1" | "blogImage2"
}

export const FileUpload = ({
  onChange,
  value,
  endpoint
}: FileUploadProps) => {
  const fileType = value?.split(".").pop();

  if (value && fileType !== "pdf") {
    return (
      <div className="relative h-20 w-40">
        <Image
          fill
          src={value}
          alt="Upload"
          className="rounded-md"
        />
        <button 
        className="bg-rose-500  text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
        type="button"
        onClick={() => onChange("")}>
            <X className="h-4 w-4"/>
        </button>
      </div>
    )
  }

  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        toast.success("Image Uploaded Successfully")
        onChange(res?.[0].url);
      }}
      onUploadError={(error: Error) => {
        toast.error("Image Upload failed")
        console.log(error);
      }}
    />
  )
}