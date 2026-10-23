import { NextResponse } from "next/server";
import { z } from "zod";

import { getPublicMediaUrl } from "@/lib/media/public-url";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
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
    .eq("visibility", "PUBLIC")
    .is("deleted_at", null)
    .maybeSingle();

  if (!media) {
    return NextResponse.json({ error: "Không tìm thấy media công khai." }, { status: 404 });
  }

  const response = NextResponse.redirect(getPublicMediaUrl(media.object_key), 308);
  response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return response;
}
