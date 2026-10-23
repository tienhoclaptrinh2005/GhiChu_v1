# GhiChu v1 — Master Design System

> Dùng cho toàn bộ public site và admin. Đây là lớp trình bày; không thay đổi business logic, API hay database.

**Direction:** Voxel Pixel Art × 8-bit Educational Game UI

**Reference:** thế giới khối xây dựng và game sandbox (chỉ lấy cảm hứng hình học; không sử dụng logo, texture hay tài sản Minecraft)

**Design dials:** variance 8/10 · motion 3/10 · density 6/10

## 1. Nguyên tắc

- Khả năng đọc đứng trước trang trí: voxel tập trung ở hero, icon, góc card và nền; không áp texture lên đoạn văn dài.
- Mọi bề mặt tương tác có viền Ink 3px, hard shadow không blur, inset highlight tạo chiều sâu khối và focus ring rõ.
- Bento Grid tạo nhịp bất đối xứng ở desktop, tự về một cột ở mobile.
- Không dùng font pixel cho đoạn văn dài hoặc nội dung ghi chú.
- Sky và Grass là hai màu nhận diện; Sun chỉ dùng cho CTA/selected, Dirt tạo chiều sâu khối.
- Motion 150–180ms, dịch chuyển tối đa 2px; tắt khi `prefers-reduced-motion: reduce`.

## 2. Tokens

### Color — Light

| Token | Value | Usage |
|---|---:|---|
| `background` | `#E2F6FF` | nền trời sáng |
| `surface` | `#F9FDFF` | cloud/card/input |
| `surface-alt` | `#D9E9ED` | stone/nền phụ |
| `foreground` | `#10212B` | Ink, text và border |
| `muted` | `#405D69` | text phụ |
| `primary` | `#349B42` | Grass |
| `primary-deep` | `#176033` | Deep Grass |
| `sky` | `#62C4F5` | thông tin/không gian |
| `accent` | `#FFD23F` | Sun/CTA/selected |
| `dirt` | `#A86932` | cạnh khối/trang trí |
| `danger` | `#C83532` | destructive |

### Color — Dark

| Token | Value | Usage |
|---|---:|---|
| `background` | `#0D1C2A` | night sky |
| `surface` | `#162B38` | card/input |
| `surface-alt` | `#223F4B` | stone tối |
| `foreground` | `#F4FBFF` | text chính |
| `muted` | `#BFD4DD` | text phụ |
| `primary` | `#62BD45` | grass sáng |
| `border` | `#071117` | viền/hard shadow |

### Typography

- Display: **Chakra Petch**, 600–700, hỗ trợ tiếng Việt; dùng cho heading, số liệu, nhãn game và hiệu ứng chữ khối 3D nhẹ.
- Body: **Be Vietnam Pro**, 400–700; dùng cho UI và nội dung dài.
- Label: uppercase, 0.12–0.18em letter-spacing; không dùng cho câu dài.
- Reading column: tối đa 70ch, line-height 1.8.

### Shape, border, shadow

- Border: `3px solid var(--border)`.
- Radius: 2–4px để giữ hình khối; không dùng pill cho card, button hoặc input.
- Shadow small: `3px 3px 0 var(--shadow-color)` kèm inset face 2–3px.
- Shadow default: `5–7px 5–7px 0 var(--shadow-color)`.
- Tiêu đề cấp trang có shadow 2 tầng; nội dung đọc không dùng text-shadow.

### Spacing

4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px. Mobile section 24–32px, desktop 48–64px.

## 3. Components

- **Button:** min-height 44px, border 3px, shadow + inset face, font 700. Hover `translate(-2px,-2px)` và shadow tăng 2px; active về vị trí gốc.
- **Input/Select:** min-height 46px, Cloud/Surface, border 3px, placeholder đủ tương phản, focus ring 3px Sky.
- **Card:** Cloud, border 3px, hard shadow 5–7px và cạnh dưới nhẹ. Card liên kết có hover nhẹ; card tĩnh không nhảy.
- **Badge:** hình chữ nhật bo 2px, border 3px, uppercase/semibold; không dùng pill.
- **Voxel landscape:** dùng gradient Sky → Grass → Dirt và pixel cloud CSS; không dùng texture hoặc tài sản game bên thứ ba.
- **Navigation:** public site không dùng header/footer cố định; theme toggle nằm trong profile hero. Admin dùng bottom scrollable nav trên mobile và sidebar trên desktop.
- **Empty state:** luôn có mô tả và hành động hoặc gợi ý tiếp theo; không để vùng kết quả trống.

## 4. Page patterns

- **Home:** Profile link-hub một cột, rộng tối đa 768px; thứ tự profile → liên kết lớn → nội dung bổ sung. Chi tiết ở `pages/home.md`.
- **Notes/Search/Categories:** heading + action, category shortcuts, grid 1/2/3 cột, trạng thái rỗng hữu ích.
- **Note detail:** cloud card, reading width 70ch, metadata rõ, code/quote có voxel-frame treatment.
- **Admin:** sidebar Grass/Dirt như inventory panel; dashboard Bento 2/3 cột; dữ liệu và form giữ khả năng quét nhanh, voxel chỉ ở nhãn/khung/icon.

## 5. Accessibility & responsive

- Text thường đạt WCAG AA 4.5:1; focus không phụ thuộc màu duy nhất.
- Target chạm tối thiểu 44×44px, icon-only luôn có accessible name.
- Kiểm tra 375, 768, 1024 và 1440px; không có horizontal page scroll.
- `prefers-reduced-motion` vô hiệu animation/transform không thiết yếu.
- Theme được đặt trước first paint và lưu trong `localStorage`; hỗ trợ system preference.
