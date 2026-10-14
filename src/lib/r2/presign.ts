import "server-only";

import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { getR2Env } from "@/lib/env";
import { getR2Client } from "@/lib/r2/client";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "application/pdf",
]);

export function createObjectKey(originalName: string, folder = "uploads") {
  const extension = originalName.split(".").pop()?.toLowerCase() || "bin";
  const safeFolder = folder.replace(/[^a-z0-9/-]/gi, "-");
  return `${safeFolder}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
}

export async function createSignedUploadUrl(input: {
  objectKey: string;
  contentType: string;
  sizeBytes: number;
}) {
  const env = getR2Env();
  const maxBytes = env.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024;

  if (!allowedMimeTypes.has(input.contentType)) {
    throw new Error("Định dạng file không được hỗ trợ.");
  }
  if (input.sizeBytes <= 0 || input.sizeBytes > maxBytes) {
    throw new Error(`File vượt giới hạn ${env.UPLOAD_MAX_FILE_SIZE_MB} MB.`);
  }

  return getSignedUrl(
    getR2Client(),
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: input.objectKey,
      ContentType: input.contentType,
      ContentLength: input.sizeBytes,
    }),
    { expiresIn: env.R2_SIGNED_URL_TTL_SECONDS },
  );
}

export async function createSignedDownloadUrl(objectKey: string) {
  const env = getR2Env();
  return getSignedUrl(
    getR2Client(),
    new GetObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: objectKey }),
    { expiresIn: env.R2_SIGNED_URL_TTL_SECONDS },
  );
}
