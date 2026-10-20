import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function StatCard({ label, value, hint, icon: Icon, tone = "indigo" }: { label: string; value: number; hint: string; icon: LucideIcon; tone?: "indigo" | "emerald" | "amber" | "rose" }) {
  const colors = {
    indigo: "bg-sky text-[#17212c]",
    emerald: "bg-forest text-[var(--ds-on-forest)]",
    amber: "bg-accent text-[#231f20]",
    rose: "bg-pink text-[#231f20]",
  };
  return (
    <Card className="transition-transform duration-150 hover:-translate-y-0.5">
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-muted">{label}</p>
            <p className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">{value}</p>
            <p className="mt-1 text-xs text-muted">{hint}</p>
          </div>
          <span className={`grid size-11 place-items-center rounded-md border-2 border-line shadow-[3px_3px_0_var(--ds-shadow)] ${colors[tone]}`}>
            <Icon className="size-5" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
