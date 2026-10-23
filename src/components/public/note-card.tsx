import { ArrowUpRight, Clock3, Pin } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { NoteSummary } from "@/types/domain";

export function NoteCard({ note, compact = false }: { note: NoteSummary; compact?: boolean }) {
  return (
    <article className="group relative flex h-full min-h-64 flex-col overflow-hidden rounded-sm border-[3px] border-line bg-surface p-5 shadow-[5px_5px_0_var(--ds-shadow),inset_0_-4px_0_color-mix(in_srgb,var(--ds-sky)_15%,transparent)] transition-[transform,box-shadow,background-color] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-surface-alt hover:shadow-[7px_7px_0_var(--ds-shadow)]">
      <span className="grass-block absolute right-3 top-3 size-6" aria-hidden="true" />
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {note.categories.slice(0, 2).map((category) => (
            <Badge key={category.id} tone="indigo">
              {category.name}
            </Badge>
          ))}
          {note.categories.length === 0 && <Badge>Ghi chú</Badge>}
        </div>
        {note.isPinned && (
          <span title="Đã ghim" className="text-danger">
            <Pin className="size-4 fill-current" aria-hidden="true" />
          </span>
        )}
      </div>
      <h2 className="font-display text-lg font-bold leading-snug tracking-tight text-ink transition-colors group-hover:text-forest">
        <Link href={`/notes/${note.slug}`} className="after:absolute after:inset-0">
          {note.title}
        </Link>
      </h2>
      {!compact && (
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{note.excerpt}</p>
      )}
      <div className="mt-auto flex items-center justify-between gap-3 border-t-2 border-dashed border-line/30 pt-4 text-xs font-semibold text-muted">
        <span>{formatDate(note.publishedAt)}</span>
        <span className="flex items-center gap-1.5">
          <Clock3 className="size-3.5" aria-hidden="true" />
          {note.readingTimeMinutes} phút
          <ArrowUpRight className="ml-1 size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
