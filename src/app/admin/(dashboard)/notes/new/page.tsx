import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { NoteEditorForm } from "@/components/admin/note-editor-form";
import { PageHeader } from "@/components/admin/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getAdminNoteEditorData } from "@/features/admin/queries";

export default async function NewNotePage() {
  const data = await getAdminNoteEditorData();
  if (!data) throw new Error("Không thể khởi tạo trình soạn thảo ghi chú.");

  return (
    <div className="space-y-7">
      <PageHeader
        title="Tạo ghi chú"
        description="Soạn nội dung, chọn danh mục và quyết định trạng thái trước khi lưu phiên bản đầu tiên."
        action={(
          <Link href="/admin/notes" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Danh sách ghi chú
          </Link>
        )}
      />
      <NoteEditorForm data={data} />
    </div>
  );
}
