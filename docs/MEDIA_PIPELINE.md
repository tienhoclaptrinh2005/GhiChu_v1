# Pipeline ảnh và media

## Luồng xử lý

1. Trình duyệt đọc ảnh nguồn JPEG, PNG, WebP hoặc AVIF, giữ đúng hướng ảnh, resize theo nhóm sử dụng và mã hóa lại thành WebP.
2. API `POST /api/admin/media/presign` chỉ chấp nhận `image/webp` (hoặc PDF trong `attachments`), tạo bản ghi `PENDING` và signed URL cho một object nằm trong thư mục `pending`.
3. Trình duyệt PUT file trực tiếp lên bucket R2 riêng tư. Secret R2 không bao giờ đi xuống client.
4. API `POST /api/admin/media/complete` kiểm tra dung lượng và MIME trong metadata R2, magic bytes, kích thước WebP và mã phiên upload.
5. File hợp lệ được copy sang thư mục `ready`, kiểm tra lại lần cuối rồi mới chuyển bản ghi sang `READY`. File không hợp lệ bị xóa và đánh dấu `FAILED`.

Public/private là quyền đọc metadata và route tải file, không phải quyền trực tiếp trên object. Bucket nên để private. Route công khai chỉ trả signed URL ngắn hạn cho media `PUBLIC + READY`; route Admin yêu cầu phiên đăng nhập.

## Giới hạn mặc định

| Nhóm | Kích thước tối đa | Dung lượng đầu ra | Định dạng lưu |
| --- | ---: | ---: | --- |
| Avatar | 1024×1024 px | 2 MB | WebP |
| Banner | 2560×1440 px | 5 MB | WebP |
| Ảnh ghi chú | 2560×2560 px | 5 MB | WebP |
| Đính kèm | 2560×2560 px | 10 MB | WebP hoặc PDF |

Ảnh nguồn được giới hạn 25 MB để tránh trình duyệt dùng quá nhiều bộ nhớ. `UPLOAD_MAX_FILE_SIZE_MB` là trần toàn cục phía server; giới hạn thực tế là giá trị nhỏ hơn giữa trần này và profile ở bảng trên.

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
- Không cấp public domain trực tiếp cho bucket đang chứa cả file private. Nếu muốn CDN public cố định, nên dùng một bucket public riêng.

## Kiểm thử thủ công cần thiết khi đã có credentials

1. Upload JPEG/PNG lớn và xác nhận file hiển thị là WebP, đúng giới hạn pixel, dung lượng giảm được hiển thị trên UI.
2. Thử upload PDF vào nhóm khác `attachments` và xác nhận bị từ chối.
3. Thử upload quá dung lượng, MIME giả hoặc sửa metadata signed request và xác nhận file không chuyển sang `READY`.
4. Đăng xuất rồi thử route Admin; phải nhận `401` hoặc chuyển tới trang đăng nhập.
5. Với file private, route công khai phải trả `404`; với file public `READY`, route công khai phải redirect tới signed URL ngắn hạn.
