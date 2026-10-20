# Kiến trúc dự án

## Ranh giới hệ thống

- **Next.js** phục vụ UI, Server Components, Server Actions và Route Handlers.
- **Supabase Auth** xác thực một tài khoản quản trị.
- **Supabase PostgreSQL** là nguồn dữ liệu chuẩn cho cấu hình, block, ghi chú, version và metadata file.
- **Cloudflare R2** lưu object; PostgreSQL chỉ lưu object key và metadata.
- **Vercel** build và chạy ứng dụng. Dữ liệu không được lưu trên filesystem của function.

## Luồng đọc công khai

Route public chỉ dùng anon key và được giới hạn bởi RLS. Chỉ page đã xuất bản, block đang bật, note `PUBLIC` và đúng published version được phép trả về. Dữ liệu demo chỉ hoạt động khi chưa cấu hình Supabase.

## Luồng quản trị

1. Supabase Auth xác thực email/password.
2. Server kiểm tra `auth.uid()` có bản ghi `admin_profiles.is_active = true` và khớp `ADMIN_EMAIL`.
3. Server Action/Route Handler validate input bằng Zod.
4. Database tiếp tục chặn truy cập bằng RLS.
5. Thao tác quan trọng được ghi vào `audit_logs`.

## Mô hình xuất bản ghi chú

`notes.current_version_id` trỏ đến bản chỉnh sửa gần nhất; `notes.published_version_id` trỏ đến bản đang công khai. Nhờ vậy Admin có thể tiếp tục sửa bản nháp mà khách vẫn đọc phiên bản ổn định. Mỗi lần lưu tạo một hàng mới trong `note_versions`.

## Mô hình trang động

`pages` đại diện cho một trang; `page_blocks` chứa block có kiểu, nội dung JSON, style JSON, trạng thái và vị trí. Renderer public chỉ hỗ trợ danh sách block đã định nghĩa, không thực thi CSS/JavaScript tùy ý.

## Vòng đời media

Ảnh được resize và mã hóa WebP ở client, sau đó upload thẳng tới prefix R2 `pending` bằng signed URL. Server đọc lại object để kiểm tra metadata, dung lượng, MIME, magic bytes và kích thước; object hợp lệ được copy sang `ready`, kiểm tra lần hai rồi mới cập nhật PostgreSQL sang `READY`. Route đọc chỉ phục vụ file `READY` và áp dụng điều kiện `PUBLIC` hoặc quyền Admin tương ứng.

## Quy ước module

- `app`: routing và composition, không chứa logic truy cập dữ liệu dài.
- `features`: nghiệp vụ theo domain, validation và data access.
- `lib`: tích hợp hạ tầng và helper dùng chung.
- `components`: trình bày; Server Component là mặc định.
- `types/database.ts`: kiểu bám theo schema, có thể thay bằng output Supabase CLI khi schema ổn định.
