import type { Metadata } from "next";
import { BookOpenText, Search, Sparkles } from "lucide-react";

import { NoteCard } from "@/components/public/note-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchPublishedNotes } from "@/features/notes/queries";

export const metadata: Metadata = { title: "Tìm kiếm", robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const notes = q ? await searchPublishedNotes(q) : [];
  return (
    <main id="main-content" className="mx-auto min-h-[70vh] max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="retro-label">Tra cứu</p>
      <h1 className="voxel-title mt-3 text-4xl text-ink sm:text-5xl">Tìm ghi chú</h1>
      <p className="mt-3 max-w-2xl leading-7 text-muted">Tìm nhanh theo tiêu đề hoặc nội dung tóm tắt của ghi chú công khai.</p>
      <form action="/search" className="mt-7 grid max-w-3xl gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-muted" />
          <Input name="q" defaultValue={q} maxLength={100} placeholder="Ví dụ: Next.js, bảo mật, checklist…" className="pl-11 text-base" aria-label="Từ khóa tìm kiếm" />
        </div>
        <Button type="submit" variant="accent" className="h-12 px-6">Tìm kiếm</Button>
      </form>
      {q && (
        <p className="mt-7 text-sm text-muted">Tìm thấy <strong className="text-ink">{notes.length}</strong> kết quả cho “{q}”.</p>
      )}
      {notes.length > 0 ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{notes.map((note) => <NoteCard key={note.id} note={note} />)}</div>
      ) : (
        <div className="empty-state mt-8 grid min-h-56 place-items-center p-7 text-center">
          <div className="max-w-lg">
            {q ? <BookOpenText className="mx-auto size-9 text-forest" /> : <Sparkles className="mx-auto size-9 text-forest" />}
            <h2 className="mt-4 text-xl font-bold text-ink">{q ? "Chưa thấy ghi chú phù hợp" : "Bắt đầu bằng một từ khóa"}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{q ? "Thử rút gọn cụm từ, kiểm tra chính tả hoặc duyệt theo danh mục." : "Bạn có thể tìm theo công nghệ, chủ đề hoặc một cụm từ trong phần tóm tắt."}</p>
          </div>
        </div>
      )}
    </main>
  );
}
