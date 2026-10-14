import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { createObjectKey, createSignedUploadUrl } from "@/lib/r2/presign";

const uploadRequestSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  contentType: z.string().trim().min(3).max(100),
  sizeBytes: z.number().int().positive(),
  folder: z.enum(["avatars", "banners", "notes", "attachments"]).default("notes"),
});

export async function POST(request: Request) {
  await requireAdmin();

  const parsed = uploadRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu upload không hợp lệ." }, { status: 400 });
  }

  try {
    const objectKey = createObjectKey(parsed.data.fileName, parsed.data.folder);
    const uploadUrl = await createSignedUploadUrl({
      objectKey,
      contentType: parsed.data.contentType,
      sizeBytes: parsed.data.sizeBytes,
    });
    return NextResponse.json({ objectKey, uploadUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tạo URL upload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
