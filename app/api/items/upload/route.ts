import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    let buffer: Buffer | null = null;
    let mimeType = "image/jpeg";
    let originalSize = 0;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      const rawImage = body.image || body.file || body.data;
      if (!rawImage || typeof rawImage !== "string") {
        return NextResponse.json(
          { success: false, error: { code: "NO_FILE", message: "No image payload provided" } },
          { status: 400 }
        );
      }

      if (rawImage.startsWith("data:")) {
        const matches = rawImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          buffer = Buffer.from(matches[2], "base64");
          originalSize = buffer.length;
        } else {
          return NextResponse.json(
            { success: false, error: { code: "INVALID_BASE64", message: "Invalid data URL format" } },
            { status: 400 }
          );
        }
      } else {
        buffer = Buffer.from(rawImage, "base64");
        originalSize = buffer.length;
      }
    } else {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: { code: "NO_FILE", message: "No file was uploaded" } },
          { status: 400 }
        );
      }

      mimeType = file.type || "image/jpeg";
      if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_FILE_TYPE",
              message: "Only JPG, PNG, and WebP images are supported",
            },
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: { code: "FILE_TOO_LARGE", message: "Image must be 10MB or smaller" } },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      originalSize = file.size;
    }

    if (!buffer || buffer.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "EMPTY_FILE", message: "Image file is empty" } },
        { status: 400 }
      );
    }

    const ext = mimeType.includes("png") ? ".png" : mimeType.includes("webp") ? ".webp" : ".jpg";
    const filename = `${randomUUID()}${ext}`;

    const isServerless = Boolean(
      process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.LAMBDA_TASK_ROOT ||
      process.env.VERCEL_ENV
    );

    let publicUrl = "";

    // In local non-serverless environments, try persisting to public/uploads
    if (!isServerless) {
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);
        publicUrl = `/uploads/${filename}`;
      } catch (writeErr) {
        console.warn("[UniTrace Upload] Filesystem write failed, falling back to data URL:", writeErr);
      }
    }

    // In serverless environments (or when filesystem is read-only), return Base64 data URL
    if (!publicUrl) {
      publicUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    }

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        filename,
        size: originalSize,
        mimeType,
      },
    });
  } catch (error: any) {
    console.error("[UniTrace Upload] Unexpected upload error:", error);
    return NextResponse.json(
      { success: false, error: { code: "UPLOAD_FAILED", message: error.message || "Failed to upload image" } },
      { status: 500 }
    );
  }
}
