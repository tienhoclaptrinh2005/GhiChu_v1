insert into public.site_settings (
  id,
  display_name,
  headline,
  description,
  theme,
  social_links,
  is_public
)
values (
  1,
  'Minh An',
  'Ghi lại điều hữu ích. Chia sẻ điều đáng nhớ.',
  'Một góc nhỏ dành cho ghi chú công nghệ, tài nguyên thực hành và những liên kết mình thường xuyên sử dụng.',
  '{"accent":"#5b5cf0","radius":"rounded","mode":"light"}'::jsonb,
  '[
    {"label":"Facebook","href":"https://facebook.com","icon":"facebook"},
    {"label":"Telegram","href":"https://telegram.org","icon":"send"},
    {"label":"Email","href":"mailto:hello@example.com","icon":"mail"}
  ]'::jsonb,
  true
)
on conflict (id) do update set
  display_name = excluded.display_name,
  headline = excluded.headline,
  description = excluded.description,
  theme = excluded.theme,
  social_links = excluded.social_links,
  is_public = excluded.is_public;

insert into public.pages (id, title, slug, status, seo_title, seo_description, published_at)
values (
  '10000000-0000-4000-8000-000000000001',
  'Trang chủ',
  'home',
  'PUBLISHED',
  'NoteSpace — Personal Notes & Link Hub',
  'Ghi chú, tài nguyên và liên kết hữu ích trong một không gian gọn gàng.',
  now()
)
on conflict (slug) do nothing;

insert into public.page_blocks (id, page_id, type, name, content, styles, position, is_active)
values
  (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'BANNER',
    'Thông báo nổi bật',
    '{"eyebrow":"Bắt đầu tại đây","title":"Kho ghi chú đang được cập nhật mỗi tuần","description":"Tổng hợp hướng dẫn ngắn gọn, ví dụ thực tế và những tài nguyên đã được chọn lọc.","href":"/notes","actionLabel":"Khám phá ghi chú"}'::jsonb,
    '{"tone":"indigo"}'::jsonb,
    0,
    true
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    'BUTTON',
    'Liên kết nhanh',
    '{"layout":"grid","items":[{"title":"Nhóm cộng đồng","description":"Trao đổi và cập nhật tài nguyên mới","href":"https://telegram.org","icon":"message-circle","external":true},{"title":"Tất cả ghi chú","description":"Duyệt theo chủ đề hoặc tìm kiếm","href":"/notes","icon":"notebook-tabs","external":false},{"title":"Danh mục","description":"Đi thẳng đến chủ đề bạn quan tâm","href":"/categories","icon":"folder-tree","external":false}]}'::jsonb,
    '{}'::jsonb,
    1,
    true
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000001',
    'CARD',
    'Lời nhắn',
    '{"icon":"sparkles","title":"Nội dung ngắn, đủ ý và có thể áp dụng","text":"Mỗi ghi chú tập trung vào một vấn đề cụ thể. Nếu có phần chưa rõ, bạn có thể dùng các kênh liên hệ ở cuối trang."}'::jsonb,
    '{"tone":"mint"}'::jsonb,
    2,
    true
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000001',
    'NOTE_LIST',
    'Ghi chú nổi bật',
    '{"title":"Ghi chú nổi bật","description":"Một vài bài được ghim để bạn bắt đầu nhanh.","limit":3}'::jsonb,
    '{}'::jsonb,
    3,
    true
  )
on conflict (id) do nothing;

insert into public.categories (id, name, slug, description, color, position)
values
  ('30000000-0000-4000-8000-000000000001', 'Next.js', 'nextjs', 'App Router, Server Components và production.', '#5b5cf0', 0),
  ('30000000-0000-4000-8000-000000000002', 'Backend', 'backend', 'API, cơ sở dữ liệu và bảo mật phía server.', '#0f9f75', 1),
  ('30000000-0000-4000-8000-000000000003', 'Công cụ', 'cong-cu', 'Quy trình và công cụ làm việc hằng ngày.', '#e9753d', 2)
on conflict (slug) do nothing;

insert into public.notes (
  id, title, slug, excerpt, status, is_pinned, reading_time_minutes
)
values
  (
    '40000000-0000-4000-8000-000000000001',
    'Bắt đầu dự án Next.js theo cách dễ bảo trì',
    'bat-dau-du-an-nextjs',
    'Một cấu trúc thực tế cho App Router để dự án lớn lên không bị rối.',
    'DRAFT',
    true,
    6
  ),
  (
    '40000000-0000-4000-8000-000000000002',
    'Checklist bảo mật Supabase cho ứng dụng cá nhân',
    'checklist-bao-mat-supabase',
    'RLS, service role và những lỗi cấu hình cần rà soát trước khi public.',
    'DRAFT',
    true,
    8
  )
on conflict (slug) do nothing;

insert into public.note_versions (
  id, note_id, version_number, title, content, plain_text, change_summary
)
values
  (
    '50000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001',
    1,
    'Bắt đầu dự án Next.js theo cách dễ bảo trì',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Bắt đầu với ranh giới module rõ ràng và giữ route thật mỏng."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Tư duy chính"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Tách route, feature, hạ tầng và component."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Kiểm tra quyền ở server và database."}]}]}]}]}'::jsonb,
    'Bắt đầu với ranh giới module rõ ràng và giữ route thật mỏng. Tách route, feature, hạ tầng và component. Kiểm tra quyền ở server và database.',
    'Phiên bản đầu tiên'
  ),
  (
    '50000000-0000-4000-8000-000000000002',
    '40000000-0000-4000-8000-000000000002',
    1,
    'Checklist bảo mật Supabase cho ứng dụng cá nhân',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"RLS là lớp bắt buộc, không chỉ là một tùy chọn khi dùng Supabase từ trình duyệt."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Kiểm tra trước production"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Tắt public sign-up."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Không gửi service role xuống client."}]}]}]}]}'::jsonb,
    'RLS là lớp bắt buộc. Tắt public sign-up. Không gửi service role xuống client.',
    'Phiên bản đầu tiên'
  )
on conflict (id) do nothing;

update public.notes
set current_version_id = '50000000-0000-4000-8000-000000000001',
    published_version_id = '50000000-0000-4000-8000-000000000001',
    status = 'PUBLIC',
    published_at = now()
where id = '40000000-0000-4000-8000-000000000001';

update public.notes
set current_version_id = '50000000-0000-4000-8000-000000000002',
    published_version_id = '50000000-0000-4000-8000-000000000002',
    status = 'PUBLIC',
    published_at = now()
where id = '40000000-0000-4000-8000-000000000002';

insert into public.note_categories (note_id, category_id)
values
  ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001'),
  ('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002')
on conflict do nothing;
