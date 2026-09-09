"use client";

import React from "react";
import { Product } from "@/lib/types";
import { formatIDR, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tag,
  DollarSign,
  Edit2,
  Trash2,
  ShoppingBag,
  CheckCircle,
  Clock,
  Layers,
} from "lucide-react";

export interface ProductCardProps {
  product: Product;
  onSellClick: (product: Product) => void;
  onEditClick: (product: Product) => void;
  onDeleteClick: (productId: string) => void;
  onStatusChange?: (product: Product, newStatus: "READY" | "BOOKED" | "SOLD") => void;
}

export function ProductCard({
  product,
  onSellClick,
  onEditClick,
  onDeleteClick,
  onStatusChange,
}: ProductCardProps) {
  const isSold = product.status === "SOLD";
  const isBooked = product.status === "BOOKED";
  const isReady = product.status === "READY";

  const profit =
    isSold && product.sold_price
      ? product.sold_price - product.hpp_allocated
      : product.selling_price - product.hpp_allocated;

  const marginPercent =
    isSold && product.sold_price
      ? Math.round((profit / product.sold_price) * 100)
      : Math.round((profit / product.selling_price) * 100);

  return (
    <Card
      hoverEffect
      className={`group relative overflow-hidden flex flex-col justify-between border-zinc-800 bg-zinc-900/90 p-0 ${
        isSold ? "opacity-75 grayscale-[20%]" : ""
      }`}
    >
      {/* Photo Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.photo_url || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80"}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Floating Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          <Badge
            variant={product.grade === "GRADE_A" ? "gradeA" : "gradeB"}
            size="sm"
          >
            {product.grade === "GRADE_A" ? "GRADE A ⭐" : "GRADE B 🏷️"}
          </Badge>
          <span className="text-[10px] font-mono font-bold bg-black/70 text-zinc-300 px-2 py-0.5 rounded backdrop-blur-md">
            {product.sku}
          </span>
        </div>

        {/* Floating Status Badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <Badge
            variant={
              isReady ? "ready" : isBooked ? "booked" : "sold"
            }
            size="sm"
          >
            {isReady ? "READY" : isBooked ? "BOOKED" : "SOLD ✓"}
          </Badge>
        </div>

        {/* Hover Quick Action Buttons */}
        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1.5">
          <button
            onClick={() => onEditClick(product)}
            className="p-1.5 bg-zinc-800/90 hover:bg-zinc-700 text-white rounded-lg backdrop-blur-md transition-colors"
            title="Edit Item"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteClick(product.id)}
            className="p-1.5 bg-rose-900/80 hover:bg-rose-800 text-rose-200 rounded-lg backdrop-blur-md transition-colors"
            title="Hapus Item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Item Details */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {product.bal && (
            <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium mb-1 truncate">
              <Layers className="w-3 h-3 text-amber-500/80 shrink-0" />
              <span className="truncate">{product.bal.bal_name}</span>
            </div>
          )}

          <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug mb-2">
            {product.name}
          </h4>

          {product.notes && (
            <p className="text-[11px] text-zinc-400 line-clamp-1 mb-2 italic">
              &ldquo;{product.notes}&rdquo;
            </p>
          )}
        </div>

        {/* Pricing Matrix */}
        <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400">Harga Jual:</span>
            <span className="text-sm font-extrabold text-amber-400">
              {isSold && product.sold_price ? formatIDR(product.sold_price) : formatIDR(product.selling_price)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">HPP / Modal:</span>
            <span className="text-zinc-300 font-mono font-medium">{formatIDR(product.hpp_allocated)}</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Est. Laba Bersih:</span>
            <span
              className={`font-semibold ${
                profit >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {formatIDR(profit)} ({marginPercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Footer Action Button */}
      <div className="p-3 pt-0">
        {isReady ? (
          <Button
            variant="gold"
            size="sm"
            className="w-full font-bold shadow-md"
            onClick={() => onSellClick(product)}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Jual Sekarang (POS)</span>
          </Button>
        ) : isBooked ? (
          <div className="flex items-center gap-1.5">
            <Button
              variant="gold"
              size="sm"
              className="flex-1"
              onClick={() => onSellClick(product)}
            >
              <span>Pelunasan (Jual)</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onStatusChange?.(product, "READY")}
            >
              <span>Batal</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1.5 py-1 text-xs text-zinc-400 font-medium bg-zinc-950/60 rounded-lg border border-zinc-800/60">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Terjual {product.sold_at ? formatDate(product.sold_at) : ""}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
