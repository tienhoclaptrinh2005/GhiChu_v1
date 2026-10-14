import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function StatCard({ label, value, hint, icon: Icon, tone = "indigo" }: { label: string; value: number; hint: string; icon: LucideIcon; tone?: "indigo" | "emerald" | "amber" | "rose" }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <Card className="border-slate-200/80 shadow-sm">
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</p>
            <p className="mt-1 text-xs text-slate-400">{hint}</p>
          </div>
          <span className={`grid size-11 place-items-center rounded-xl ${colors[tone]}`}>
            <Icon className="size-5" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
