"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Shirt,
  BadgeDollarSign,
  BarChart3,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Bal Management", href: "/dashboard/bal", icon: Layers },
    { label: "Inventory Catalog", href: "/dashboard/inventory", icon: Shirt },
    { label: "POS & Sales", href: "/dashboard/sales", icon: BadgeDollarSign },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
      localStorage.removeItem("maul_thrift_session");
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-zinc-950/95 border-r border-zinc-800/80 h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-amber-500/20 text-lg">
            M
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight leading-none flex items-center gap-1.5">
              MAUL THRIFT
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h1>
            <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">Finance & Inventory</p>
          </div>
        </Link>
      </div>

      {/* Navigation links */}
      <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
          Menu Utama
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-amber-400" : "text-zinc-400")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-zinc-800/80 space-y-1.5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar PIN</span>
        </button>
      </div>
    </aside>
  );
}
