# Lộ trình phát triển

## Giai đoạn 1 — Nền tảng

- Kết nối Supabase thật và tạo Admin duy nhất.
- Áp dụng migration/RLS, kiểm thử phân quyền.
- [x] Hoàn thiện pipeline R2: WebP trước upload, signed URL, xác minh file và thư viện Media.
- Thay dữ liệu demo bằng dữ liệu thật.

## Giai đoạn 2 — Trang chủ động

- CRUD block, link, banner, card và video.
- Kéo thả bằng dnd-kit, xem trước và bật/tắt block.
- Revalidate cache khi xuất bản thay đổi.

## Giai đoạn 3 — Ghi chú

- Form tạo/sửa, Tiptap editor, category tree và media picker.
- Draft/Private/Public, slug duy nhất, tìm kiếm và phân trang.
- Ghim, nhân bản, ghi chú cha/con và thùng rác.

## Giai đoạn 4 — Version và xuất bản

- Tạo version bất biến cho mỗi lần lưu.
- Preview bản nháp, publish/rollback theo transaction.
- So sánh version và audit log.

## Giai đoạn 5 — Production

- Test tích hợp và test phân quyền.
- SEO, accessibility, image optimization và quan sát lỗi.
- Backup/restore, cảnh báo chi phí và triển khai Vercel.
