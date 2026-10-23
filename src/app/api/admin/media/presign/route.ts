import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminUser } from "@/lib/auth";
import {
  MEDIA_FOLDERS,
  PDF_MIME_TYPE,
  WEBP_MIME_TYPE,
} from "@/lib/media/config";
import { createSignedUploadUrl, createStagingObjectKey } from "@/lib/r2/presign";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const uploadRequestSchema = z.object({
  originalName: z.string().trim().min(1).max(255),
  contentType: z.enum([WEBP_MIME_TYPE, PDF_MIME_TYPE]),
  sizeBytes: z.number().int().positive(),
  folder: z.enum(MEDIA_FOLDERS).default("notes"),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PRIVATE"),
  altText: z.string().trim().max(500).optional(),
});

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Bạn chưa đăng nhập với quyền Admin." }, { status: 401 });
  }

  const parsed = uploadRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu upload không hợp lệ." }, { status: 400 });
  }

  try {
    const requestedVisibility =
      parsed.data.folder === "avatars" ? "PUBLIC" : parsed.data.visibility;
    const mediaId = crypto.randomUUID();
    const objectKey = createStagingObjectKey({
      mediaId,
      folder: parsed.data.folder,
      contentType: parsed.data.contentType,
    });
    const signedUpload = await createSignedUploadUrl({
      mediaId,
      objectKey,
      folder: parsed.data.folder,
      contentType: parsed.data.contentType,
      sizeBytes: parsed.data.sizeBytes,
    });
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from("media_files").insert({
      id: mediaId,
      object_key: objectKey,
      original_name: parsed.data.originalName,
      mime_type: parsed.data.contentType,
      size_bytes: parsed.data.sizeBytes,
      alt_text: parsed.data.altText || null,
      folder: parsed.data.folder,
      status: "PENDING",
      visibility: "PRIVATE",
      requested_visibility: requestedVisibility,
      expires_at: new Date(Date.now() + signedUpload.expiresIn * 1000).toISOString(),
      uploaded_by: admin.user.id,
    });

    if (error) {
      return NextResponse.json(
        { error: "Không thể tạo phiên upload trong cơ sở dữ liệu." },
        { status: 500 },
      );
    }

    return NextResponse.json({ mediaId, objectKey, ...signedUpload });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tạo URL upload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
