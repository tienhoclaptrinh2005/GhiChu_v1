import { FolderTree } from "lucide-react";

import { CategoryManager } from "@/components/admin/category-manager";
import { PageHeader } from "@/components/admin/page-header";
import { getAdminCategories } from "@/features/admin/queries";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-7">
      <PageHeader
        title="Quản lý danh mục"
        description="Tạo, chỉnh sửa, sắp xếp và ẩn/hiện các chủ đề dùng để phân loại ghi chú công khai."
      />
      <div className="flex items-start gap-3 rounded-sm border-[3px] border-line bg-sky px-4 py-3 text-sm leading-6 text-[#10212b] shadow-[4px_4px_0_var(--ds-shadow)]">
        <FolderTree className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <p>
          Xóa danh mục chỉ gỡ nhãn khỏi ghi chú; nội dung và lịch sử ghi chú không bị xóa.
          Danh mục con sẽ được chuyển thành danh mục cấp cao nhất.
        </p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
