# GhiChu v1 — Master Design System

> Dùng cho toàn bộ public site và admin. Đây là lớp trình bày; không thay đổi business logic, API hay database.

**Direction:** Modern Retro Pixel Art (8-bit) × Neo-Brutalism  
**Reference:** Hacktoberfest 2026 (lấy cảm hứng từ palette và nhịp poster, không sử dụng logo/tài sản thương hiệu)  
**Design dials:** variance 8/10 · motion 3/10 · density 6/10

## 1. Nguyên tắc

- Khả năng đọc đứng trước trang trí pixel: pixel chỉ xuất hiện ở góc, nhãn nhỏ và họa tiết nền.
- Mọi bề mặt tương tác có viền Ink 2px, hard shadow không blur và focus ring rõ.
- Bento Grid tạo nhịp bất đối xứng ở desktop, tự về một cột ở mobile.
- Không dùng font pixel cho đoạn văn dài hoặc nội dung ghi chú.
- Accent chỉ chiếm tối đa khoảng 15% mỗi màn hình; Forest và Paper là màu nền chủ đạo.
- Motion 150–180ms, dịch chuyển tối đa 2px; tắt khi `prefers-reduced-motion: reduce`.

## 2. Tokens

### Color — Light

| Token | Value | Usage |
|---|---:|---|
| `background` | `#F2F2EB` | nền trắng kem |
| `surface` | `#FFFCF2` | card/input |
| `surface-alt` | `#E3E7DC` | nền phụ |
| `foreground` | `#231F20` | Ink, text và border |
| `muted` | `#56635E` | text phụ |
| `primary` | `#3D5F58` | Forest |
| `primary-deep` | `#2E4742` | Deep Forest |
| `sky` | `#8BB2DE` | thông tin |
| `accent` | `#F5B726` | CTA/selected |
| `pink` | `#E97B77` | điểm nhấn |
| `danger` | `#C62F24` | destructive |

### Color — Dark

| Token | Value | Usage |
|---|---:|---|
| `background` | `#14231D` | nền rêu tối |
| `surface` | `#20372F` | card/input |
| `surface-alt` | `#2E4742` | nền phụ |
| `foreground` | `#F2F2EB` | text chính |
| `muted` | `#C1CBC5` | text phụ |
| `primary` | `#8FB0A7` | trạng thái active |
| `border` | `#090D0B` | viền/hard shadow |

### Typography

- Display: **Chakra Petch**, 600–700, hỗ trợ tiếng Việt; dùng cho heading, số liệu và nhãn retro.
- Body: **Be Vietnam Pro**, 400–700; dùng cho UI và nội dung dài.
- Label: uppercase, 0.12–0.18em letter-spacing; không dùng cho câu dài.
- Reading column: tối đa 70ch, line-height 1.8.

### Shape, border, shadow

- Border: `2px solid var(--border)`.
- Radius: 8px cơ bản; 12px cho hero/card lớn; không dùng pill tràn lan.
- Shadow small: `3px 3px 0 var(--shadow-color)`.
- Shadow default: `5px 5px 0 var(--shadow-color)`.
- Shadow large: `8px 8px 0 var(--shadow-color)`.

### Spacing

4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px. Mobile section 24–32px, desktop 48–64px.

## 3. Components

- **Button:** min-height 44px, border 2px, shadow 3px, font 700. Hover `translate(-2px,-2px)` và shadow tăng 2px; active về vị trí gốc.
- **Input/Select:** min-height 46px, Paper/Surface, border 2px, placeholder đủ tương phản, focus ring 3px Sky.
- **Card:** Surface, border 2px, hard shadow 5px. Card liên kết có hover nhẹ; card tĩnh không nhảy.
- **Badge:** hình chữ nhật bo 4px, border 2px, uppercase/semibold; không dùng pill.
- **Navigation:** public site không dùng header/footer cố định; theme toggle nằm trong profile hero. Admin dùng bottom scrollable nav trên mobile và sidebar trên desktop.
- **Empty state:** luôn có mô tả và hành động hoặc gợi ý tiếp theo; không để vùng kết quả trống.

## 4. Page patterns

- **Home:** Profile link-hub một cột, rộng tối đa 768px; thứ tự profile → liên kết lớn → nội dung bổ sung. Chi tiết ở `pages/home.md`.
- **Notes/Search/Categories:** heading + action, category shortcuts, grid 1/2/3 cột, trạng thái rỗng hữu ích.
- **Note detail:** paper card, reading width 70ch, metadata rõ, code/quote có brutal treatment.
- **Admin:** sidebar Deep Forest; dashboard Bento 2/3 cột; dữ liệu và form giữ phong cách hiện đại, retro chỉ ở nhãn/khung.

## 5. Accessibility & responsive

- Text thường đạt WCAG AA 4.5:1; focus không phụ thuộc màu duy nhất.
- Target chạm tối thiểu 44×44px, icon-only luôn có accessible name.
- Kiểm tra 375, 768, 1024 và 1440px; không có horizontal page scroll.
- `prefers-reduced-motion` vô hiệu animation/transform không thiết yếu.
- Theme được đặt trước first paint và lưu trong `localStorage`; hỗ trợ system preference.
