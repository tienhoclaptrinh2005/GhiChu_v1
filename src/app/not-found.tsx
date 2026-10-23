import { ArrowLeft, FileQuestion } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main-content" className="grid min-h-screen place-items-center px-4">
      <div className="max-w-md text-center">
        <span className="voxel-icon mx-auto grid size-16 place-items-center bg-pink text-[#10212b]">
          <FileQuestion className="size-7" />
        </span>
        <p className="retro-label mt-7">Lỗi 404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">Không tìm thấy trang</h1>
        <p className="mt-3 leading-7 text-muted">Nội dung có thể đã được đổi đường dẫn, chuyển sang riêng tư hoặc đưa vào thùng rác.</p>
        <Link href="/" className={`${buttonVariants({ variant: "primary" })} mt-6`}>
          <ArrowLeft className="size-4" />
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}
