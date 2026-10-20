import { Blocks, BookOpenText, Eye, FilePenLine, ImageIcon, LockKeyhole } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getDashboardStats } from "@/features/admin/queries";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  return (
    <div className="space-y-7">
      <PageHeader title="Tổng quan" description="Theo dõi nội dung và tiếp tục đúng công việc cần làm." action={<Link href="/admin/notes/new" className={buttonVariants({ variant: "accent" })}><FilePenLine className="size-4" />Tạo ghi chú</Link>} />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Tổng ghi chú" value={stats.totalNotes} hint="Không tính thùng rác" icon={BookOpenText} />
        <StatCard label="Đang công khai" value={stats.publicNotes} hint="Khách có thể đọc" icon={Eye} tone="emerald" />
        <StatCard label="Riêng tư" value={stats.privateNotes} hint="Chỉ Admin" icon={LockKeyhole} tone="rose" />
        <StatCard label="Bản nháp" value={stats.draftNotes} hint="Chưa xuất bản" icon={FilePenLine} tone="amber" />
        <StatCard label="Block hoạt động" value={stats.activeBlocks} hint="Trên các trang" icon={Blocks} />
        <StatCard label="Media" value={stats.mediaFiles} hint="Ảnh và tài liệu" icon={ImageIcon} tone="emerald" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card><CardContent><h2 className="font-bold text-ink">Quy trình xuất bản an toàn</h2><div className="mt-5 space-y-4">{["Lưu nội dung thành một version mới", "Xem trước bản nháp và kiểm tra quyền", "Cập nhật published_version_id", "Làm mới cache của trang public"].map((item, index) => <div key={item} className="flex items-center gap-3 text-sm text-muted"><span className="grid size-8 shrink-0 place-items-center rounded-sm border-2 border-line bg-sky font-display text-xs font-bold text-[#17212c] shadow-[2px_2px_0_var(--ds-shadow)]">{index + 1}</span>{item}</div>)}</div></CardContent></Card>
        <Card className="pixel-corners bg-forest-deep text-[#fffdf5]"><CardContent><p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-accent">Gợi ý tiếp theo</p><h2 className="mt-3 text-xl font-bold">Kết nối dữ liệu thật</h2><p className="mt-2 text-sm leading-6 text-[#d7e1dc]">Chạy migration, tạo tài khoản Admin và điền biến môi trường trước khi bắt đầu CRUD.</p><Link href="/admin/settings" className="mt-5 inline-flex min-h-11 items-center border-b-2 border-accent text-sm font-bold text-[#fffdf5] transition-colors hover:text-accent">Mở cài đặt →</Link></CardContent></Card>
      </div>
    </div>
  );
}
