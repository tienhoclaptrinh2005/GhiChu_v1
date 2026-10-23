"use client";

import { AlertTriangle, Clock3, ExternalLink, FileText, ImageIcon, Loader2, Lock, RefreshCw, Trash2, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mediaProfiles, isMediaFolder } from "@/lib/media/config";
import { cn } from "@/lib/utils";
import type { MediaFileItem } from "@/types/domain";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function folderLabel(folder: string) {
  return isMediaFolder(folder) ? mediaProfiles[folder].label : folder;
}

export function MediaLibrary({ items }: { items: MediaFileItem[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  async function retryVerification(item: MediaFileItem) {
    setVerifyingId(item.id);
    try {
      const response = await fetch("/api/admin/media/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: item.id }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Không thể xác minh media.");
      toast.success("Media đã được xác minh và sẵn sàng.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xác minh media.");
    } finally {
      setVerifyingId(null);
    }
  }

  async function deleteItem(item: MediaFileItem) {
    if (!window.confirm(`Xóa “${item.originalName}” khỏi R2?`)) return;
    setDeletingId(item.id);
    try {
      const response = await fetch(`/api/admin/media/${item.id}`, { method: "DELETE" });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Không thể xóa media.");
      toast.success("Đã xóa media.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa media.");
    } finally {
      setDeletingId(null);
    }
  }

  if (!items.length) {
    return (
      <Card>
        <CardContent className="grid min-h-56 place-items-center text-center">
          <div>
            <ImageIcon className="mx-auto size-9 text-forest" aria-hidden="true" />
            <p className="mt-3 font-bold text-ink">Thư viện chưa có file</p>
            <p className="mt-1 text-sm text-muted">Upload ảnh đầu tiên để kiểm tra toàn bộ pipeline.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const isImage = item.mimeType === "image/webp";
        const ready = item.status === "READY";
        return (
          <Card key={item.id} className="overflow-hidden">
            <div className="pixel-grid relative grid aspect-[16/10] place-items-center overflow-hidden border-b-2 border-line bg-surface-alt">
              {ready && isImage ? (
                <Image
                  src={`/api/admin/media/${item.id}/download`}
                  alt={item.altText || item.originalName}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover"
                />
              ) : ready ? (
                <FileText className="size-12 text-danger" aria-hidden="true" />
              ) : item.status === "FAILED" ? (
                <AlertTriangle className="size-12 text-danger" aria-hidden="true" />
              ) : (
                <Clock3 className="size-12 text-forest" aria-hidden="true" />
              )}
              <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                <Badge tone={ready ? "green" : item.status === "FAILED" ? "rose" : "amber"}>
                  {ready ? "Sẵn sàng" : item.status === "FAILED" ? "Lỗi" : "Đang chờ"}
                </Badge>
                <Badge tone={item.visibility === "PUBLIC" ? "indigo" : "neutral"}>
                  {item.visibility === "PUBLIC" ? <Users className="size-3" aria-hidden="true" /> : <Lock className="size-3" aria-hidden="true" />}
                  {item.visibility === "PUBLIC" ? "Công khai" : "Riêng tư"}
                </Badge>
              </div>
            </div>
            <CardContent className="space-y-4">
              <div>
                <p className="truncate font-bold text-ink" title={item.originalName}>{item.originalName}</p>
                <p className="mt-1 text-xs text-muted">
                  {folderLabel(item.folder)} · {formatBytes(item.sizeBytes)}
                  {item.width && item.height ? ` · ${item.width}×${item.height}px` : ""}
                </p>
              </div>
              {item.failureReason && (
                <p className="rounded-sm border-[3px] border-line bg-pink px-3 py-2 text-xs font-semibold leading-5 text-[#10212b]">{item.failureReason}</p>
              )}
              <div className="flex items-center justify-between gap-3 border-t-2 border-dashed border-line/30 pt-4">
                <time className="text-xs text-muted" dateTime={item.createdAt}>
                  {new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(item.createdAt))}
                </time>
                <div className="flex items-center gap-1">
                  {ready && (
                    <a
                      href={`/api/admin/media/${item.id}/download`}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                    >
                      <ExternalLink className="size-4" aria-hidden="true" />
                      Mở
                    </a>
                  )}
                  {item.status === "PENDING" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={verifyingId === item.id || deletingId === item.id}
                      onClick={() => retryVerification(item)}
                      className="text-forest hover:bg-sky hover:text-[#10212b]"
                    >
                      {verifyingId === item.id ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="size-4" aria-hidden="true" />}
                      Xác minh lại
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={deletingId === item.id || verifyingId === item.id}
                    onClick={() => deleteItem(item)}
                    className="text-danger hover:bg-pink hover:text-[#10212b]"
                  >
                    {deletingId === item.id ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Trash2 className="size-4" aria-hidden="true" />}
                    Xóa
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
