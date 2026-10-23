import { QuickLinksForm } from "@/components/admin/quick-links-form";
import { PageHeader } from "@/components/admin/page-header";
import { getQuickLinksEditorData } from "@/features/admin/queries";

export default async function AdminLinksPage() {
  const data = await getQuickLinksEditorData();

  return (
    <div className="space-y-7">
      <PageHeader
        title="Liên kết nhanh"
        description="Quản lý tên, mô tả, đường dẫn, biểu tượng, màu sắc và thứ tự các nút trên trang chủ."
      />
      <QuickLinksForm data={data} />
    </div>
  );
}
