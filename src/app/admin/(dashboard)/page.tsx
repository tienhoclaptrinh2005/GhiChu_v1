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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Tổng ghi chú" value={stats.totalNotes} hint="Không tính thùng rác" icon={BookOpenText} />
        <StatCard label="Đang công khai" value={stats.publicNotes} hint="Khách có thể đọc" icon={Eye} tone="emerald" />
        <StatCard label="Riêng tư" value={stats.privateNotes} hint="Chỉ Admin" icon={LockKeyhole} tone="rose" />
        <StatCard label="Bản nháp" value={stats.draftNotes} hint="Chưa xuất bản" icon={FilePenLine} tone="amber" />
        <StatCard label="Block hoạt động" value={stats.activeBlocks} hint="Trên các trang" icon={Blocks} />
        <StatCard label="Media" value={stats.mediaFiles} hint="Ảnh và tài liệu" icon={ImageIcon} tone="emerald" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-slate-200/80 shadow-sm"><CardContent><h2 className="font-bold text-slate-950">Quy trình xuất bản an toàn</h2><div className="mt-5 space-y-4">{["Lưu nội dung thành một version mới", "Xem trước bản nháp và kiểm tra quyền", "Cập nhật published_version_id", "Làm mới cache của trang public"].map((item, index) => <div key={item} className="flex items-center gap-3 text-sm text-slate-600"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">{index + 1}</span>{item}</div>)}</div></CardContent></Card>
        <Card className="border-slate-200/80 bg-slate-950 text-white shadow-sm"><CardContent><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-300">Gợi ý tiếp theo</p><h2 className="mt-3 text-xl font-bold">Kết nối dữ liệu thật</h2><p className="mt-2 text-sm leading-6 text-slate-300">Chạy migration, tạo tài khoản Admin và điền biến môi trường trước khi bắt đầu CRUD.</p><Link href="/admin/settings" className="mt-5 inline-flex text-sm font-bold text-white hover:text-indigo-300">Mở cài đặt →</Link></CardContent></Card>
      </div>
    </div>
  );
}
