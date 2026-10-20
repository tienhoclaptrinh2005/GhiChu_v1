import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Chakra_Petch } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const bodyFont = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = Chakra_Petch({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  variable: "--font-retro",
  display: "swap",
});

const themeScript = `(function(){try{var k="ghichu-theme";var s=localStorage.getItem(k);var t=s==="light"||s==="dark"?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");var r=document.documentElement;r.setAttribute("data-theme",t);r.style.colorScheme=t}catch(e){}})()`;

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
  themeColor: "#3d5f58",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="vi"
      data-theme="light"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans">
        <a href="#main-content" className="skip-link">Bỏ qua đến nội dung</a>
        {children}
        <Toaster richColors position="top-right" toastOptions={{ className: "retro-toast" }} />
      </body>
    </html>
  );
}
