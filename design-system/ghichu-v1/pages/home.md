# Home — Profile Link Hub

> Page override cho `/`. Kế thừa toàn bộ token và component rules trong `../MASTER.md`.

## Mục tiêu

- Cho người xem nhận diện chủ trang và chọn điểm đến trong vài giây.
- Học logic của trang link-in-bio: banner/profile → danh sách liên kết ưu tiên → nội dung sâu hơn.
- Không sao chép thương hiệu, hình ảnh hay nội dung của trang tham chiếu.
- Giữ nguyên nguồn dữ liệu `site_settings`, `page_blocks` và `notes`; chỉ thay đổi cách trình bày.

## Layout

- Reading shell: `max-width: 768px`, căn giữa, một cột ở mọi breakpoint.
- Profile hero: cover 160–192px dạng voxel landscape Sky/Grass/Dirt, theme toggle ở góc phải, avatar `object-contain` trong khung cỏ/đất nhiều lớp chồng mép cover, verified badge xanh dạng răng cưa đặt ngay cạnh tên, headline 3D nhẹ và mô tả ngắn. Không lặp lại social link hoặc CTA phụ trong hero.
- Link stack: mỗi link cao tối thiểu 88px, khoảng cách 16px, icon khối vuông bên trái, cạnh terrain Grass/Dirt, nhãn ở giữa, affordance bên phải.
- Nội dung sau link stack dùng card/section hiện có; danh sách ghi chú tối đa 2 cột trong shell.

## Interaction

- Link nội bộ dùng `next/link`; URL web bên ngoài mở tab mới với `rel="noreferrer"`.
- `mailto:` và `tel:` dùng anchor chuẩn, không ép mở tab mới.
- Hover chỉ dịch chuyển 2px và tăng hard shadow; focus ring dùng token `--ds-focus`.
- Nền public có tối đa 14 block rơi ngẫu nhiên bằng `transform`/`opacity`; mobile chỉ hiển thị 7 block và toàn bộ nằm sau nội dung.
- Tên hồ sơ ráp từng ký tự theo nhịp `steps`, còn liên kết chính phát 4–6 pixel ngắn khi kích hoạt.
- Chuyển theme nội suy nhẹ màu nền, bầu trời, địa hình và mây; không làm mờ hoặc che nội dung.
- Theme toggle là nút icon 44×44px có accessible name, nằm trong profile hero thay cho public header.
- Target chạm không nhỏ hơn 44px; link chính chủ ý lớn hơn để tối ưu thao tác một tay.

## Responsive & accessibility

- 320–639px: padding 16px, icon khối 48px, nội dung link căn giữa và không tràn ngang.
- 640px+: padding 24px, hero/heading tăng một cấp, note list 2 cột.
- Avatar có alt mô tả; cover trang trí có alt rỗng; icon trang trí dùng `aria-hidden`.
- Avatar và cover dùng ảnh responsive có vùng kích thước cố định để tránh layout shift; avatar chỉ có một media đang hoạt động.
- Không áp dụng `image-rendering: pixelated` cho logo/avatar thật; chất voxel nằm ở frame để giữ ảnh rõ nét.
- Khu vực cuối trang chỉ hiển thị tối đa 4 ghi chú vừa công khai, vừa được ghim, mới nhất trước.
- Card ghi chú hiển thị số lượt xem dạng số tabular; trang chi tiết cập nhật lượt xem tại chỗ mà không gây dịch chuyển bố cục.
- Hỗ trợ dark mode bằng semantic tokens, không gắn màu nền canvas cứng.
- `prefers-reduced-motion: reduce` tắt block rơi, ráp tên và pixel burst; nội dung luôn ở trạng thái hoàn chỉnh.
