import type { Metadata } from "next";
import { FolderTree, Search } from "lucide-react";
import Link from "next/link";

import { NoteCard } from "@/components/public/note-card";
import { buttonVariants } from "@/components/ui/button";
import { getPublishedNotes } from "@/features/notes/queries";

export const metadata: Metadata = {
  title: "Ghi chú",
  description: "Tất cả ghi chú công khai, được sắp xếp theo thời gian cập nhật.",
};

export default async function NotesPage() {
  const notes = await getPublishedNotes();
  const categories = [
    ...new Map(
      notes.flatMap((note) => note.categories).map((category) => [category.id, category]),
    ).values(),
  ].slice(0, 6);

  return (
    <main id="main-content" className="mx-auto min-h-[70vh] max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="section-rule flex flex-col gap-6 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="retro-label">Thư viện</p>
          <h1 className="voxel-title mt-3 text-4xl text-ink sm:text-5xl">Tất cả ghi chú</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted">Những bài viết ngắn, tài liệu thực hành và checklist mình muốn tìm lại thật nhanh.</p>
        </div>
        <Link href="/search" className={buttonVariants({ variant: "accent" })}>
          <Search className="size-4" />
          Tìm ghi chú
        </Link>
      </div>
      {categories.length > 0 && (
        <nav aria-label="Lọc nhanh theo danh mục" className="mt-6 flex flex-wrap items-center gap-2">
          <span className="mr-1 inline-flex items-center gap-2 text-sm font-bold text-muted"><FolderTree className="size-4" />Chủ đề:</span>
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`} className="inline-flex min-h-11 items-center rounded-sm border-[3px] border-line bg-surface px-3 text-xs font-bold text-ink shadow-[2px_2px_0_var(--ds-shadow)] transition-colors hover:bg-sky">
              {category.name}
            </Link>
          ))}
        </nav>
      )}
      {notes.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => <NoteCard key={note.id} note={note} />)}
        </div>
      ) : (
        <div className="empty-state mt-8 p-8 text-center text-muted">Chưa có ghi chú công khai. Nội dung mới sẽ xuất hiện tại đây.</div>
      )}
    </main>
  );
}
