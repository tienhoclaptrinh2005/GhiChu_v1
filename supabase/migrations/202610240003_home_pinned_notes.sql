update public.page_blocks
set content = jsonb_set(
  jsonb_set(content, '{limit}', '4'::jsonb, true),
  '{description}',
  to_jsonb('4 ghi chú công khai được ghim gần nhất.'::text),
  true
)
where type = 'NOTE_LIST'
  and page_id in (
    select id
    from public.pages
    where slug = 'home'
  );
