import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { getSiteSettings } from "@/features/site/queries";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      {children}
      <SiteFooter settings={settings} />
    </div>
  );
}
