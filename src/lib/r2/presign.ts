import "server-only";

import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { getR2Env } from "@/lib/env";
import {
  PDF_MIME_TYPE,
  PRIVATE_MEDIA_CACHE_CONTROL,
  WEBP_MIME_TYPE,
  getUploadLimitBytes,
  mediaProfiles,
  type MediaFolder,
} from "@/lib/media/config";
import { getR2Client } from "@/lib/r2/client";

function objectExtension(contentType: string) {
  return contentType === PDF_MIME_TYPE ? "pdf" : "webp";
}

export function createStagingObjectKey(input: {
  mediaId: string;
  folder: MediaFolder;
  contentType: string;
}) {
  return `${input.folder}/pending/${new Date().toISOString().slice(0, 10)}/${input.mediaId}.${objectExtension(input.contentType)}`;
}

export function createFinalObjectKey(input: {
  mediaId: string;
  folder: MediaFolder;
  contentType: string;
}) {
  return `${input.folder}/ready/${new Date().toISOString().slice(0, 10)}/${input.mediaId}.${objectExtension(input.contentType)}`;
}

export async function createSignedUploadUrl(input: {
  mediaId: string;
  objectKey: string;
  folder: MediaFolder;
  contentType: string;
  sizeBytes: number;
}) {
  const env = getR2Env();
  const profile = mediaProfiles[input.folder];
  const maxBytes = getUploadLimitBytes(input.folder, env.UPLOAD_MAX_FILE_SIZE_MB);
  const isAllowedImage = input.contentType === WEBP_MIME_TYPE;
  const isAllowedPdf = input.contentType === PDF_MIME_TYPE && profile.acceptsPdf;

  if (!isAllowedImage && !isAllowedPdf) {
    throw new Error("Ảnh phải được chuyển sang WebP trước khi upload.");
  }
  if (input.sizeBytes <= 0 || input.sizeBytes > maxBytes) {
    throw new Error(`File vượt giới hạn ${Math.floor(maxBytes / 1024 / 1024)} MB của mục này.`);
  }

  const cacheControl = PRIVATE_MEDIA_CACHE_CONTROL;
  const uploadUrl = await getSignedUrl(
    getR2Client(),
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: input.objectKey,
      ContentType: input.contentType,
      ContentLength: input.sizeBytes,
      CacheControl: cacheControl,
      Metadata: { "media-id": input.mediaId },
    }),
    {
      expiresIn: env.R2_SIGNED_URL_TTL_SECONDS,
      signableHeaders: new Set(["content-type", "cache-control"]),
      unhoistableHeaders: new Set(["x-amz-meta-media-id"]),
    },
  );

  return {
    uploadUrl,
    expiresIn: env.R2_SIGNED_URL_TTL_SECONDS,
    requiredHeaders: {
      "Content-Type": input.contentType,
      "Cache-Control": cacheControl,
      "x-amz-meta-media-id": input.mediaId,
    },
  };
}

export async function createSignedDownloadUrl(objectKey: string) {
  const env = getR2Env();
  return getSignedUrl(
    getR2Client(),
    new GetObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: objectKey }),
    { expiresIn: env.R2_SIGNED_URL_TTL_SECONDS },
  );
}
