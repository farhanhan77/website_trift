"use client";

import React from "react";
import Link from "next/link";
import { Bal, Product } from "@/lib/types";
import { formatIDR, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Layers,
  Shirt,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
} from "lucide-react";

export interface BalCardProps {
  bal: Bal;
  products: Product[];
  onEdit: (bal: Bal) => void;
  onDelete: (balId: string) => void;
  onAddProduct: (bal: Bal) => void;
}

export function BalCard({ bal, products, onEdit, onDelete, onAddProduct }: BalCardProps) {
  const balProducts = products.filter((p) => p.bal_id === bal.id);
  const totalSellable = bal.total_grade_a_qty + bal.total_grade_b_qty;
  const catalogedCount = balProducts.length;
  const soldCount = balProducts.filter((p) => p.status === "SOLD").length;
  const readyCount = balProducts.filter((p) => p.status === "READY").length;

  const totalRevenue = balProducts
    .filter((p) => p.status === "SOLD")
    .reduce((sum, p) => sum + (Number(p.sold_price) || 0), 0);

  const roiPercent =
    bal.total_capital > 0 ? ((totalRevenue / bal.total_capital) * 100).toFixed(1) : "0";

  const progressPercent =
    totalSellable > 0 ? Math.min(100, Math.round((catalogedCount / totalSellable) * 100)) : 0;

  return (
    <Card hoverEffect className="relative overflow-hidden flex flex-col justify-between border-zinc-800 bg-zinc-900/90">
      {/* Top Banner */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {bal.bal_code}
              </span>
              <Badge variant={bal.status === "ACTIVE" ? "active" : "closed"}>
                {bal.status}
              </Badge>
            </div>
            <h3 className="text-base font-bold text-white mt-1.5 line-clamp-1">{bal.bal_name}</h3>
            <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" /> Dibuat: {formatDate(bal.created_at)}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(bal)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              title="Edit Bal"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(bal.id)}
              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
              title="Hapus Bal"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cost Matrix Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
          <div>
            <p className="text-[10px] text-zinc-400 font-semibold uppercase">Total Modal</p>
            <p className="text-xs sm:text-sm font-bold text-white mt-0.5">{formatIDR(bal.total_capital)}</p>
          </div>
          <div>
            <p className="text-[10px] text-amber-400 font-bold uppercase">HPP / Pcs</p>
            <p className="text-xs sm:text-sm font-extrabold text-amber-400 mt-0.5">
              {formatIDR(bal.hpp_per_pcs)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 font-semibold uppercase">Hasil Sortir</p>
            <p className="text-xs sm:text-sm font-bold text-zinc-200 mt-0.5">
              <span className="text-emerald-400">{bal.total_grade_a_qty}A</span> /{" "}
              <span className="text-blue-400">{bal.total_grade_b_qty}B</span>
              {bal.total_defective_qty > 0 && (
                <span className="text-rose-400 text-xs"> ({bal.total_defective_qty} Rijek)</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 font-semibold uppercase">Omset / ROI</p>
            <p className="text-xs sm:text-sm font-bold text-emerald-400 mt-0.5">
              {roiPercent}%
            </p>
          </div>
        </div>

        {/* Catalog Progress Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 flex items-center gap-1">
              <Shirt className="w-3.5 h-3.5 text-zinc-400" />
              Katalog Terinput: <strong className="text-zinc-200">{catalogedCount}</strong> / {totalSellable} pcs
            </span>
            <span className="text-zinc-300 font-semibold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Stok Ready: {readyCount} pcs</span>
            <span>Terjual: {soldCount} pcs</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-zinc-800 flex items-center gap-2">
        <Button
          variant="gold"
          size="sm"
          className="flex-1"
          onClick={() => onAddProduct(bal)}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Upload Item dari Bal Ini</span>
        </Button>
        <Link href={`/dashboard/inventory?balId=${bal.id}`}>
          <Button variant="outline" size="sm">
            <span>Lihat Stok</span>
          </Button>
        </Link>
      </div>
    </Card>
  );
}
