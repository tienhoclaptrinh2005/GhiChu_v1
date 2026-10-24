import { createHash, randomUUID } from "node:crypto";

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const VISITOR_COOKIE = "ghichu_viewer_id";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type Context = { params: Promise<{ id: string }> };

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest, { params }: Context) {
  const noteId = z.uuid().safeParse((await params).id);
  if (!noteId.success) return jsonError("Mã ghi chú không hợp lệ.", 400);

  const storedVisitorId = request.cookies.get(VISITOR_COOKIE)?.value;
  const parsedVisitorId = z.uuid().safeParse(storedVisitorId);
  const visitorId = parsedVisitorId.success ? parsedVisitorId.data : randomUUID();
  const visitorHash = createHash("sha256").update(visitorId).digest("hex");

  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase.rpc("register_note_view", {
      p_note_id: noteId.data,
      p_visitor_hash: visitorHash,
    });

    if (error?.code === "P0002") {
      return jsonError("Không tìm thấy ghi chú công khai.", 404);
    }
    if (error) {
      const status = error.code === "PGRST202" ? 503 : 500;
      return jsonError("Chưa thể cập nhật lượt xem.", status);
    }

    const viewCount = Number(data);
    if (!Number.isSafeInteger(viewCount) || viewCount < 0) {
      return jsonError("Dữ liệu lượt xem không hợp lệ.", 500);
    }

    const response = NextResponse.json(
      { viewCount },
      { headers: { "Cache-Control": "no-store" } },
    );

    if (!parsedVisitorId.success) {
      response.cookies.set(VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: VISITOR_COOKIE_MAX_AGE,
      });
    }

    return response;
  } catch {
    return jsonError("Dịch vụ lượt xem chưa sẵn sàng.", 503);
  }
}
