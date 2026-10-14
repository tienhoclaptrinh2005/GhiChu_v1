# Supabase setup

## Local

1. Cài Docker Desktop và Supabase CLI.
2. Chạy `npm run db:start`.
3. Chạy `npm run db:reset` để áp dụng migration và seed.
4. Lấy local URL/keys từ output của CLI và điền vào `.env.local`.

Public sign-up đã bị tắt trong `config.toml`. Để kiểm tra đăng nhập local, tạo user trong Supabase Studio hoặc Admin API.

## Cloud project

Áp dụng file migration bằng Supabase CLI đã link project hoặc dán vào SQL Editor. Sau đó tạo duy nhất một user trong Authentication > Users.

Chạy câu SQL sau trong SQL Editor, thay email bằng tài khoản đã tạo:

```sql
insert into public.admin_profiles (user_id, email, display_name)
select id, lower(email), 'Admin'
from auth.users
where lower(email) = lower('you@example.com')
on conflict (user_id) do update
set email = excluded.email,
    display_name = excluded.display_name,
    is_active = true;
```

Đặt cùng email đó vào `ADMIN_EMAIL`. Không dùng trigger tự động cấp Admin cho user mới: dự án chủ ý yêu cầu thao tác cấp quyền rõ ràng và chỉ có một tài khoản.

## Kiểm tra RLS

Trước production, xác minh bằng anon key rằng:

- Chỉ note `PUBLIC` và `published_version_id` tương ứng được đọc.
- Note `PRIVATE`, `DRAFT`, version cũ và audit log không trả dữ liệu.
- Không thể insert/update/delete bất kỳ bảng nội dung nào.

Sau đó xác minh user Auth không có `admin_profiles` cũng bị từ chối mọi thao tác quản trị.
