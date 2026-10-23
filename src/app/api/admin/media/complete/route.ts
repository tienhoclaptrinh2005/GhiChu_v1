import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { SITE_SETTINGS_CACHE_TAG } from "@/features/site/queries";
import { getAdminUser } from "@/lib/auth";
import { isMediaFolder } from "@/lib/media/config";
import { createFinalObjectKey } from "@/lib/r2/presign";
import {
  UploadedObjectValidationError,
  deleteR2Object,
  promoteR2Object,
  updateR2ObjectCachePolicy,
  verifyUploadedObject,
} from "@/lib/r2/verify";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const completeSchema = z.object({ mediaId: z.uuid() });

async function activateAvatar(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  media: { id: string; object_key: string; mime_type: string },
  refreshCachePolicy = true,
) {
  if (refreshCachePolicy) {
    try {
      await updateR2ObjectCachePolicy({
        objectKey: media.object_key,
        mediaId: media.id,
        contentType: media.mime_type,
        visibility: "PUBLIC",
      });
    } catch {
      return new Error("Không thể bật cache công khai cho ảnh đại diện.");
    }
  }

  const { error: mediaError } = await supabase
    .from("media_files")
    .update({
      visibility: "PUBLIC",
      requested_visibility: "PUBLIC",
    })
    .eq("id", media.id)
    .eq("folder", "avatars")
    .eq("status", "READY");
  if (mediaError) return mediaError;

  const { error: settingsError } = await supabase
    .from("site_settings")
    .update({ avatar_media_id: media.id })
    .eq("id", 1);
  if (!settingsError) {
    revalidateTag(SITE_SETTINGS_CACHE_TAG, { expire: 0 });
    revalidatePath("/");
  }
  return settingsError;
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Bạn chưa đăng nhập với quyền Admin." }, { status: 401 });
  }

  const parsed = completeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Mã media không hợp lệ." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: media, error: readError } = await supabase
    .from("media_files")
    .select("*")
    .eq("id", parsed.data.mediaId)
    .eq("uploaded_by", admin.user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (readError || !media) {
    return NextResponse.json({ error: "Không tìm thấy phiên upload." }, { status: 404 });
  }
  if (media.status === "READY") {
    if (media.folder === "avatars") {
      const activationError = await activateAvatar(supabase, media);
      if (activationError) {
        return NextResponse.json(
          { error: "Ảnh đã upload nhưng chưa thể đặt làm ảnh đại diện. Hãy thử xác minh lại." },
          { status: 500 },
        );
      }
    }
    return NextResponse.json({ mediaId: media.id, status: media.status });
  }
  if (media.status !== "PENDING") {
    return NextResponse.json({ error: "Phiên upload không còn hiệu lực." }, { status: 409 });
  }
  if (!isMediaFolder(media.folder)) {
    return NextResponse.json({ error: "Nhóm media không hợp lệ." }, { status: 400 });
  }
  if (media.expires_at && new Date(media.expires_at).getTime() < Date.now()) {
    await deleteR2Object(media.object_key).catch(() => undefined);
    await supabase
      .from("media_files")
      .update({ status: "FAILED", failure_reason: "Phiên upload đã hết hạn.", expires_at: null })
      .eq("id", media.id);
    return NextResponse.json({ error: "Phiên upload đã hết hạn." }, { status: 410 });
  }

  const finalObjectKey = createFinalObjectKey({
    mediaId: media.id,
    folder: media.folder,
    contentType: media.mime_type,
  });

  try {
    const stagedObject = await verifyUploadedObject({
      mediaId: media.id,
      objectKey: media.object_key,
      folder: media.folder,
      expectedContentType: media.mime_type,
      expectedSizeBytes: media.size_bytes,
    });
    await promoteR2Object({
      sourceKey: media.object_key,
      destinationKey: finalObjectKey,
      mediaId: media.id,
      contentType: stagedObject.contentType,
      sourceEtag: stagedObject.etag,
      visibility: media.requested_visibility,
    });
    const verified = await verifyUploadedObject({
      mediaId: media.id,
      objectKey: finalObjectKey,
      folder: media.folder,
      expectedContentType: media.mime_type,
      expectedSizeBytes: media.size_bytes,
    });
    const { data: updatedMedia, error: updateError } = await supabase
      .from("media_files")
      .update({
        status: "READY",
        object_key: finalObjectKey,
        visibility: media.requested_visibility,
        mime_type: verified.contentType,
        size_bytes: verified.sizeBytes,
        width: verified.width,
        height: verified.height,
        verified_at: new Date().toISOString(),
        expires_at: null,
        failure_reason: null,
      })
      .eq("id", media.id)
      .eq("status", "PENDING")
      .select("id")
      .maybeSingle();

    if (updateError || !updatedMedia) {
      const { data: currentMedia } = await supabase
        .from("media_files")
        .select("status")
        .eq("id", media.id)
        .maybeSingle();
      if (currentMedia?.status === "READY") {
        await deleteR2Object(media.object_key).catch(() => undefined);
        return NextResponse.json({ mediaId: media.id, status: "READY" });
      }
      await deleteR2Object(finalObjectKey).catch(() => undefined);
      return NextResponse.json(
        { error: "Object đã hợp lệ nhưng chưa thể cập nhật trạng thái. Bạn có thể thử hoàn tất lại." },
        { status: 500 },
      );
    }

    await deleteR2Object(media.object_key).catch(() => undefined);

    if (media.folder === "avatars") {
      const activationError = await activateAvatar(
        supabase,
        {
          id: media.id,
          object_key: finalObjectKey,
          mime_type: verified.contentType,
        },
        false,
      );
      if (activationError) {
        return NextResponse.json(
          { error: "Ảnh đã upload nhưng chưa thể đặt làm ảnh đại diện. Hãy thử xác minh lại." },
          { status: 500 },
        );
      }
    }

    await supabase.from("audit_logs").insert({
      actor_id: admin.user.id,
      action: "MEDIA_UPLOAD_COMPLETED",
      entity_type: "media",
      entity_id: media.id,
      metadata: {
        folder: media.folder,
        mime_type: verified.contentType,
        size_bytes: verified.sizeBytes,
      },
    });

    return NextResponse.json({ mediaId: media.id, status: "READY" });
  } catch (error) {
    await deleteR2Object(finalObjectKey).catch(() => undefined);
    if (!(error instanceof UploadedObjectValidationError)) {
      return NextResponse.json(
        { error: "R2 tạm thời chưa thể xác minh file. Hãy thử lại." },
        { status: 502 },
      );
    }

    const message = error.message;
    await deleteR2Object(media.object_key).catch(() => undefined);
    await supabase
      .from("media_files")
      .update({ status: "FAILED", failure_reason: message, expires_at: null })
      .eq("id", media.id);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
