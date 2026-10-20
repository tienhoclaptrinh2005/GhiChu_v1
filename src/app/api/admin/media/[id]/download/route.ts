import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminUser } from "@/lib/auth";
import { createSignedDownloadUrl } from "@/lib/r2/presign";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
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
    .select("object_key")
    .eq("id", result.data)
    .eq("status", "READY")
    .is("deleted_at", null)
    .maybeSingle();

  if (!media) {
    return NextResponse.json({ error: "Không tìm thấy media." }, { status: 404 });
  }

  const downloadUrl = await createSignedDownloadUrl(media.object_key);
  return new NextResponse(null, {
    status: 302,
    headers: { Location: downloadUrl, "Cache-Control": "private, no-store" },
  });
}
