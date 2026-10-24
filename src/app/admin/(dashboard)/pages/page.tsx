import { CollectionPlaceholder } from "@/components/admin/collection-placeholder";
export default function AdminPagesPage() {
  return (
    <CollectionPlaceholder
      title="Trang & block"
      description="Đây là khung CMS để sau này sắp xếp nội dung trang mà không sửa source. Trình quản lý tổng quát chưa được triển khai; hiện trang chủ chỉ dùng block Liên kết nhanh và Ghi chú được ghim."
      createHref="/admin/links"
      createLabel="Sửa liên kết nhanh"
      features={[
        "Đang hoạt động: block Liên kết nhanh",
        "Đang hoạt động: 4 ghi chú được ghim",
        "Chưa có: thêm/sửa/xóa block tổng quát",
        "Chưa có: kéo thả và xem trước",
      ]}
    />
  );
}
