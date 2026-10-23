"use client";

import { useRef, useState, type FormEvent } from "react";
import { CheckCircle2, FileUp, ImageDown, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MEDIA_FOLDERS,
  SUPPORTED_SOURCE_IMAGE_TYPES,
  mediaProfiles,
  type MediaFolder,
  type MediaVisibility,
} from "@/lib/media/config";
import { prepareMediaFile, type PreparedMediaFile } from "@/lib/media/convert-image";

type Phase = "idle" | "converting" | "uploading" | "verifying";

type PresignResponse = {
  mediaId: string;
  uploadUrl: string;
  requiredHeaders: Record<string, string>;
  error?: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function responseJson<T>(response: Response): Promise<T> {
  return (await response.json().catch(() => ({}))) as T;
}

function putFile(
  url: string,
  file: File,
  headers: Record<string, string>,
  onProgress: (value: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    Object.entries(headers).forEach(([name, value]) => xhr.setRequestHeader(name, value));
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error("R2 từ chối file upload."));
    });
    xhr.addEventListener("error", () => reject(new Error("Không thể kết nối tới R2. Hãy kiểm tra CORS.")));
    xhr.addEventListener("abort", () => reject(new Error("Upload đã bị hủy.")));
    xhr.send(file);
  });
}

const phaseLabels: Record<Exclude<Phase, "idle">, string> = {
  converting: "Đang tối ưu và chuyển WebP",
  uploading: "Đang upload trực tiếp lên R2",
  verifying: "Server đang xác minh file thật",
};

export function MediaUploader() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [folder, setFolder] = useState<MediaFolder>("notes");
  const [visibility, setVisibility] = useState<MediaVisibility>("PRIVATE");
  const [altText, setAltText] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [prepared, setPrepared] = useState<PreparedMediaFile | null>(null);
  const busy = phase !== "idle";
  const profile = mediaProfiles[folder];
  const accept = [
    ...SUPPORTED_SOURCE_IMAGE_TYPES,
    ...(profile.acceptsPdf ? ["application/pdf"] : []),
  ].join(",");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || busy) return;

    let mediaId: string | null = null;
    let objectUploaded = false;

    try {
      setPrepared(null);
      setProgress(0);
      setPhase("converting");
      const output = await prepareMediaFile(file, folder);
      setPrepared(output);

      const presignResponse = await fetch("/api/admin/media/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalName: file.name,
          contentType: output.file.type,
          sizeBytes: output.file.size,
          folder,
          visibility,
          altText,
        }),
      });
      const signed = await responseJson<PresignResponse>(presignResponse);
      if (!presignResponse.ok || !signed.mediaId || !signed.uploadUrl) {
        throw new Error(signed.error || "Không thể tạo phiên upload.");
      }
      mediaId = signed.mediaId;

      setPhase("uploading");
      await putFile(signed.uploadUrl, output.file, signed.requiredHeaders, setProgress);
      objectUploaded = true;

      setPhase("verifying");
      const completeResponse = await fetch("/api/admin/media/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId }),
      });
      const completed = await responseJson<{ error?: string }>(completeResponse);
      if (!completeResponse.ok) {
        throw new Error(completed.error || "Server không thể xác minh file.");
      }

      toast.success(output.converted ? "Đã chuyển WebP và upload thành công." : "Đã upload thành công.");
      setFile(null);
      setAltText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } catch (error) {
      if (mediaId && !objectUploaded) {
        await fetch(`/api/admin/media/${mediaId}`, { method: "DELETE" }).catch(() => undefined);
      }
      toast.error(error instanceof Error ? error.message : "Upload thất bại.");
      router.refresh();
    } finally {
      setPhase("idle");
      setProgress(0);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="grid gap-6 lg:grid-cols-[1fr_19rem]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-ink">
              <FileUp className="size-4 text-forest" aria-hidden="true" />
              Upload media mới
            </div>
            <p className="mt-1 text-sm leading-6 text-muted">
              JPEG, PNG, WebP và AVIF sẽ được resize rồi chuyển thành WebP trước khi rời thiết bị.
            </p>
          </div>

          <label className="block rounded-sm border-[3px] border-dashed border-line bg-surface-alt p-5 transition-colors duration-150 hover:bg-sky/35">
            <span className="mb-2 block text-sm font-bold text-ink">Chọn file</span>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              disabled={busy}
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setPrepared(null);
              }}
              className="block w-full cursor-pointer text-sm text-muted file:mr-4 file:cursor-pointer file:rounded-sm file:border-[3px] file:border-line file:bg-accent file:px-4 file:py-2.5 file:font-bold file:text-[#10212b] file:shadow-[2px_2px_0_var(--ds-shadow)] hover:file:bg-sky"
              required
            />
            <span className="mt-3 block text-xs leading-5 text-muted">
              Ảnh nguồn tối đa 25 MB; đầu ra tối đa {profile.maxBytes / 1024 / 1024} MB và {profile.maxWidth}×{profile.maxHeight}px.
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold text-ink">
              Nhóm sử dụng
              <select
                value={folder}
                disabled={busy}
                onChange={(event) => {
                  setFolder(event.target.value as MediaFolder);
                  setFile(null);
                  setPrepared(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="mt-2 h-12 w-full rounded-sm border-[3px] border-line bg-surface px-3.5 text-sm font-semibold text-ink shadow-[3px_3px_0_var(--ds-shadow)] outline-none transition-[transform,box-shadow] focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[5px_5px_0_var(--ds-shadow)]"
              >
                {MEDIA_FOLDERS.map((value) => (
                  <option key={value} value={value}>{mediaProfiles[value].label}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-bold text-ink">
              Quyền xem
              <select
                value={visibility}
                disabled={busy}
                onChange={(event) => setVisibility(event.target.value as MediaVisibility)}
                className="mt-2 h-12 w-full rounded-sm border-[3px] border-line bg-surface px-3.5 text-sm font-semibold text-ink shadow-[3px_3px_0_var(--ds-shadow)] outline-none transition-[transform,box-shadow] focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[5px_5px_0_var(--ds-shadow)]"
              >
                <option value="PRIVATE">Riêng tư</option>
                <option value="PUBLIC">Công khai</option>
              </select>
            </label>
          </div>

          <label className="block text-sm font-bold text-ink">
            Mô tả ảnh <span className="font-normal text-muted">(khuyến nghị cho accessibility)</span>
            <input
              value={altText}
              maxLength={500}
              disabled={busy}
              onChange={(event) => setAltText(event.target.value)}
              placeholder="Ví dụ: Góc làm việc cạnh cửa sổ"
              className="mt-2 h-12 w-full rounded-sm border-[3px] border-line bg-surface px-3.5 text-sm text-ink shadow-[3px_3px_0_var(--ds-shadow)] outline-none placeholder:text-muted focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[5px_5px_0_var(--ds-shadow)]"
            />
          </label>

          {prepared && (
            <div className="flex flex-wrap items-center gap-2 rounded-sm border-[3px] border-line bg-sky px-4 py-3 text-sm font-semibold text-[#10212b] shadow-[3px_3px_0_var(--ds-shadow)]">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              {prepared.converted ? (
                <>
                  WebP q{Math.round((prepared.quality ?? 0) * 100)}: {formatBytes(prepared.originalBytes)} → {formatBytes(prepared.outputBytes)}
                  {prepared.outputBytes < prepared.originalBytes && (
                    <strong>
                      (giảm {Math.round((1 - prepared.outputBytes / prepared.originalBytes) * 100)}%)
                    </strong>
                  )}
                </>
              ) : (
                <>PDF giữ nguyên: {formatBytes(prepared.outputBytes)}</>
              )}
            </div>
          )}

          {busy && (
            <div aria-live="polite" className="space-y-2 rounded-sm border-[3px] border-line bg-forest-deep px-4 py-3 text-sm text-[#f7fdff] shadow-[3px_3px_0_var(--ds-shadow)]">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 font-semibold">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {phaseLabels[phase as Exclude<Phase, "idle">]}
                </span>
                {phase === "uploading" && <span>{progress}%</span>}
              </div>
              {phase === "uploading" && (
                <div className="h-2 overflow-hidden border border-line bg-[#f7fdff]/20">
                  <div className="h-full bg-accent transition-[width]" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
          )}

          <Button type="submit" variant="accent" disabled={!file || busy}>
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ImageDown className="size-4" aria-hidden="true" />}
            {busy ? "Đang xử lý…" : "Tối ưu và upload"}
          </Button>
        </form>

        <aside className="pixel-grid rounded-sm border-[3px] border-line bg-forest-deep p-5 text-[#f7fdff] shadow-[5px_5px_0_var(--ds-shadow)]">
          <ShieldCheck className="size-7 text-accent" aria-hidden="true" />
          <h2 className="mt-4 font-bold">Ba lớp kiểm soát</h2>
          <ol className="mt-4 space-y-4 text-sm leading-6 text-[#d7e1dc]">
            <li><strong className="text-accent">1. Tối ưu:</strong> resize đúng mục đích và mã hóa WebP quality {Math.round(profile.webpQuality * 100)}%.</li>
            <li><strong className="text-accent">2. Giới hạn:</strong> signed URL khóa MIME, dung lượng khai báo và mã phiên upload.</li>
            <li><strong className="text-accent">3. Xác minh:</strong> server đọc header, magic bytes và kích thước thật trước khi cho sử dụng.</li>
          </ol>
        </aside>
      </CardContent>
    </Card>
  );
}
