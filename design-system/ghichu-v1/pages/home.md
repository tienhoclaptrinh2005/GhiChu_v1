# Home — Profile Link Hub

> Page override cho `/`. Kế thừa toàn bộ token và component rules trong `../MASTER.md`.

## Mục tiêu

- Cho người xem nhận diện chủ trang và chọn điểm đến trong vài giây.
- Học logic của trang link-in-bio: banner/profile → danh sách liên kết ưu tiên → nội dung sâu hơn.
- Không sao chép thương hiệu, hình ảnh hay nội dung của trang tham chiếu.
- Giữ nguyên nguồn dữ liệu `site_settings`, `page_blocks` và `notes`; chỉ thay đổi cách trình bày.

## Layout

- Reading shell: `max-width: 768px`, căn giữa, một cột ở mọi breakpoint.
- Profile hero: cover 160–192px dạng voxel landscape Sky/Grass/Dirt, theme toggle ở góc phải, avatar khối chồng mép cover, tên + verified mark, headline 3D nhẹ, mô tả và anchor xuống nội dung.
- Link stack: mỗi link cao tối thiểu 88px, khoảng cách 16px, icon khối vuông bên trái, cạnh terrain Grass/Dirt, nhãn ở giữa, affordance bên phải.
- Nội dung sau link stack dùng card/section hiện có; danh sách ghi chú tối đa 2 cột trong shell.

## Interaction

- Link nội bộ dùng `next/link`; URL web bên ngoài mở tab mới với `rel="noreferrer"`.
- `mailto:` và `tel:` dùng anchor chuẩn, không ép mở tab mới.
- Hover chỉ dịch chuyển 2px và tăng hard shadow; focus ring dùng token `--ds-focus`.
- Theme toggle là nút icon 44×44px có accessible name, nằm trong profile hero thay cho public header.
- Target chạm không nhỏ hơn 44px; link chính chủ ý lớn hơn để tối ưu thao tác một tay.

## Responsive & accessibility

- 320–639px: padding 16px, icon khối 48px, nội dung link căn giữa và không tràn ngang.
- 640px+: padding 24px, hero/heading tăng một cấp, note list 2 cột.
- Avatar có alt mô tả; cover trang trí có alt rỗng; icon trang trí dùng `aria-hidden`.
- Hỗ trợ dark mode bằng semantic tokens, không gắn màu nền canvas cứng.
