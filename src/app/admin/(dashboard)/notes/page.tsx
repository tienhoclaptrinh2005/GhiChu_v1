import {
  Clock3,
  Eye,
  FileText,
  Pencil,
  Pin,
  Plus,
  Search,
  SearchX,
  X,
} from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAdminNotes } from "@/features/admin/queries";
import { cn, formatDate } from "@/lib/utils";
import type { NoteStatus } from "@/types/domain";

const statuses: Array<{ value: NoteStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "PUBLIC", label: "Công khai" },
  { value: "DRAFT", label: "Bản nháp" },
  { value: "PRIVATE", label: "Riêng tư" },
  { value: "ARCHIVED", label: "Đã lưu trữ" },
];

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function normalizeStatus(value: string): NoteStatus | "ALL" {
  return statuses.some((status) => status.value === value)
    ? (value as NoteStatus | "ALL")
    : "ALL";
}

function statusTone(status: NoteStatus) {
  if (status === "PUBLIC") return "green" as const;
  if (status === "DRAFT") return "amber" as const;
  if (status === "PRIVATE") return "indigo" as const;
  return "neutral" as const;
}

function statusLabel(status: NoteStatus) {
  return statuses.find((item) => item.value === status)?.label ?? status;
}

export default async function AdminNotesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = firstValue(params.q).trim().slice(0, 100);
  const status = normalizeStatus(firstValue(params.status));
  const notes = await getAdminNotes({ query, status });
  const hasFilters = Boolean(query) || status !== "ALL";

  return (
    <div className="space-y-7">
      <PageHeader
        title="Quản lý ghi chú"
        description="Tìm theo tiêu đề hoặc mô tả, lọc trạng thái và kiểm tra nhanh nội dung đang công khai."
        action={(
          <Link href="/admin/notes/new" className={buttonVariants({ variant: "accent" })}>
            <Plus className="size-4" aria-hidden="true" />
            Tạo ghi chú
          </Link>
        )}
      />

      <Card>
        <CardContent>
          <form method="get" className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem_auto] lg:items-end">
            <label className="text-sm font-bold text-ink" htmlFor="admin-note-search">
              Tìm kiếm ghi chú
              <span className="relative mt-2 block">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
                <Input
                  id="admin-note-search"
                  type="search"
                  name="q"
                  defaultValue={query}
                  maxLength={100}
                  placeholder="Ví dụ: Supabase, Next.js…"
                  className="pl-10"
                />
              </span>
            </label>

            <label className="text-sm font-bold text-ink" htmlFor="admin-note-status">
              Trạng thái
              <select
                id="admin-note-status"
                name="status"
                defaultValue={status}
                className="mt-2 h-12 w-full rounded-sm border-[3px] border-line bg-surface px-3 text-sm font-semibold text-ink shadow-[3px_3px_0_var(--ds-shadow)] outline-none transition-[transform,box-shadow] duration-150 focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[5px_5px_0_var(--ds-shadow)]"
              >
                {statuses.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap gap-2">
              <button type="submit" className={buttonVariants({ variant: "primary" })}>
                <Search className="size-4" aria-hidden="true" />
                Tìm
              </button>
              {hasFilters ? (
                <Link
                  href="/admin/notes"
                  className={buttonVariants({ variant: "ghost", size: "icon" })}
                  aria-label="Xóa bộ lọc"
                  title="Xóa bộ lọc"
                >
                  <X className="size-4" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <section aria-labelledby="admin-notes-results">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="retro-label">Kết quả</p>
            <h2 id="admin-notes-results" className="mt-3 font-display text-xl font-bold text-ink">
              {notes.length} ghi chú
            </h2>
          </div>
          <p className="max-w-md text-right text-xs leading-5 text-muted">
            Khách truy cập chỉ đọc được ghi chú có trạng thái Công khai và phiên bản đã xuất bản.
          </p>
        </div>

        {notes.length ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <Card key={note.id}>
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <span className="voxel-icon grid size-12 shrink-0 place-items-center bg-surface-alt text-forest">
                    <FileText className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-bold text-ink sm:text-lg">
                        {note.title}
                      </h3>
                      <Badge tone={statusTone(note.status)}>{statusLabel(note.status)}</Badge>
                      {note.isPinned ? (
                        <Badge tone="amber">
                          <Pin className="size-3" aria-hidden="true" />
                          Đã ghim
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-xs font-semibold text-muted">/{note.slug}</p>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">
                      {note.excerpt || "Ghi chú này chưa có mô tả ngắn."}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="size-3.5" aria-hidden="true" />
                        Cập nhật {formatDate(note.updatedAt)}
                      </span>
                      <span>{note.readingTimeMinutes} phút đọc</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col">
                    <Link
                      href={`/admin/notes/${note.id}/edit`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                      Sửa
                    </Link>
                    {note.status === "PUBLIC" ? (
                      <Link
                        href={`/notes/${note.slug}`}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                      >
                        <Eye className="size-4" aria-hidden="true" />
                        Xem ngoài
                      </Link>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="empty-state px-5 py-12 text-center">
            <SearchX className="mx-auto size-9 text-forest" aria-hidden="true" />
            <h3 className="mt-4 font-display text-base font-bold text-ink">
              Không tìm thấy ghi chú phù hợp
            </h3>
            <p className="mt-2 text-sm text-muted">
              Hãy thử từ khóa ngắn hơn hoặc chọn trạng thái khác.
            </p>
            {hasFilters ? (
              <Link
                href="/admin/notes"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-5")}
              >
                Xóa bộ lọc
              </Link>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
