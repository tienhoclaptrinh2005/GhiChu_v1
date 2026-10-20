import {
  PDF_MIME_TYPE,
  SOURCE_IMAGE_MAX_BYTES,
  WEBP_MIME_TYPE,
  isSupportedSourceImageType,
  mediaProfiles,
  type MediaFolder,
} from "@/lib/media/config";

export type PreparedMediaFile = {
  file: File;
  originalBytes: number;
  outputBytes: number;
  width: number | null;
  height: number | null;
  converted: boolean;
  quality: number | null;
};

function webpFileName(originalName: string) {
  const baseName = originalName.replace(/\.[^.]+$/, "").trim() || "image";
  return `${baseName}.webp`;
}

export async function prepareMediaFile(
  source: File,
  folder: MediaFolder,
): Promise<PreparedMediaFile> {
  const profile = mediaProfiles[folder];

  if (source.type === PDF_MIME_TYPE) {
    if (!profile.acceptsPdf) {
      throw new Error("PDF chỉ được phép trong mục tệp đính kèm.");
    }
    if (source.size > profile.maxBytes) {
      throw new Error(`PDF vượt giới hạn ${profile.maxBytes / 1024 / 1024} MB.`);
    }
    return {
      file: source,
      originalBytes: source.size,
      outputBytes: source.size,
      width: null,
      height: null,
      converted: false,
      quality: null,
    };
  }

  if (!isSupportedSourceImageType(source.type)) {
    throw new Error("Chỉ hỗ trợ ảnh JPEG, PNG, WebP hoặc AVIF.");
  }
  if (source.size > SOURCE_IMAGE_MAX_BYTES) {
    throw new Error("Ảnh nguồn vượt giới hạn xử lý 25 MB.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(source, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Trình duyệt không thể đọc ảnh này. Hãy thử JPEG, PNG hoặc WebP.");
  }

  try {
    if (bitmap.width * bitmap.height > 120_000_000) {
      throw new Error("Ảnh nguồn có quá nhiều pixel để xử lý an toàn.");
    }
    const scale = Math.min(
      1,
      profile.maxWidth / bitmap.width,
      profile.maxHeight / bitmap.height,
    );
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new Error("Không thể khởi tạo bộ xử lý ảnh.");

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, width, height);

    const encode = (quality: number) =>
      new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (!result || result.type !== WEBP_MIME_TYPE) {
              reject(new Error("Trình duyệt không hỗ trợ xuất ảnh WebP."));
              return;
            }
            resolve(result);
          },
          WEBP_MIME_TYPE,
          quality,
        );
      });

    const minimumQuality = 0.5;
    const targetBytes = Math.min(profile.maxBytes, source.size);
    let quality = profile.webpQuality;
    let blob = await encode(quality);

    while (blob.size > targetBytes && quality > minimumQuality) {
      quality = Math.max(minimumQuality, Number((quality - 0.08).toFixed(2)));
      blob = await encode(quality);
    }

    if (blob.size > profile.maxBytes) {
      throw new Error(
        `Ảnh WebP vẫn vượt giới hạn ${profile.maxBytes / 1024 / 1024} MB. Hãy chọn ảnh nhỏ hơn.`,
      );
    }

    return {
      file: new File([blob], webpFileName(source.name), {
        type: WEBP_MIME_TYPE,
        lastModified: Date.now(),
      }),
      originalBytes: source.size,
      outputBytes: blob.size,
      width,
      height,
      converted: true,
      quality,
    };
  } finally {
    bitmap.close();
  }
}
