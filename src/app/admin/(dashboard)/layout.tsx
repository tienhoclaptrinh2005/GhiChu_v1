import type { Metadata } from "next";

import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireAdmin();
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminHeader displayName={profile.display_name} email={user.email ?? profile.email} />
        <main id="main-content" className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
