import { MediaLibrary } from "@/components/admin/media-library";
import { MediaUploader } from "@/components/admin/media-uploader";
import { PageHeader } from "@/components/admin/page-header";
import { getAdminMediaFiles } from "@/features/admin/queries";

export default async function AdminMediaPage() {
  const media = await getAdminMediaFiles();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Thư viện media"
        description="Ảnh được resize và chuyển WebP trên trình duyệt; server chỉ mở khóa sau khi đã kiểm tra object thật trên Cloudflare R2."
      />
      <MediaUploader />
      <section aria-labelledby="media-library-title" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 id="media-library-title" className="text-xl font-bold tracking-tight text-ink">File gần đây</h2>
            <p className="mt-1 text-sm text-muted">Hiển thị tối đa 60 file chưa xóa.</p>
          </div>
          <span className="rounded-sm border-[3px] border-line bg-accent px-3 py-1 font-display text-xs font-bold text-[#10212b] shadow-[2px_2px_0_var(--ds-shadow)]">{media.length} file</span>
        </div>
        <MediaLibrary items={media} />
      </section>
    </div>
  );
}
