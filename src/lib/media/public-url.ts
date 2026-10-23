import "server-only";

const DEFAULT_PUBLIC_MEDIA_BASE_URL = "https://media.vmtshop.tech";

function publicMediaBaseUrl() {
  const configured = process.env.R2_PUBLIC_BASE_URL?.trim();
  return (configured || DEFAULT_PUBLIC_MEDIA_BASE_URL).replace(/\/+$/, "");
}

export function getPublicMediaUrl(objectKey: string) {
  const segments = objectKey.split("/");
  if (
    !objectKey ||
    objectKey.startsWith("/") ||
    objectKey.includes("\\") ||
    segments.some((segment) => !segment || segment === "." || segment === "..")
  ) {
    throw new Error("Object key của media không hợp lệ.");
  }

  const encodedKey = segments.map(encodeURIComponent).join("/");
  return `${publicMediaBaseUrl()}/${encodedKey}`;
}
