# Cấu hình biến môi trường

Ứng dụng đọc biến môi trường từ file `.env.local` ở thư mục gốc. Không đặt file env trong `src/` và không commit `.env.local` lên Git.

## 1. Tạo file local

Trong PowerShell, chạy:

```powershell
Copy-Item .env.example .env.local
```

File hoàn chỉnh có cấu trúc:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
ADMIN_EMAIL=admin@example.com

R2_ACCOUNT_ID=<cloudflare-account-id>
R2_ACCESS_KEY_ID=<r2-access-key-id>
R2_SECRET_ACCESS_KEY=<r2-secret-access-key>
R2_BUCKET_NAME=ghichu-media
R2_PUBLIC_BASE_URL=

R2_SIGNED_URL_TTL_SECONDS=900
UPLOAD_MAX_FILE_SIZE_MB=10
```

Không giữ dấu `< >` trong giá trị thật. Sau khi đổi env, khởi động lại `npm run dev`.

## 2. Ý nghĩa và nơi lấy giá trị

| Biến | Phạm vi | Bắt buộc khi | Nguồn giá trị |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public | Luôn có | `http://localhost:3000` khi dev; domain HTTPS khi production |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Dùng Supabase | Supabase Project Connect hoặc Settings → API Keys |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public | Dùng Supabase | Publishable key `sb_publishable_...` trong Supabase |
| `SUPABASE_SECRET_KEY` | Server-only | Admin/API server | Secret key `sb_secret_...` trong Supabase; bypass RLS |
| `ADMIN_EMAIL` | Server-only | Đăng nhập Admin | Email Auth đã có bản ghi active trong `admin_profiles` |
| `R2_ACCOUNT_ID` | Server-only | Upload media | Cloudflare Account ID |
| `R2_ACCESS_KEY_ID` | Server-only | Upload media | R2 API token credentials |
| `R2_SECRET_ACCESS_KEY` | Server-only | Upload media | R2 API token credentials; chỉ hiển thị một lần khi tạo |
| `R2_BUCKET_NAME` | Server-only | Upload media | Tên bucket private chứa media |
| `R2_PUBLIC_BASE_URL` | Server-only | Tùy chọn | Để trống với pipeline bucket private hiện tại |
| `R2_SIGNED_URL_TTL_SECONDS` | Server-only | Tùy chọn | `900`; hợp lệ từ 60 đến 3600 giây |
| `UPLOAD_MAX_FILE_SIZE_MB` | Server-only | Tùy chọn | `10`; phải lớn hơn `0` và tối đa `100` MB |

Supabase hiện khuyến nghị Publishable/Secret keys. Mã nguồn vẫn nhận tạm hai tên cũ `NEXT_PUBLIC_SUPABASE_ANON_KEY` và `SUPABASE_SERVICE_ROLE_KEY` để không làm hỏng cấu hình đang chạy, nhưng cấu hình mới nên dùng tên trong bảng trên.

## 3. Thiết lập Supabase

1. Mở Project Connect để lấy Project URL và Publishable key.
2. Vào Settings → API Keys để tạo hoặc lấy Secret key dành riêng cho backend.
3. Tạo user Admin trong Authentication → Users.
4. Thêm user đó vào `public.admin_profiles` theo `supabase/README.md`.
5. Đặt email giống hệt vào `ADMIN_EMAIL`.
6. Chỉ đặt Publishable key trong biến bắt đầu bằng `NEXT_PUBLIC_`; Secret key tuyệt đối không được đưa xuống client.

## 4. Thiết lập Cloudflare R2

1. Tạo một bucket private, ví dụ `ghichu-media`.
2. Trong R2 → Manage API Tokens, tạo token `Object Read & Write` và giới hạn token cho đúng bucket.
3. Sao chép Access Key ID và Secret Access Key ngay khi tạo token.
4. Điền Account ID, hai credential và bucket name vào `.env.local`.
5. Giữ `R2_PUBLIC_BASE_URL` trống với kiến trúc private hiện tại.
6. Cấu hình CORS theo `docs/MEDIA_PIPELINE.md` cho localhost và domain production.

## 5. Local và production

- Local dùng `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.
- Production dùng URL HTTPS thật, ví dụ `https://notes.example.com`.
- Biến `NEXT_PUBLIC_*` được đóng vào client bundle tại thời điểm build, vì vậy phải cấu hình đúng trước khi chạy `npm run build` trên nền tảng deploy.
- Không tự đặt `NODE_ENV`; Next.js tự chọn `development`, `production` hoặc `test`.
- Nếu chưa cấu hình Supabase, public site vẫn chạy bằng dữ liệu demo; trang `/login` sẽ thông báo chưa cấu hình.

## 6. Kiểm tra an toàn

```powershell
npm run check
npm run build
```

Mở `http://localhost:3000/api/health` để kiểm tra cờ cấu hình. Route này không trả giá trị secret. Nếu một secret từng bị commit hoặc gửi nhầm, hãy thu hồi/rotate tại Supabase hoặc Cloudflare thay vì chỉ xóa khỏi file.
