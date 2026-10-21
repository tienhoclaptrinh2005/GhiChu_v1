# Checklist bảo mật

## Trước khi đưa lên production

- [ ] Tắt public sign-up trong Supabase Auth.
- [ ] Chỉ có một `admin_profiles` đang hoạt động.
- [ ] `ADMIN_EMAIL` khớp chính xác tài khoản Auth.
- [ ] Chỉ Supabase Publishable key nằm trong biến bắt đầu bằng `NEXT_PUBLIC_`; Secret key luôn là server-only.
- [ ] Chạy và kiểm tra toàn bộ RLS policy bằng cả anon và authenticated token.
- [ ] Mọi Server Action ghi dữ liệu đều gọi `requireAdmin()` và validate Zod.
- [ ] Route nhận ID kiểm tra quyền với chính tài nguyên đó để tránh IDOR.
- [ ] Rich text chỉ render từ cấu trúc Tiptap cho phép; không dùng HTML chưa sanitize.
- [ ] File private dùng object key khó đoán và signed URL có TTL ngắn.
- [ ] Ảnh chỉ được cấp signed upload khi đã thành WebP; server kiểm tra MIME, magic bytes, dung lượng, kích thước pixel và metadata phiên upload.
- [ ] Bucket R2 là private; CORS chỉ cho phép đúng origin production và các header upload cần thiết.
- [ ] Có lifecycle rule xóa object trong các prefix `*/pending/` sau 1 ngày.
- [ ] Bật rate limit cho login, upload, search và action nhạy cảm.
- [ ] Header `noindex` áp dụng cho Admin và nội dung private.
- [ ] Log không chứa token, password, service key hoặc signed URL còn hiệu lực.
- [ ] Có backup PostgreSQL và R2 độc lập; thực hành restore định kỳ.
- [ ] Xác nhận cache public bị làm mới khi xuất bản/hủy xuất bản.

## Ma trận kiểm thử tối thiểu

Kiểm thử ba trạng thái: khách chưa đăng nhập, user Auth không có quyền Admin và Admin hợp lệ. Mỗi trạng thái phải được thử với đọc trực tiếp API/database, không chỉ qua giao diện.
