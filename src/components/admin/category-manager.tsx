"use client";

import {
  Check,
  FolderPlus,
  FolderTree,
  Loader2,
  Pencil,
  Save,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  type CategoryActionState,
  deleteCategoryAction,
  saveCategoryAction,
} from "@/features/categories/actions";
import { cn, slugify } from "@/lib/utils";
import type { AdminCategoryItem } from "@/types/domain";

const initialActionState: CategoryActionState = {
  status: "idle",
  message: "",
  revision: 0,
};

const selectClassName =
  "mt-2 h-12 w-full rounded-sm border-[3px] border-line bg-surface px-3 text-sm font-semibold text-ink shadow-[3px_3px_0_var(--ds-shadow)] outline-none transition-[transform,box-shadow] duration-150 focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[5px_5px_0_var(--ds-shadow)]";

const textareaClassName =
  "mt-2 w-full resize-y rounded-sm border-[3px] border-line bg-surface px-3.5 py-3 text-sm leading-6 text-ink shadow-[3px_3px_0_var(--ds-shadow)] outline-none transition-[transform,box-shadow] duration-150 focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[5px_5px_0_var(--ds-shadow)]";

function FieldError({ state, name }: { state: CategoryActionState; name: string }) {
  const message = state.fieldErrors?.[name]?.[0];
  return message ? (
    <span id={`${name}-error`} className="mt-1.5 block text-xs font-semibold text-danger">
      {message}
    </span>
  ) : null;
}

function CategoryForm({
  category,
  categories,
  onDeleted,
}: {
  category: AdminCategoryItem | null;
  categories: AdminCategoryItem[];
  onDeleted: () => void;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const handledRevisionRef = useRef(0);
  const [state, formAction, pending] = useActionState(
    saveCategoryAction,
    initialActionState,
  );
  const [deleting, startDeleting] = useTransition();
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(category));
  const [color, setColor] = useState(category?.color ?? "#349B42");

  useEffect(() => {
    if (
      !state.revision ||
      !state.message ||
      handledRevisionRef.current === state.revision
    ) {
      return;
    }
    handledRevisionRef.current = state.revision;
    if (state.status === "success") {
      toast.success(state.message);
      router.refresh();
      if (!category) {
        requestAnimationFrame(() => {
          formRef.current?.reset();
          setName("");
          setSlug("");
          setSlugEdited(false);
          setColor("#349B42");
        });
      }
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [category, router, state.message, state.revision, state.status]);

  function handleDelete() {
    if (!category) return;
    const details = [
      category.noteCount
        ? `${category.noteCount} ghi chú sẽ được gỡ khỏi danh mục này.`
        : "Danh mục hiện chưa gắn với ghi chú nào.",
      category.childCount
        ? `${category.childCount} danh mục con sẽ chuyển lên cấp cao nhất.`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (!window.confirm(`Xóa danh mục “${category.name}”?\n\n${details}`)) return;

    startDeleting(() => {
      void deleteCategoryAction(category.id).then((result) => {
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        onDeleted();
        router.refresh();
      });
    });
  }

  return (
    <Card>
      <CardContent>
        <div className="mb-5">
          <p className="retro-label">{category ? "Chỉnh sửa" : "Tạo mới"}</p>
          <h2 className="mt-3 font-display text-xl font-bold text-ink">
            {category ? category.name : "Danh mục mới"}
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            {category
              ? "Thay đổi sẽ được cập nhật ngay ở bộ lọc và các trang công khai."
              : "Tạo một chủ đề để nhóm các ghi chú có cùng nội dung."}
          </p>
        </div>

        {state.status === "error" ? (
          <div
            role="alert"
            className="mb-5 border-[3px] border-line bg-danger px-4 py-3 text-sm font-bold text-white shadow-[3px_3px_0_var(--ds-shadow)]"
          >
            {state.message}
          </div>
        ) : null}

        <form ref={formRef} action={formAction} className="space-y-5">
          <input type="hidden" name="categoryId" value={category?.id ?? ""} />

          <label className="block text-sm font-bold text-ink" htmlFor="category-name">
            Tên danh mục <span aria-hidden="true">*</span>
            <Input
              id="category-name"
              name="name"
              value={name}
              minLength={2}
              maxLength={80}
              required
              className="mt-2"
              aria-describedby={state.fieldErrors?.name ? "name-error" : undefined}
              onChange={(event) => {
                const nextName = event.target.value;
                setName(nextName);
                if (!slugEdited) setSlug(slugify(nextName));
              }}
            />
            <FieldError state={state} name="name" />
          </label>

          <label className="block text-sm font-bold text-ink" htmlFor="category-slug">
            Đường dẫn <span aria-hidden="true">*</span>
            <span className="mt-2 flex items-center rounded-sm border-[3px] border-line bg-surface shadow-[3px_3px_0_var(--ds-shadow)] focus-within:-translate-x-0.5 focus-within:-translate-y-0.5 focus-within:shadow-[5px_5px_0_var(--ds-shadow)]">
              <span className="border-r-[3px] border-line bg-surface-alt px-3 py-3 text-sm text-muted">
                /categories/
              </span>
              <input
                id="category-slug"
                name="slug"
                value={slug}
                minLength={2}
                maxLength={120}
                required
                className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-ink outline-none"
                aria-describedby={state.fieldErrors?.slug ? "slug-error" : undefined}
                onChange={(event) => {
                  setSlug(event.target.value);
                  setSlugEdited(true);
                }}
                onBlur={() => setSlug((value) => slugify(value))}
              />
            </span>
            <FieldError state={state} name="slug" />
          </label>

          <label className="block text-sm font-bold text-ink" htmlFor="category-description">
            Mô tả
            <textarea
              id="category-description"
              name="description"
              defaultValue={category?.description ?? ""}
              rows={3}
              maxLength={320}
              className={textareaClassName}
              placeholder="Nội dung chính của danh mục này."
            />
            <FieldError state={state} name="description" />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-bold text-ink" htmlFor="category-parent">
              Danh mục cha
              <select
                id="category-parent"
                name="parentId"
                defaultValue={category?.parentId ?? ""}
                className={selectClassName}
                aria-describedby={state.fieldErrors?.parentId ? "parentId-error" : undefined}
              >
                <option value="">Không có</option>
                {categories
                  .filter((item) => item.id !== category?.id)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </select>
              <FieldError state={state} name="parentId" />
            </label>

            <label className="block text-sm font-bold text-ink" htmlFor="category-position">
              Thứ tự
              <Input
                id="category-position"
                name="position"
                type="number"
                min={0}
                max={10000}
                defaultValue={category?.position ?? categories.length}
                className="mt-2"
              />
              <FieldError state={state} name="position" />
            </label>
          </div>

          <div>
            <span className="block text-sm font-bold text-ink">Màu nhận diện</span>
            <div className="mt-2 grid grid-cols-[3.25rem_minmax(0,1fr)] gap-3">
              <label
                className="grid size-12 cursor-pointer place-items-center rounded-sm border-[3px] border-line bg-surface shadow-[3px_3px_0_var(--ds-shadow)]"
                title="Chọn màu"
              >
                <span className="sr-only">Chọn màu danh mục</span>
                <input
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value.toUpperCase())}
                  className="size-8 cursor-pointer border-0 bg-transparent p-0"
                />
              </label>
              <Input
                id="category-color"
                name="color"
                value={color}
                maxLength={7}
                pattern="#[0-9a-fA-F]{6}"
                aria-label="Mã màu dạng thập lục phân"
                aria-describedby={state.fieldErrors?.color ? "color-error" : undefined}
                onChange={(event) => setColor(event.target.value)}
                onBlur={() => setColor((value) => value.toUpperCase())}
              />
            </div>
            <FieldError state={state} name="color" />
          </div>

          <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-sm border-[3px] border-line bg-surface-alt px-3 shadow-[3px_3px_0_var(--ds-shadow)]">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={category?.isActive ?? true}
              className="size-5 accent-[var(--ds-accent)]"
            />
            <Check className="size-4" aria-hidden="true" />
            <span>
              <span className="block text-sm font-bold text-ink">Hiển thị công khai</span>
              <span className="block text-xs font-normal text-muted">
                Tắt để ẩn danh mục nhưng vẫn giữ liên kết với ghi chú.
              </span>
            </span>
          </label>

          <div className="flex flex-col gap-3 border-t-2 border-dashed border-line/30 pt-5 sm:flex-row sm:justify-between">
            {category ? (
              <Button
                type="button"
                variant="danger"
                disabled={pending || deleting}
                onClick={handleDelete}
              >
                {deleting ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 className="size-4" aria-hidden="true" />
                )}
                {deleting ? "Đang xóa…" : "Xóa danh mục"}
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" variant="accent" disabled={pending || deleting}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="size-4" aria-hidden="true" />
              )}
              {pending ? "Đang lưu…" : category ? "Lưu thay đổi" : "Tạo danh mục"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function CategoryManager({ categories }: { categories: AdminCategoryItem[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = categories.find((category) => category.id === selectedId) ?? null;

  return (
    <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
      <Card>
        <CardContent>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="retro-label">Kho chủ đề</p>
              <h2 className="mt-3 font-display text-xl font-bold text-ink">
                {categories.length} danh mục
              </h2>
            </div>
            <Button type="button" variant="accent" onClick={() => setSelectedId(null)}>
              <FolderPlus className="size-4" aria-hidden="true" />
              Tạo mới
            </Button>
          </div>

          {categories.length ? (
            <div className="mt-5 grid gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedId(category.id)}
                  className={cn(
                    "group grid min-h-20 w-full grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 rounded-sm border-[3px] border-line bg-surface-alt p-3 text-left shadow-[3px_3px_0_var(--ds-shadow)] outline-none transition-[transform,box-shadow,background-color] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-sky hover:shadow-[5px_5px_0_var(--ds-shadow)] focus-visible:ring-3 focus-visible:ring-sky",
                    selectedId === category.id && "bg-accent",
                  )}
                >
                  <span
                    className="voxel-icon grid size-11 place-items-center"
                    style={{ backgroundColor: category.color }}
                    aria-hidden="true"
                  >
                    <FolderTree className="size-5 text-[#10212b]" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-base font-bold text-ink">
                        {category.name}
                      </span>
                      <Badge tone={category.isActive ? "green" : "neutral"}>
                        {category.isActive ? "Công khai" : "Đang ẩn"}
                      </Badge>
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted">
                      {category.parentName ? `Thuộc ${category.parentName} · ` : ""}
                      {category.noteCount} ghi chú · {category.childCount} danh mục con
                    </span>
                  </span>
                  <span className="grid size-11 place-items-center text-muted group-hover:text-ink">
                    <Pencil className="size-4" aria-hidden="true" />
                    <span className="sr-only">Sửa {category.name}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state mt-5 px-5 py-10 text-center">
              <FolderTree className="mx-auto size-9 text-forest" aria-hidden="true" />
              <h3 className="mt-4 font-display text-base font-bold text-ink">
                Chưa có danh mục
              </h3>
              <p className="mt-2 text-sm text-muted">
                Dùng biểu mẫu bên cạnh để tạo chủ đề đầu tiên.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="xl:sticky xl:top-6">
        <CategoryForm
          key={selected?.id ?? "new"}
          category={selected}
          categories={categories}
          onDeleted={() => setSelectedId(null)}
        />
      </div>
    </div>
  );
}
