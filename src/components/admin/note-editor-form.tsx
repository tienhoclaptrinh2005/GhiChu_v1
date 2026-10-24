"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Braces,
  Eye,
  Heading2,
  Heading3,
  History,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Pin,
  Quote,
  Redo2,
  Save,
  Strikethrough,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type KeyboardEvent,
  type ReactNode,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DeleteNoteButton } from "@/components/admin/note-trash-actions";
import {
  createNoteAction,
  type NoteActionState,
  updateNoteAction,
} from "@/features/notes/actions";
import { cn, slugify } from "@/lib/utils";
import type { AdminNoteEditorData, NoteStatus, TiptapNode } from "@/types/domain";

const initialActionState: NoteActionState = {
  status: "idle",
  message: "",
  revision: 0,
};

const selectClassName =
  "mt-2 h-12 w-full rounded-sm border-[3px] border-line bg-surface px-3 text-sm font-semibold text-ink shadow-[3px_3px_0_var(--ds-shadow)] outline-none transition-[transform,box-shadow] duration-150 focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[5px_5px_0_var(--ds-shadow)]";

const textareaClassName =
  "mt-2 w-full resize-y rounded-sm border-[3px] border-line bg-surface px-3.5 py-3 text-sm leading-6 text-ink shadow-[3px_3px_0_var(--ds-shadow),inset_0_3px_0_color-mix(in_srgb,var(--ds-sky)_12%,transparent)] outline-none transition-[box-shadow,transform] duration-150 placeholder:text-muted/80 focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[5px_5px_0_var(--ds-shadow)]";

const statusDescriptions: Record<NoteStatus, string> = {
  DRAFT: "Bản đang soạn, chỉ quản trị viên nhìn thấy.",
  PRIVATE: "Nội dung riêng tư, không xuất hiện ở trang công khai.",
  PUBLIC: "Xuất bản phiên bản vừa lưu để mọi người có thể đọc.",
  ARCHIVED: "Ẩn khỏi website nhưng vẫn giữ toàn bộ lịch sử.",
};

const emptyDocument: TiptapNode = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

function FieldError({ state, name }: { state: NoteActionState; name: string }) {
  const message = state.fieldErrors?.[name]?.[0];
  return message ? (
    <span id={`${name}-error`} className="mt-1.5 block text-xs font-semibold text-danger">
      {message}
    </span>
  ) : null;
}

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={active ? "accent" : "ghost"}
      size="icon"
      aria-label={label}
      aria-pressed={typeof active === "boolean" ? active : undefined}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="shrink-0"
    >
      {children}
    </Button>
  );
}

export function NoteEditorForm({ data }: { data: AdminNoteEditorData }) {
  const router = useRouter();
  const note = data.note;
  const noteId = note?.id ?? null;
  const action = useMemo(
    () => (noteId ? updateNoteAction.bind(null, noteId) : createNoteAction),
    [noteId],
  );
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [title, setTitle] = useState(note?.title ?? "");
  const [slug, setSlug] = useState(note?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(note));
  const [status, setStatus] = useState<NoteStatus>(note?.status ?? "DRAFT");
  const [dirty, setDirty] = useState(false);
  const [, setToolbarRevision] = useState(0);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const initialContent = useMemo(() => note?.content ?? emptyDocument, [note?.content]);
  const [serializedContent, setSerializedContent] = useState(() =>
    JSON.stringify(initialContent),
  );

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-multiline": "true",
        "aria-labelledby": "note-content-label",
        class: "min-h-[22rem] outline-none",
      },
    },
    onUpdate: ({ editor: activeEditor }) => {
      setSerializedContent(JSON.stringify(activeEditor.getJSON()));
      setDirty(true);
    },
    onSelectionUpdate: () => setToolbarRevision((value) => value + 1),
  });

  useEffect(() => {
    if (!state.revision || !state.message) return;
    if (state.status === "success") {
      toast.success(state.message);
      requestAnimationFrame(() => setDirty(false));
      if (!note && state.noteId) router.replace(`/admin/notes/${state.noteId}/edit`);
    }
    if (state.status === "error") {
      toast.error(state.message);
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
    }
  }, [note, router, state.message, state.noteId, state.revision, state.status]);

  useEffect(() => {
    function warnBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirty) return;
      event.preventDefault();
    }

    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [dirty]);

  function handleTitleChange(value: string) {
    setTitle(value);
    setDirty(true);
    if (!slugEdited) setSlug(slugify(value));
  }

  function handleKeyboardShortcut(event: KeyboardEvent<HTMLFormElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      event.currentTarget.requestSubmit();
    }
  }

  return (
    <form action={formAction} onKeyDown={handleKeyboardShortcut} className="space-y-7">
      <input type="hidden" name="content" value={serializedContent} />

      {state.status === "error" ? (
        <div
          ref={errorSummaryRef}
          role="alert"
          tabIndex={-1}
          className="rounded-sm border-[3px] border-line bg-danger px-4 py-3 text-sm font-bold text-white shadow-[4px_4px_0_var(--ds-shadow)] outline-none focus:ring-3 focus:ring-sky"
        >
          Không thể lưu: {state.message}
        </div>
      ) : null}

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_21rem] xl:items-start">
        <div className="min-w-0 space-y-7">
          <Card>
            <CardContent className="space-y-5">
              <div>
                <p className="retro-label">Thông tin chính</p>
                <h2 className="mt-3 font-display text-xl font-bold text-ink">
                  Tiêu đề và đường dẫn
                </h2>
              </div>

              <label className="block text-sm font-bold text-ink" htmlFor="title">
                Tiêu đề <span aria-hidden="true">*</span>
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  onBlur={() => setTitle((value) => value.trimStart())}
                  minLength={3}
                  maxLength={160}
                  aria-describedby={state.fieldErrors?.title ? "title-error" : undefined}
                  className="mt-2 text-base"
                  required
                />
                <FieldError state={state} name="title" />
              </label>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_11rem]">
                <label className="block min-w-0 text-sm font-bold text-ink" htmlFor="slug">
                  Đường dẫn
                  <span className="mt-2 flex min-w-0 items-center rounded-sm border-[3px] border-line bg-surface shadow-[3px_3px_0_var(--ds-shadow)] focus-within:-translate-x-0.5 focus-within:-translate-y-0.5 focus-within:shadow-[5px_5px_0_var(--ds-shadow)]">
                    <span className="shrink-0 border-r-[3px] border-line bg-surface-alt px-3 py-3 text-sm text-muted">
                      /notes/
                    </span>
                    <input
                      id="slug"
                      name="slug"
                      value={slug}
                      onChange={(event) => {
                        setSlug(event.target.value);
                        setSlugEdited(true);
                        setDirty(true);
                      }}
                      onBlur={() => setSlug((value) => slugify(value))}
                      minLength={3}
                      maxLength={180}
                      aria-describedby={state.fieldErrors?.slug ? "slug-error" : "slug-help"}
                      className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-ink outline-none"
                      required
                    />
                  </span>
                  <span id="slug-help" className="mt-1.5 block text-xs font-normal text-muted">
                    Tự tạo từ tiêu đề; bạn vẫn có thể sửa trước khi lưu.
                  </span>
                  <FieldError state={state} name="slug" />
                </label>

                <label className="block text-sm font-bold text-ink" htmlFor="parentId">
                  Ghi chú cha
                  <select
                    id="parentId"
                    name="parentId"
                    defaultValue={note?.parentId ?? ""}
                    className={selectClassName}
                    onChange={() => setDirty(true)}
                  >
                    <option value="">Không có</option>
                    {data.parentNotes.map((parent) => (
                      <option key={parent.id} value={parent.id}>
                        {parent.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block text-sm font-bold text-ink" htmlFor="excerpt">
                Mô tả ngắn
                <textarea
                  id="excerpt"
                  name="excerpt"
                  defaultValue={note?.excerpt ?? ""}
                  maxLength={320}
                  rows={3}
                  onChange={() => setDirty(true)}
                  aria-describedby={state.fieldErrors?.excerpt ? "excerpt-error" : "excerpt-help"}
                  className={textareaClassName}
                  placeholder="Tóm tắt nội dung để người đọc biết ghi chú này nói về gì."
                />
                <span id="excerpt-help" className="mt-1.5 block text-xs font-normal text-muted">
                  Hiển thị trên card ghi chú và được dùng làm mô tả SEO dự phòng.
                </span>
                <FieldError state={state} name="excerpt" />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <div>
                <p className="retro-label">Trình soạn thảo</p>
                <h2 id="note-content-label" className="mt-3 font-display text-xl font-bold text-ink">
                  Nội dung ghi chú <span aria-hidden="true">*</span>
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Dùng thanh công cụ hoặc phím tắt quen thuộc. Ctrl/Cmd + S để lưu nhanh.
                </p>
              </div>

              <div
                className="flex max-w-full flex-wrap gap-2 rounded-sm border-[3px] border-line bg-surface-alt p-2 shadow-[3px_3px_0_var(--ds-shadow)]"
                role="toolbar"
                aria-label="Định dạng nội dung"
              >
                <ToolbarButton
                  label="In đậm"
                  active={editor?.isActive("bold") ?? false}
                  disabled={!editor}
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                >
                  <Bold className="size-4" aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton
                  label="In nghiêng"
                  active={editor?.isActive("italic") ?? false}
                  disabled={!editor}
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                >
                  <Italic className="size-4" aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton
                  label="Gạch ngang"
                  active={editor?.isActive("strike") ?? false}
                  disabled={!editor}
                  onClick={() => editor?.chain().focus().toggleStrike().run()}
                >
                  <Strikethrough className="size-4" aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton
                  label="Tiêu đề cấp 2"
                  active={editor?.isActive("heading", { level: 2 }) ?? false}
                  disabled={!editor}
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                  <Heading2 className="size-4" aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton
                  label="Tiêu đề cấp 3"
                  active={editor?.isActive("heading", { level: 3 }) ?? false}
                  disabled={!editor}
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                  <Heading3 className="size-4" aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton
                  label="Danh sách dấu đầu dòng"
                  active={editor?.isActive("bulletList") ?? false}
                  disabled={!editor}
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                >
                  <List className="size-4" aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton
                  label="Danh sách đánh số"
                  active={editor?.isActive("orderedList") ?? false}
                  disabled={!editor}
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                >
                  <ListOrdered className="size-4" aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton
                  label="Trích dẫn"
                  active={editor?.isActive("blockquote") ?? false}
                  disabled={!editor}
                  onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                >
                  <Quote className="size-4" aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton
                  label="Khối mã"
                  active={editor?.isActive("codeBlock") ?? false}
                  disabled={!editor}
                  onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                >
                  <Braces className="size-4" aria-hidden="true" />
                </ToolbarButton>
                <span className="hidden w-px self-stretch bg-line/30 sm:block" aria-hidden="true" />
                <ToolbarButton
                  label="Hoàn tác"
                  disabled={!editor?.can().chain().focus().undo().run()}
                  onClick={() => editor?.chain().focus().undo().run()}
                >
                  <Undo2 className="size-4" aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton
                  label="Làm lại"
                  disabled={!editor?.can().chain().focus().redo().run()}
                  onClick={() => editor?.chain().focus().redo().run()}
                >
                  <Redo2 className="size-4" aria-hidden="true" />
                </ToolbarButton>
              </div>

              <div
                className={cn(
                  "note-editor overflow-hidden rounded-sm border-[3px] border-line bg-surface shadow-[4px_4px_0_var(--ds-shadow)] transition-[box-shadow,transform] duration-150 focus-within:-translate-x-0.5 focus-within:-translate-y-0.5 focus-within:shadow-[6px_6px_0_var(--ds-shadow)]",
                  state.fieldErrors?.content && "border-danger",
                )}
              >
                <EditorContent editor={editor} />
              </div>
              <FieldError state={state} name="content" />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <details>
                <summary className="cursor-pointer font-display text-base font-bold text-ink outline-none focus-visible:ring-3 focus-visible:ring-sky">
                  Thiết lập SEO nâng cao
                </summary>
                <div className="mt-5 grid gap-5">
                  <label className="block text-sm font-bold text-ink" htmlFor="seoTitle">
                    Tiêu đề SEO
                    <Input
                      id="seoTitle"
                      name="seoTitle"
                      defaultValue={note?.seoTitle ?? ""}
                      maxLength={70}
                      onChange={() => setDirty(true)}
                      className="mt-2"
                      placeholder="Để trống để dùng tiêu đề ghi chú"
                    />
                    <FieldError state={state} name="seoTitle" />
                  </label>
                  <label className="block text-sm font-bold text-ink" htmlFor="seoDescription">
                    Mô tả SEO
                    <textarea
                      id="seoDescription"
                      name="seoDescription"
                      defaultValue={note?.seoDescription ?? ""}
                      maxLength={160}
                      rows={3}
                      onChange={() => setDirty(true)}
                      className={textareaClassName}
                      placeholder="Để trống để dùng mô tả ngắn"
                    />
                    <FieldError state={state} name="seoDescription" />
                  </label>
                </div>
              </details>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-7 xl:sticky xl:top-6">
          <Card>
            <CardContent className="space-y-5">
              <div>
                <p className="retro-label">Xuất bản</p>
                <h2 className="mt-3 font-display text-lg font-bold text-ink">Trạng thái ghi chú</h2>
              </div>

              <label className="block text-sm font-bold text-ink" htmlFor="status">
                Trạng thái
                <select
                  id="status"
                  name="status"
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value as NoteStatus);
                    setDirty(true);
                  }}
                  className={selectClassName}
                >
                  <option value="DRAFT">Bản nháp</option>
                  <option value="PRIVATE">Riêng tư</option>
                  <option value="PUBLIC">Công khai</option>
                  <option value="ARCHIVED">Đã lưu trữ</option>
                </select>
                <span className="mt-2 block text-xs font-normal leading-5 text-muted">
                  {statusDescriptions[status]}
                </span>
              </label>

              <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-sm border-[3px] border-line bg-surface-alt px-3 shadow-[3px_3px_0_var(--ds-shadow)]">
                <input
                  type="checkbox"
                  name="isPinned"
                  defaultChecked={note?.isPinned ?? false}
                  onChange={() => setDirty(true)}
                  className="size-5 accent-[var(--ds-accent)]"
                />
                <Pin className="size-4 shrink-0" aria-hidden="true" />
                <span className="text-sm font-bold text-ink">Ghim trên trang chủ</span>
              </label>

              <label className="block text-sm font-bold text-ink" htmlFor="changeSummary">
                Ghi chú phiên bản
                <textarea
                  id="changeSummary"
                  name="changeSummary"
                  maxLength={200}
                  rows={3}
                  className={textareaClassName}
                  placeholder={note ? "Ví dụ: Bổ sung phần triển khai" : "Phiên bản đầu tiên"}
                />
              </label>

              <Button type="submit" variant="accent" size="lg" disabled={pending} className="w-full">
                {pending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Save className="size-4" aria-hidden="true" />
                )}
                {pending ? "Đang lưu…" : note ? "Lưu phiên bản mới" : "Tạo ghi chú"}
              </Button>

              <p role="status" aria-live="polite" className="min-h-5 text-xs leading-5 text-muted">
                {pending
                  ? "Đang ghi dữ liệu an toàn vào Supabase…"
                  : dirty
                    ? "Có thay đổi chưa được lưu."
                    : note
                      ? `Đang ở phiên bản ${note.versionNumber}.`
                      : "Chưa có dữ liệu được lưu."}
              </p>

              {note ? (
                <div className="grid gap-2 border-t-2 border-dashed border-line/30 pt-4">
                  <Link
                    href={`/admin/notes/${note.id}/history`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    <History className="size-4" aria-hidden="true" />
                    Lịch sử phiên bản
                  </Link>
                  {note.status === "PUBLIC" ? (
                    <Link
                      href={`/notes/${note.slug}`}
                      target="_blank"
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      <Eye className="size-4" aria-hidden="true" />
                      Xem trang công khai
                    </Link>
                  ) : null}
                  <DeleteNoteButton
                    noteId={note.id}
                    noteTitle={note.title}
                    redirectAfterDelete
                    className="mt-2 w-full"
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <div>
                <p className="retro-label">Phân loại</p>
                <h2 className="mt-3 font-display text-lg font-bold text-ink">Danh mục</h2>
                <p className="mt-1 text-xs leading-5 text-muted">Chọn tối đa 10 danh mục công khai.</p>
              </div>
              {data.categories.length ? (
                <fieldset className="space-y-2">
                  <legend className="sr-only">Danh mục ghi chú</legend>
                  {data.categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex min-h-11 cursor-pointer items-center gap-3 rounded-sm border-2 border-line bg-surface-alt px-3 text-sm font-semibold text-ink transition-colors hover:bg-sky"
                    >
                      <input
                        type="checkbox"
                        name="categoryIds"
                        value={category.id}
                        defaultChecked={note?.categoryIds.includes(category.id)}
                        onChange={() => setDirty(true)}
                        className="size-5 accent-[var(--ds-accent)]"
                      />
                      <span
                        className="size-3 shrink-0 border-2 border-line"
                        style={{ backgroundColor: category.color }}
                        aria-hidden="true"
                      />
                      <span>{category.name}</span>
                    </label>
                  ))}
                </fieldset>
              ) : (
                <p className="rounded-sm border-2 border-dashed border-line p-3 text-xs leading-5 text-muted">
                  Chưa có danh mục đang hoạt động. Bạn vẫn có thể lưu ghi chú trước.
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </form>
  );
}
