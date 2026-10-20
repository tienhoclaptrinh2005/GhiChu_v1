import { ArrowRight, Construction, Plus } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export function CollectionPlaceholder({ title, description, createHref, createLabel, features }: { title: string; description: string; createHref?: string; createLabel?: string; features: string[] }) {
  return (
    <div className="space-y-7">
      <PageHeader
        title={title}
        description={description}
        action={createHref ? (
          <Link href={createHref} className={buttonVariants({ variant: "accent" })}>
            <Plus className="size-4" />
            {createLabel || "Tạo mới"}
          </Link>
        ) : undefined}
      />
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="grid size-14 place-items-center rounded-md border-2 border-line bg-accent text-[#231f20] shadow-[4px_4px_0_var(--ds-shadow)]">
              <Construction className="size-6" />
            </span>
            <h2 className="mt-5 text-lg font-bold text-ink">Module đã sẵn sàng để triển khai</h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-muted">
              Route, layout và ranh giới bảo mật đã có. Bước tiếp theo là nối form và Server Action vào schema Supabase.
            </p>
          </div>
          <div className="border-t-2 border-line bg-surface-alt px-5 py-4 sm:px-6">
            <p className="mb-3 font-display text-xs font-bold uppercase tracking-[0.14em] text-muted">Phạm vi module</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-muted">
                  <ArrowRight className="size-3.5 text-forest" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
