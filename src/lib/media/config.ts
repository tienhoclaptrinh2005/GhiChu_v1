export const MEDIA_FOLDERS = ["avatars", "banners", "notes", "attachments"] as const;

export type MediaFolder = (typeof MEDIA_FOLDERS)[number];
export type MediaVisibility = "PUBLIC" | "PRIVATE";

export const SOURCE_IMAGE_MAX_BYTES = 25 * 1024 * 1024;

export const SUPPORTED_SOURCE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const WEBP_MIME_TYPE = "image/webp";
export const PDF_MIME_TYPE = "application/pdf";
export const PUBLIC_MEDIA_CACHE_CONTROL = "public, max-age=31536000, immutable";
export const PRIVATE_MEDIA_CACHE_CONTROL = "private, max-age=0, no-store";

export function getReadyMediaCacheControl(visibility: MediaVisibility) {
  return visibility === "PUBLIC"
    ? PUBLIC_MEDIA_CACHE_CONTROL
    : PRIVATE_MEDIA_CACHE_CONTROL;
}

export const mediaProfiles: Record<
  MediaFolder,
  {
    label: string;
    maxBytes: number;
    maxWidth: number;
    maxHeight: number;
    webpQuality: number;
    acceptsPdf: boolean;
  }
> = {
  avatars: {
    label: "Ảnh đại diện",
    maxBytes: 1024 * 1024,
    maxWidth: 512,
    maxHeight: 512,
    webpQuality: 0.82,
    acceptsPdf: false,
  },
  banners: {
    label: "Ảnh bìa / banner",
    maxBytes: 5 * 1024 * 1024,
    maxWidth: 2560,
    maxHeight: 1440,
    webpQuality: 0.82,
    acceptsPdf: false,
  },
  notes: {
    label: "Ảnh trong ghi chú",
    maxBytes: 5 * 1024 * 1024,
    maxWidth: 2560,
    maxHeight: 2560,
    webpQuality: 0.82,
    acceptsPdf: false,
  },
  attachments: {
    label: "Tệp đính kèm",
    maxBytes: 10 * 1024 * 1024,
    maxWidth: 2560,
    maxHeight: 2560,
    webpQuality: 0.82,
    acceptsPdf: true,
  },
};

export function isMediaFolder(value: string): value is MediaFolder {
  return MEDIA_FOLDERS.includes(value as MediaFolder);
}

export function isSupportedSourceImageType(type: string) {
  return SUPPORTED_SOURCE_IMAGE_TYPES.includes(
    type as (typeof SUPPORTED_SOURCE_IMAGE_TYPES)[number],
  );
}

export function getUploadLimitBytes(folder: MediaFolder, globalMaxMb?: number) {
  const profileLimit = mediaProfiles[folder].maxBytes;
  if (!globalMaxMb) return profileLimit;
  return Math.min(profileLimit, globalMaxMb * 1024 * 1024);
}
