import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "gradeA" | "gradeB" | "defect" | "ready" | "booked" | "sold" | "active" | "closed" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 rounded",
    md: "text-xs px-2.5 py-1 rounded-md font-medium",
    lg: "text-sm px-3 py-1.5 rounded-lg font-semibold",
  };

  const variantClasses = {
    default: "bg-zinc-800 text-zinc-200 border border-zinc-700",
    secondary: "bg-zinc-900/80 text-zinc-400 border border-zinc-800",
    outline: "border border-zinc-700 text-zinc-300 bg-transparent",
    
    // Grade badges
    gradeA: "bg-emerald-950/70 text-emerald-400 border border-emerald-500/40 glow-grade-a",
    gradeB: "bg-blue-950/70 text-blue-400 border border-blue-500/40 glow-grade-b",
    defect: "bg-rose-950/70 text-rose-400 border border-rose-500/40",

    // Status badges
    ready: "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30",
    booked: "bg-amber-950/80 text-amber-300 border border-amber-500/30",
    sold: "bg-zinc-800 text-zinc-400 border border-zinc-700 line-through opacity-85",
    active: "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40",
    closed: "bg-zinc-800 text-zinc-400 border border-zinc-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 transition-colors whitespace-nowrap",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
