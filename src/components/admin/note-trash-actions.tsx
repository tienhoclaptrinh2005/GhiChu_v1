"use client";

import { ArchiveRestore, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  deleteNoteAction,
  restoreNoteAction,
} from "@/features/notes/actions";

export function DeleteNoteButton({
  noteId,
  noteTitle,
  redirectAfterDelete = false,
  className,
}: {
  noteId: string;
  noteTitle: string;
  redirectAfterDelete?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !window.confirm(
        `Chuyển ghi chú “${noteTitle}” vào thùng rác?\n\nGhi chú sẽ biến mất khỏi trang công khai nhưng lịch sử phiên bản vẫn được giữ.`,
      )
    ) {
      return;
    }

    startTransition(() => {
      void deleteNoteAction(noteId).then((result) => {
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        if (redirectAfterDelete) {
          router.replace("/admin/notes?scope=trash");
        } else {
          router.refresh();
        }
      });
    });
  }

  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      disabled={pending}
      className={className}
      onClick={handleDelete}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Trash2 className="size-4" aria-hidden="true" />
      )}
      {pending ? "Đang chuyển…" : "Xóa"}
    </Button>
  );
}

export function RestoreNoteButton({
  noteId,
  noteTitle,
}: {
  noteId: string;
  noteTitle: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleRestore() {
    startTransition(() => {
      void restoreNoteAction(noteId).then((result) => {
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(`${result.message} “${noteTitle}”`);
        router.refresh();
      });
    });
  }

  return (
    <Button
      type="button"
      variant="accent"
      size="sm"
      disabled={pending}
      onClick={handleRestore}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <ArchiveRestore className="size-4" aria-hidden="true" />
      )}
      {pending ? "Đang khôi phục…" : "Khôi phục"}
    </Button>
  );
}
