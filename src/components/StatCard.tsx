import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({ icon: Icon, label, value, hint, tone = "primary", children }: {
  icon: LucideIcon; label: string; value: ReactNode; hint?: ReactNode; tone?: "primary" | "accent" | "warning" | "destructive"; children?: ReactNode;
}) {
  const toneCls = { primary: "text-primary bg-primary/10", accent: "text-accent bg-accent/10", warning: "text-warning bg-warning/10", destructive: "text-destructive bg-destructive/10" }[tone];
  return (
    <div className="min-w-0 rounded-2xl border bg-gradient-surface p-4 shadow-card sm:p-5">
      <div className="flex items-center gap-3">
        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", toneCls)}><Icon className="h-5 w-5" /></span>
        <span className="min-w-0 text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="mt-4 break-words font-display text-2xl font-bold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
      {children}
    </div>
  );
}

export function Bar({ value, max, tone = "primary" }: { value: number; max: number; tone?: "primary" | "accent" }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  return (
    <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
      <div className={cn("h-full rounded-full transition-all", tone === "primary" ? "bg-primary" : "bg-accent")} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="break-words text-2xl font-bold md:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function Panel({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0 rounded-2xl border bg-gradient-surface p-4 shadow-card sm:p-5", className)}>
      {title && <h2 className="mb-4 font-semibold">{title}</h2>}
      {children}
    </div>
  );
}
