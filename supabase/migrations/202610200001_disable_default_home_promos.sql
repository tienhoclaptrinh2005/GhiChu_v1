-- Keep the reusable BANNER and CARD block types, but hide the two original
-- promotional blocks from databases that were initialized with the old seed.
update public.page_blocks
set is_active = false
where id in (
  '20000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000003'
);

update public.page_blocks
set position = case id
  when '20000000-0000-4000-8000-000000000002' then 0
  when '20000000-0000-4000-8000-000000000004' then 1
  else position
end
where id in (
  '20000000-0000-4000-8000-000000000002',
  '20000000-0000-4000-8000-000000000004'
);
