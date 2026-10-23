# Pipeline ảnh và media

## Luồng xử lý

1. Trình duyệt đọc ảnh nguồn JPEG, PNG, WebP hoặc AVIF, giữ đúng hướng ảnh, resize theo nhóm sử dụng và mã hóa lại thành WebP.
2. API `POST /api/admin/media/presign` chỉ chấp nhận `image/webp` (hoặc PDF trong `attachments`), tạo bản ghi `PENDING` và signed URL cho một object nằm trong thư mục `pending`.
3. Trình duyệt PUT file trực tiếp lên bucket R2 riêng tư. Secret R2 không bao giờ đi xuống client.
4. API `POST /api/admin/media/complete` kiểm tra dung lượng và MIME trong metadata R2, magic bytes, kích thước WebP và mã phiên upload.
5. File hợp lệ được copy sang thư mục `ready`, kiểm tra lại lần cuối rồi mới chuyển bản ghi sang `READY`. File không hợp lệ bị xóa và đánh dấu `FAILED`.
6. Với nhóm `avatars`, file luôn được đặt thành `PUBLIC` và tự gắn vào `site_settings.avatar_media_id`. Trang chủ chỉ có một ảnh đại diện đang hoạt động; upload avatar mới sẽ thay liên kết đang dùng, còn file cũ vẫn nằm trong thư viện.

`media_files` chỉ lưu `object_key`, ví dụ `avatars/ready/2026-10-23/<uuid>.webp`; database không lưu hostname, signed URL hoặc URL tuyệt đối. Với media `PUBLIC + READY`, server ghép `R2_PUBLIC_BASE_URL` để tạo URL CDN như `https://media.vmtshop.tech/<object_key>`. Vì vậy đổi domain website không ảnh hưởng đường dẫn ảnh, còn đổi domain media chỉ cần cập nhật biến môi trường. Route `/api/media/<id>` được giữ để tương thích ngược và chuyển hướng thẳng tới CDN, không proxy byte ảnh qua Next.js.

Object công khai dùng `Cache-Control: public, max-age=31536000, immutable`. Object key chứa UUID và không bị ghi đè, nên trình duyệt và Cloudflare có thể cache dài hạn an toàn. File private tiếp tục được tải bằng route Admin có xác thực và signed URL ngắn hạn.

## Giới hạn mặc định

| Nhóm | Kích thước tối đa | Dung lượng đầu ra | Định dạng lưu |
| --- | ---: | ---: | --- |
| Avatar | 512×512 px | 1 MB | WebP |
| Banner | 2560×1440 px | 5 MB | WebP |
| Ảnh ghi chú | 2560×2560 px | 5 MB | WebP |
| Đính kèm | 2560×2560 px | 10 MB | WebP hoặc PDF |

Ảnh nguồn được giới hạn 25 MB để tránh trình duyệt dùng quá nhiều bộ nhớ. `UPLOAD_MAX_FILE_SIZE_MB` là trần toàn cục phía server; giới hạn thực tế là giá trị nhỏ hơn giữa trần này và profile ở bảng trên.

WebP thường nhẹ hơn JPEG/PNG khi hiển thị trên web, nhưng không phải mọi ảnh đều giảm giống nhau. Pipeline vẫn resize theo mục đích, hạ quality theo từng bước và hiển thị dung lượng trước/sau. Ở trang chủ, `next/image` tiếp tục tạo đúng kích thước hiển thị và cache bản tối ưu; ví dụ avatar 512px không bị tải nguyên kích thước cho khung 112–128px.

## CORS cho Cloudflare R2

Thay domain production bằng domain thật rồi cấu hình CORS cho bucket:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-domain.example"
    ],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": [
      "Content-Type",
      "Cache-Control",
      "x-amz-meta-media-id"
    ],
    "ExposeHeaders": ["etag"],
    "MaxAgeSeconds": 3600
  }
]
```

Không dùng wildcard origin trong production. Nếu frontend có nhiều domain hợp lệ, liệt kê từng domain.

## Vận hành

- Áp dụng migration `202610150002_media_pipeline.sql` trước khi dùng trang Media mới.
- Thiết lập lifecycle rule trên R2 để xóa object khớp prefix `avatars/pending/`, `banners/pending/`, `notes/pending/` và `attachments/pending/` sau 1 ngày. Đây là lớp dọn rác cho trường hợp trình duyệt đóng trước khi gọi API hoàn tất.
- Theo dõi bản ghi `FAILED` và `PENDING` hết hạn. Có thể xóa chúng từ thư viện Admin.
- Khi đổi giới hạn, cập nhật `src/lib/media/config.ts`; server và trình duyệt đang dùng chung cấu hình này.
- Nên dành bucket gắn `media.vmtshop.tech` cho media công khai. File thật sự riêng tư nên nằm trong bucket private riêng; chỉ đặt `visibility = PRIVATE` trong database không thể chặn truy cập trực tiếp nếu object vẫn nằm trong một bucket đã public toàn bộ.

## Kiểm thử thủ công cần thiết khi đã có credentials

1. Upload JPEG/PNG lớn và xác nhận file hiển thị là WebP, đúng giới hạn pixel, dung lượng giảm được hiển thị trên UI.
2. Thử upload PDF vào nhóm khác `attachments` và xác nhận bị từ chối.
3. Thử upload quá dung lượng, MIME giả hoặc sửa metadata signed request và xác nhận file không chuyển sang `READY`.
4. Đăng xuất rồi thử route Admin; phải nhận `401` hoặc chuyển tới trang đăng nhập.
5. Với file private, route công khai phải trả `404`; với file public `READY`, route công khai phải chuyển hướng tới `https://media.vmtshop.tech/<object_key>` và không tạo signed URL.
6. Upload avatar rồi tải lại `/`; ảnh mới phải xuất hiện ngay và `/admin/settings` phải chỉ đánh dấu một ảnh đang dùng.
