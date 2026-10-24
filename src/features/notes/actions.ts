"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { noteFormSchema } from "@/features/notes/schema";
import { requireAdmin } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { estimateReadingTime } from "@/lib/utils";
import type { Json } from "@/types/database";

export type NoteActionState = {
  status: "idle" | "success" | "error";
  message: string;
  revision: number;
  noteId?: string;
  fieldErrors?: Record<string, string[]>;
};

function formText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function parseContent(formData: FormData): Record<string, unknown> | null {
  const serialized = formText(formData, "content");
  if (!serialized || serialized.length > 300_000) return null;

  try {
    const parsed: unknown = JSON.parse(serialized);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function extractPlainText(value: unknown): string {
  const parts: string[] = [];

  function visit(node: unknown) {
    if (!node || typeof node !== "object" || Array.isArray(node)) return;
    const record = node as Record<string, unknown>;
    if (record.type === "text" && typeof record.text === "string") {
      parts.push(record.text);
      return;
    }

    if (Array.isArray(record.content)) {
      for (const child of record.content) visit(child);
    }

    if (
      record.type === "paragraph" ||
      record.type === "heading" ||
      record.type === "listItem" ||
      record.type === "blockquote" ||
      record.type === "codeBlock"
    ) {
      parts.push("\n");
    }
  }

  visit(value);
  return parts.join("").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function noteInputFromForm(formData: FormData) {
  const content = parseContent(formData);
  return noteFormSchema.safeParse({
    title: formText(formData, "title"),
    slug: formText(formData, "slug"),
    excerpt: formText(formData, "excerpt"),
    status: formText(formData, "status"),
    isPinned: formData.get("isPinned") === "on",
    parentId: formText(formData, "parentId") || null,
    categoryIds: [...new Set(formData.getAll("categoryIds").map(String))],
    content: content ?? {},
    changeSummary: formText(formData, "changeSummary"),
    seoTitle: formText(formData, "seoTitle") || null,
    seoDescription: formText(formData, "seoDescription") || null,
  });
}

function errorState(message: string, fieldErrors?: Record<string, string[]>): NoteActionState {
  return {
    status: "error",
    message,
    revision: Date.now(),
    fieldErrors,
  };
}

function databaseErrorState(error: { code?: string | null }): NoteActionState {
  if (error.code === "23505") {
    return errorState("Đường dẫn này đã được ghi chú khác sử dụng.", {
      slug: ["Hãy chọn một đường dẫn khác."],
    });
  }
  if (error.code === "23503" || error.code === "23514") {
    return errorState("Danh mục hoặc ghi chú cha không còn hợp lệ. Hãy chọn lại.");
  }
  if (error.code === "P0002") {
    return errorState("Không tìm thấy ghi chú cần cập nhật.");
  }
  return errorState("Không thể lưu ghi chú vào database. Hãy thử lại.");
}

function refreshNoteViews(noteId: string, slug?: string | null) {
  updateTag("published-notes");
  updateTag("categories");
  revalidatePath("/");
  revalidatePath("/notes");
  revalidatePath("/categories");
  revalidatePath("/search");
  revalidatePath("/admin");
  revalidatePath("/admin/notes");
  revalidatePath(`/admin/notes/${noteId}/edit`);
  revalidatePath(`/admin/notes/${noteId}/history`);
  if (slug) revalidatePath(`/notes/${slug}`);
}

async function saveNote(noteId: string | null, formData: FormData): Promise<NoteActionState> {
  await requireAdmin();
  const parsed = noteInputFromForm(formData);

  if (!parsed.success) {
    return errorState(
      parsed.error.issues[0]?.message ?? "Thông tin ghi chú chưa hợp lệ.",
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const plainText = extractPlainText(parsed.data.content);
  if (!plainText) {
    return errorState("Nội dung ghi chú không được để trống.", {
      content: ["Hãy nhập ít nhất một đoạn nội dung."],
    });
  }

  if (plainText.length > 100_000) {
    return errorState("Nội dung ghi chú quá dài. Giới hạn hiện tại là 100.000 ký tự.", {
      content: ["Hãy rút gọn nội dung hoặc chia thành nhiều ghi chú."],
    });
  }

  const supabase = await createServerSupabaseClient();
  let previousSlug: string | null = null;

  if (noteId) {
    const noteIdResult = z.uuid().safeParse(noteId);
    if (!noteIdResult.success) return errorState("Mã ghi chú không hợp lệ.");

    const { data: existing, error: existingError } = await supabase
      .from("notes")
      .select("id, slug")
      .eq("id", noteIdResult.data)
      .is("deleted_at", null)
      .maybeSingle();

    if (existingError || !existing) return errorState("Không tìm thấy ghi chú cần cập nhật.");
    previousSlug = existing.slug;
  }

  const { data, error } = await supabase.rpc("save_note", {
    p_note_id: noteId,
    p_title: parsed.data.title,
    p_slug: parsed.data.slug,
    p_excerpt: parsed.data.excerpt,
    p_status: parsed.data.status,
    p_is_pinned: parsed.data.isPinned,
    p_parent_id: parsed.data.parentId,
    p_category_ids: parsed.data.categoryIds,
    p_content: parsed.data.content as Json,
    p_plain_text: plainText,
    p_change_summary: parsed.data.changeSummary,
    p_seo_title: parsed.data.seoTitle,
    p_seo_description: parsed.data.seoDescription,
    p_reading_time_minutes: estimateReadingTime(plainText),
  });

  if (error || !data) return databaseErrorState(error ?? {});
  const saved = Array.isArray(data) ? data[0] : data;
  if (!saved) return errorState("Database không trả về ghi chú vừa lưu.");

  refreshNoteViews(saved.id, saved.slug);
  if (previousSlug && previousSlug !== saved.slug) revalidatePath(`/notes/${previousSlug}`);

  return {
    status: "success",
    message: noteId
      ? `Đã lưu phiên bản mới và cập nhật trạng thái ${saved.status}.`
      : "Đã tạo ghi chú và phiên bản đầu tiên.",
    revision: Date.now(),
    noteId: saved.id,
  };
}

export async function createNoteAction(
  _previousState: NoteActionState,
  formData: FormData,
) {
  return saveNote(null, formData);
}

export async function updateNoteAction(
  noteId: string,
  _previousState: NoteActionState,
  formData: FormData,
) {
  return saveNote(noteId, formData);
}

export async function deleteNoteAction(noteId: string): Promise<NoteActionState> {
  await requireAdmin();
  const parsedId = z.uuid().safeParse(noteId);
  if (!parsedId.success) return errorState("Mã ghi chú không hợp lệ.");

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("soft_delete_note", {
    p_note_id: parsedId.data,
  });
  if (error || !data) return databaseErrorState(error ?? {});
  const deleted = Array.isArray(data) ? data[0] : data;
  if (!deleted) return errorState("Database không trả về ghi chú vừa xóa.");

  refreshNoteViews(deleted.id, deleted.slug);
  return {
    status: "success",
    message: "Đã chuyển ghi chú vào thùng rác. Lịch sử phiên bản vẫn được giữ lại.",
    revision: Date.now(),
    noteId: deleted.id,
  };
}

export async function restoreNoteAction(noteId: string): Promise<NoteActionState> {
  await requireAdmin();
  const parsedId = z.uuid().safeParse(noteId);
  if (!parsedId.success) return errorState("Mã ghi chú không hợp lệ.");

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("restore_note", {
    p_note_id: parsedId.data,
  });
  if (error || !data) return databaseErrorState(error ?? {});
  const restored = Array.isArray(data) ? data[0] : data;
  if (!restored) return errorState("Database không trả về ghi chú vừa khôi phục.");

  refreshNoteViews(restored.id, restored.slug);
  return {
    status: "success",
    message: "Đã khôi phục ghi chú về trạng thái Bản nháp.",
    revision: Date.now(),
    noteId: restored.id,
  };
}
