import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminUser } from "@/lib/auth";
import { deleteR2Object } from "@/lib/r2/verify";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Context) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Bạn chưa đăng nhập với quyền Admin." }, { status: 401 });
  }

  const result = z.uuid().safeParse((await params).id);
  if (!result.success) {
    return NextResponse.json({ error: "Mã media không hợp lệ." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: media } = await supabase
    .from("media_files")
    .select("id, object_key, status")
    .eq("id", result.data)
    .is("deleted_at", null)
    .maybeSingle();

  if (!media) {
    return NextResponse.json({ error: "Không tìm thấy media." }, { status: 404 });
  }

  const { data: referenceCount, error: referenceError } = await supabase.rpc(
    "media_reference_count",
    { p_media_id: media.id },
  );

  if (referenceError) {
    return NextResponse.json(
      { error: "Không thể kiểm tra nơi đang sử dụng media." },
      { status: 500 },
    );
  }
  if ((referenceCount ?? 0) > 0) {
    return NextResponse.json(
      { error: "Media đang được sử dụng. Hãy gỡ khỏi nội dung trước khi xóa." },
      { status: 409 },
    );
  }

  const deletedAt = new Date().toISOString();
  const { data: deletedMedia, error: updateError } = await supabase
    .from("media_files")
    .update({
      status: "DELETED",
      visibility: "PRIVATE",
      public_url: null,
      deleted_at: deletedAt,
      expires_at: null,
    })
    .eq("id", media.id)
    .eq("status", media.status)
    .select("id")
    .maybeSingle();

  if (updateError || !deletedMedia) {
    return NextResponse.json(
      { error: "Không thể khóa media để xóa." },
      { status: 500 },
    );
  }

  try {
    await deleteR2Object(media.object_key);
  } catch {
    await supabase
      .from("media_files")
      .update({
        status: "FAILED",
        visibility: "PRIVATE",
        public_url: null,
        expires_at: null,
        deleted_at: null,
        failure_reason: "R2 chưa xác nhận xóa object. Có thể thử xóa lại an toàn.",
      })
      .eq("id", media.id)
      .eq("status", "DELETED")
      .eq("deleted_at", deletedAt);
    return NextResponse.json(
      { error: "R2 chưa xác nhận xóa object. Media đã được khóa riêng tư và có thể thử xóa lại." },
      { status: 502 },
    );
  }

  await supabase.from("audit_logs").insert({
    actor_id: admin.user.id,
    action: "MEDIA_DELETED",
    entity_type: "media",
    entity_id: media.id,
    metadata: { previous_status: media.status },
  });

  return NextResponse.json({ ok: true });
}
