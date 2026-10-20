# Personal Notes & Link Hub CMS

Bộ khung phát triển website cá nhân kết hợp trang liên kết, kho ghi chú và dashboard quản trị một người dùng. Dự án dùng Next.js App Router, TypeScript, Tailwind CSS, Supabase PostgreSQL/Auth và Cloudflare R2.

## Trạng thái hiện tại

- Có giao diện mẫu responsive cho trang chủ, danh sách ghi chú, chi tiết ghi chú, danh mục và tìm kiếm.
- Có khung dashboard Admin và đầy đủ route theo đặc tả.
- Có luồng đăng nhập/đăng xuất Supabase và lớp bảo vệ route Admin phía server.
- Có schema PostgreSQL, trigger, index và chính sách Row Level Security ban đầu.
- Có pipeline media hoàn chỉnh: resize/chuyển WebP trước upload, signed URL, xác minh object thật và thư viện quản trị.
- Có lớp cấu hình Supabase và R2; không yêu cầu biến môi trường để chạy giao diện public demo local.
- Dữ liệu mẫu chỉ được dùng khi Supabase chưa được cấu hình.

## Bắt đầu nhanh

Yêu cầu Node.js 20.9 trở lên.

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Mở `http://localhost:3000`. Trước khi kết nối dịch vụ thật, ứng dụng sẽ hiển thị dữ liệu demo. Không đưa `.env.local` lên Git.

## Thiết lập Supabase

1. Tạo một dự án Supabase và tắt đăng ký công khai trong Authentication.
2. Chạy các migration trong `supabase/migrations/` theo thứ tự bằng Supabase CLI hoặc SQL Editor.
3. Chạy `supabase/seed.sql` nếu muốn có dữ liệu khởi tạo.
4. Tạo duy nhất một tài khoản trong Supabase Auth.
5. Thêm tài khoản đó vào `public.admin_profiles` theo hướng dẫn trong `supabase/README.md`.
6. Điền URL, anon key, service role key và `ADMIN_EMAIL` vào `.env.local`.

## Thiết lập Cloudflare R2

Tạo bucket **private**, API token chỉ có quyền cần thiết và điền các biến `R2_*`. Sau đó cấu hình CORS để trình duyệt PUT file trực tiếp qua signed URL. Không gắn public domain vào bucket chứa file private.

Ảnh JPEG/PNG/WebP/AVIF được resize và chuyển thành WebP ngay trong trình duyệt trước khi upload. Server vẫn kiểm tra lại dung lượng, MIME, magic bytes và kích thước thật trên R2 trước khi đánh dấu file sẵn sàng. Xem cấu hình CORS, giới hạn và checklist tại [pipeline media](docs/MEDIA_PIPELINE.md).

## Lệnh thường dùng

```bash
npm run dev        # Chạy môi trường phát triển
npm run typecheck  # Kiểm tra TypeScript
npm run lint       # Kiểm tra ESLint
npm run check      # Chạy typecheck và lint
npm run build      # Kiểm tra production build
npm run db:start   # Chạy Supabase local
npm run db:reset   # Áp dụng lại migration và seed local
```

## Cấu trúc chính

```text
src/
  app/
    (public)/             Các route dành cho khách
    admin/(auth)/         Trang đăng nhập
    admin/(dashboard)/    Các route quản trị được bảo vệ
    api/health/           Health check không lộ secret
    auth/callback/        Callback Supabase Auth
  components/
    admin/                Thành phần dashboard
    public/               Thành phần trang công khai
    ui/                   UI primitives dùng lại
  features/               Schema, action và truy vấn theo nghiệp vụ
  lib/
    media/                Profile, chuyển WebP và đọc metadata ảnh
    r2/                   Signed URL, xác minh và quản lý object Cloudflare R2
    supabase/             Client browser/server/admin
  types/                  Kiểu domain và database
supabase/
  migrations/             Schema, index, trigger và RLS
  seed.sql                 Dữ liệu khởi tạo an toàn
docs/                     Kiến trúc, bảo mật và lộ trình
```

## Nguyên tắc bảo mật

- Mọi thao tác ghi phải kiểm tra quyền Admin ở server; việc ẩn nút trên UI không phải là phân quyền.
- Không dùng service role key trong Client Component.
- Không trả dữ liệu `PRIVATE`/`DRAFT` qua truy vấn public.
- Không dùng URL R2 cố định cho file riêng tư.
- Khi xuất bản, luôn tạo version mới và chỉ cập nhật `published_version_id` sau khi version đã lưu thành công.

Xem thêm [kiến trúc](docs/ARCHITECTURE.md), [checklist bảo mật](docs/SECURITY.md) và [lộ trình](docs/ROADMAP.md).
"# GhiChu_v1" 
