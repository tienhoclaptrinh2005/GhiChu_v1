import { CollectionPlaceholder } from "@/components/admin/collection-placeholder";
export default function AdminBannersPage() {
  return (
    <CollectionPlaceholder
      title="Banner"
      description="Renderer banner thông báo đã có ở trang chủ nhưng form tạo banner riêng chưa được triển khai. Ảnh bìa hồ sơ hiện được quản lý trong Cài đặt trang chủ."
      createHref="/admin/settings"
      createLabel="Quản lý ảnh bìa"
      features={[
        "Đang hoạt động: ảnh bìa trong hồ sơ",
        "Sẵn sàng: block thông báo có nút hành động",
        "Chưa có: CRUD banner riêng",
        "Chưa có: lịch bật/tắt và slider",
      ]}
    />
  );
}
