import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NoteSpace — Personal Notes & Link Hub",
    template: "%s · NoteSpace",
  },
  description:
    "Trang liên kết cá nhân và kho ghi chú được quản lý động bằng dashboard riêng.",
  applicationName: "NoteSpace",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    title: "NoteSpace — Personal Notes & Link Hub",
    description: "Ghi chú, tài nguyên và liên kết hữu ích trong một không gian gọn gàng.",
    url: siteUrl,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f7fb",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <a href="#main-content" className="skip-link">Bỏ qua đến nội dung</a>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
