import { ArrowLeft, Clock3, FileClock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminNoteHistory } from "@/features/admin/queries";
import { formatDate } from "@/lib/utils";

export default async function NoteHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const data = await getAdminNoteHistory(id);
  if (!data) notFound();

  return (
    <div className="space-y-7">
      <PageHeader
        title="Lịch sử phiên bản"
        description={`Theo dõi những lần lưu của “${data.note.title}”. Phiên bản cũ không bị ghi đè.`}
        action={(
          <Link
            href={`/admin/notes/${data.note.id}/edit`}
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Quay lại chỉnh sửa
          </Link>
        )}
      />

      {data.versions.length ? (
        <div className="space-y-4">
          {data.versions.map((version) => (
            <Card key={version.id}>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <span className="voxel-icon grid size-12 shrink-0 place-items-center bg-surface-alt text-forest">
                  <FileClock className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-bold text-ink">
                      Phiên bản {version.versionNumber}
                    </h2>
                    {version.isCurrent ? <Badge tone="indigo">Hiện tại</Badge> : null}
                    {version.isPublished ? <Badge tone="green">Đang công khai</Badge> : null}
                  </div>
                  <p className="mt-2 font-semibold text-ink">{version.title}</p>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
                    {version.plainText || "Phiên bản này chưa có văn bản thuần."}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="size-3.5" aria-hidden="true" />
                      {formatDate(version.createdAt)}
                    </span>
                    {version.changeSummary ? <span>{version.changeSummary}</span> : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="empty-state px-5 py-12 text-center">
          <FileClock className="mx-auto size-9 text-forest" aria-hidden="true" />
          <h2 className="mt-4 font-display text-base font-bold text-ink">Chưa có phiên bản</h2>
          <p className="mt-2 text-sm text-muted">Hãy lưu ghi chú lần đầu để bắt đầu lịch sử.</p>
        </div>
      )}
    </div>
  );
}
