"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { categoryFormSchema } from "@/features/categories/schema";
import { requireAdmin } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type CategoryActionState = {
  status: "idle" | "success" | "error";
  message: string;
  revision: number;
  categoryId?: string;
  fieldErrors?: Record<string, string[]>;
};

function formText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function errorState(
  message: string,
  fieldErrors?: Record<string, string[]>,
): CategoryActionState {
  return {
    status: "error",
    message,
    revision: Date.now(),
    fieldErrors,
  };
}

function refreshCategoryViews() {
  updateTag("categories");
  updateTag("published-notes");
  revalidatePath("/");
  revalidatePath("/notes");
  revalidatePath("/categories");
  revalidatePath("/categories/[slug]", "page");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/notes");
}

function databaseErrorState(error: { code?: string | null }): CategoryActionState {
  if (error.code === "23505") {
    return errorState("Đường dẫn này đã được danh mục khác sử dụng.", {
      slug: ["Hãy chọn một đường dẫn khác."],
    });
  }
  if (error.code === "23503") {
    return errorState("Danh mục cha không còn tồn tại. Hãy chọn lại.", {
      parentId: ["Danh mục cha không hợp lệ."],
    });
  }
  if (error.code === "23514") {
    return errorState("Không thể chọn danh mục con làm danh mục cha vì sẽ tạo vòng lặp.", {
      parentId: ["Hãy chọn một danh mục cha khác."],
    });
  }
  if (error.code === "P0002") return errorState("Không tìm thấy danh mục này.");
  return errorState("Không thể lưu danh mục vào database. Hãy thử lại.");
}

export async function saveCategoryAction(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdmin();
  const parsed = categoryFormSchema.safeParse({
    categoryId: formText(formData, "categoryId") || null,
    name: formText(formData, "name"),
    slug: formText(formData, "slug"),
    description: formText(formData, "description"),
    color: formText(formData, "color"),
    parentId: formText(formData, "parentId") || null,
    position: formText(formData, "position"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return errorState(
      parsed.error.issues[0]?.message ?? "Thông tin danh mục chưa hợp lệ.",
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("save_category", {
    p_category_id: parsed.data.categoryId,
    p_name: parsed.data.name,
    p_slug: parsed.data.slug,
    p_description: parsed.data.description,
    p_color: parsed.data.color,
    p_parent_id: parsed.data.parentId,
    p_position: parsed.data.position,
    p_is_active: parsed.data.isActive,
  });

  if (error || !data) return databaseErrorState(error ?? {});
  const saved = Array.isArray(data) ? data[0] : data;
  if (!saved) return errorState("Database không trả về danh mục vừa lưu.");

  refreshCategoryViews();
  return {
    status: "success",
    message: parsed.data.categoryId ? "Đã cập nhật danh mục." : "Đã tạo danh mục mới.",
    revision: Date.now(),
    categoryId: saved.id,
  };
}

export async function deleteCategoryAction(categoryId: string): Promise<CategoryActionState> {
  await requireAdmin();
  const parsedId = z.uuid().safeParse(categoryId);
  if (!parsedId.success) return errorState("Mã danh mục không hợp lệ.");

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("delete_category", {
    p_category_id: parsedId.data,
  });
  if (error || !data) return databaseErrorState(error ?? {});

  refreshCategoryViews();
  return {
    status: "success",
    message: "Đã xóa danh mục. Nội dung ghi chú không bị xóa.",
    revision: Date.now(),
  };
}
