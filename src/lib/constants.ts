import {
  Blocks,
  BookOpenText,
  Files,
  FolderTree,
  ImageIcon,
  LayoutDashboard,
  Link2,
  Settings,
} from "lucide-react";

export const publicNavigation = [
  { href: "/", label: "Trang chủ" },
  { href: "/notes", label: "Ghi chú" },
  { href: "/categories", label: "Danh mục" },
];

export const adminNavigation = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/pages", label: "Trang & block", icon: Blocks },
  { href: "/admin/notes", label: "Ghi chú", icon: BookOpenText },
  { href: "/admin/categories", label: "Danh mục", icon: FolderTree },
  { href: "/admin/links", label: "Liên kết", icon: Link2 },
  { href: "/admin/banners", label: "Banner", icon: Files },
  { href: "/admin/media", label: "Thư viện", icon: ImageIcon },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
];
