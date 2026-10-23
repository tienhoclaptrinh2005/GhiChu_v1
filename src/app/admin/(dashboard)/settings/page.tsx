import { PageHeader } from "@/components/admin/page-header";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { getSiteSettingsEditorData } from "@/features/admin/queries";

export default async function AdminSettingsPage() {
  const data = await getSiteSettingsEditorData();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Hồ sơ trang chủ"
        description="Quản lý tên, thông tin chi tiết, một ảnh đại diện đang dùng, ảnh bìa và các kênh liên hệ hiển thị bên ngoài."
      />
      <SiteSettingsForm data={data} />
    </div>
  );
}
