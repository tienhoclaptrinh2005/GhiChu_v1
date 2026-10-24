import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { NoteEditorForm } from "@/components/admin/note-editor-form";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getAdminNoteEditorData } from "@/features/admin/queries";

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const data = await getAdminNoteEditorData(id);
  if (!data?.note) notFound();

  return (
    <div className="space-y-7">
      <PageHeader
        title="Chỉnh sửa ghi chú"
        description="Mỗi lần lưu tạo một phiên bản bất biến; bản công khai chỉ thay đổi khi trạng thái là Công khai."
        action={(
          <Link href="/admin/notes" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Danh sách ghi chú
          </Link>
        )}
      />
      <div className="flex flex-wrap gap-2">
        <Badge tone="indigo">Phiên bản {data.note.versionNumber}</Badge>
        <Badge tone={data.note.status === "PUBLIC" ? "green" : "amber"}>
          {data.note.status}
        </Badge>
      </div>
      <NoteEditorForm data={data} />
    </div>
  );
}
