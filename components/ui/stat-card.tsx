import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "amber" | "emerald" | "blue" | "rose";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const iconBgClasses = {
    default: "bg-zinc-800 text-zinc-300 border-zinc-700",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  };

  const accentBorderClasses = {
    default: "hover:border-zinc-700",
    amber: "hover:border-amber-500/40",
    emerald: "hover:border-emerald-500/40",
    blue: "hover:border-blue-500/40",
    rose: "hover:border-rose-500/40",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-zinc-900/90 border border-zinc-800/90 p-4 sm:p-5 backdrop-blur-md transition-all duration-200 shadow-lg",
        accentBorderClasses[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{title}</p>
          <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{value}</div>
        </div>
        <div className={cn("p-2.5 rounded-xl border", iconBgClasses[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
          {subtitle && <span className="text-zinc-400">{subtitle}</span>}
          {trend && (
            <span
              className={cn(
                "font-semibold flex items-center gap-1",
                trend.isPositive ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
