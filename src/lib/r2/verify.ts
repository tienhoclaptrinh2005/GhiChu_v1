import "server-only";

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

import { getR2Env } from "@/lib/env";
import {
  PDF_MIME_TYPE,
  WEBP_MIME_TYPE,
  getUploadLimitBytes,
  mediaProfiles,
  type MediaFolder,
} from "@/lib/media/config";
import { isPdf, isWebp, readWebpDimensions } from "@/lib/media/webp";
import { getR2Client } from "@/lib/r2/client";

export type VerifiedObject = {
  contentType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  etag: string | null;
};

export class UploadedObjectValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadedObjectValidationError";
  }
}

function invalid(message: string): never {
  throw new UploadedObjectValidationError(message);
}

function normalizeContentType(value?: string) {
  return value?.split(";", 1)[0].trim().toLowerCase() ?? "";
}

export async function verifyUploadedObject(input: {
  mediaId: string;
  objectKey: string;
  folder: MediaFolder;
  expectedContentType: string;
  expectedSizeBytes: number;
}): Promise<VerifiedObject> {
  const env = getR2Env();
  const client = getR2Client();
  const profile = mediaProfiles[input.folder];
  const maxBytes = getUploadLimitBytes(input.folder, env.UPLOAD_MAX_FILE_SIZE_MB);
  const head = await client.send(
    new HeadObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: input.objectKey }),
  );
  const sizeBytes = head.ContentLength ?? 0;
  const contentType = normalizeContentType(head.ContentType);

  if (head.Metadata?.["media-id"] !== input.mediaId) {
    invalid("Metadata của object không khớp phiên upload.");
  }
  if (contentType !== input.expectedContentType) {
    invalid("MIME type trên R2 không khớp yêu cầu upload.");
  }
  if (sizeBytes !== input.expectedSizeBytes) {
    invalid("Dung lượng object không khớp file đã khai báo.");
  }
  if (sizeBytes <= 0 || sizeBytes > maxBytes) {
    invalid("Object vượt giới hạn dung lượng cho phép.");
  }

  const object = await client.send(
    new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: input.objectKey,
      Range: "bytes=0-63",
    }),
  );
  const bytes = object.Body ? await object.Body.transformToByteArray() : new Uint8Array();

  if (contentType === PDF_MIME_TYPE) {
    if (!profile.acceptsPdf || !isPdf(bytes)) {
      invalid("Nội dung object không phải PDF hợp lệ.");
    }
    return { contentType, sizeBytes, width: null, height: null, etag: head.ETag ?? null };
  }

  if (contentType !== WEBP_MIME_TYPE || !isWebp(bytes)) {
    invalid("Nội dung ảnh không phải WebP hợp lệ.");
  }

  const { width, height } = readWebpDimensions(bytes);
  if (width > profile.maxWidth || height > profile.maxHeight) {
    invalid(
      `Ảnh vượt kích thước ${profile.maxWidth}×${profile.maxHeight}px của mục này.`,
    );
  }

  return { contentType, sizeBytes, width, height, etag: head.ETag ?? null };
}

export async function deleteR2Object(objectKey: string) {
  const env = getR2Env();
  await getR2Client().send(
    new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: objectKey }),
  );
}

export async function promoteR2Object(input: {
  sourceKey: string;
  destinationKey: string;
  mediaId: string;
  contentType: string;
  sourceEtag: string | null;
}) {
  const env = getR2Env();
  await getR2Client().send(
    new CopyObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      CopySource: `${env.R2_BUCKET_NAME}/${input.sourceKey}`,
      CopySourceIfMatch: input.sourceEtag ?? undefined,
      Key: input.destinationKey,
      MetadataDirective: "REPLACE",
      Metadata: { "media-id": input.mediaId },
      ContentType: input.contentType,
      CacheControl: "private, max-age=0, no-store",
    }),
  );
}
