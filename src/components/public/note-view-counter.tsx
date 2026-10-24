"use client";

import { Eye } from "lucide-react";
import { useEffect, useState } from "react";

import { cn, formatNumber } from "@/lib/utils";

type NoteViewCounterProps = {
  noteId: string;
  initialCount: number;
  className?: string;
};

export function NoteViewCounter({
  noteId,
  initialCount,
  className,
}: NoteViewCounterProps) {
  const [viewCount, setViewCount] = useState(Math.max(0, initialCount));

  useEffect(() => {
    const controller = new AbortController();

    async function registerView() {
      try {
        const response = await fetch(`/api/notes/${encodeURIComponent(noteId)}/view`, {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });
        if (!response.ok) return;

        const payload = (await response.json()) as { viewCount?: unknown };
        if (
          typeof payload.viewCount === "number" &&
          Number.isSafeInteger(payload.viewCount) &&
          payload.viewCount >= 0
        ) {
          setViewCount(payload.viewCount);
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          // Giữ số đã render từ server khi kết nối tạm thời thất bại.
        }
      }
    }

    void registerView();
    return () => controller.abort();
  }, [noteId]);

  return (
    <span
      role="status"
      aria-atomic="true"
      className={cn("inline-flex items-center gap-1.5 tabular-nums", className)}
      title="Mỗi trình duyệt được tính tối đa một lượt cho ghi chú này trong 24 giờ"
    >
      <Eye className="size-3.5" aria-hidden="true" />
      {formatNumber(viewCount)} lượt xem
    </span>
  );
}
