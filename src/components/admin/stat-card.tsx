import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function StatCard({ label, value, hint, icon: Icon, tone = "indigo" }: { label: string; value: number; hint: string; icon: LucideIcon; tone?: "indigo" | "emerald" | "amber" | "rose" }) {
  const colors = {
    indigo: "bg-sky text-[#10212b]",
    emerald: "bg-forest text-[var(--ds-on-forest)]",
    amber: "bg-accent text-[#10212b]",
    rose: "bg-pink text-[#10212b]",
  };
  return (
    <Card className="transition-transform duration-150 hover:-translate-y-0.5">
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-muted">{label}</p>
            <p className="voxel-title mt-2 text-4xl text-ink">{value}</p>
            <p className="mt-1 text-xs text-muted">{hint}</p>
          </div>
          <span className={`voxel-icon grid size-11 place-items-center ${colors[tone]}`}>
            <Icon className="size-5" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
