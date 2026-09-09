"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/lib/types";
import { formatIDR } from "@/lib/utils";
import { calculateSaleProfit } from "@/lib/cogs-calculator";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fireSaleConfetti } from "@/components/ui/confetti";
import { ShoppingBag, TrendingUp, CheckCircle, Percent, AlertCircle } from "lucide-react";

export interface POSModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirmSale: (productId: string, soldPrice: number, transactionDate: string) => void;
}

export function POSModal({ isOpen, onClose, product, onConfirmSale }: POSModalProps) {
  const [soldPrice, setSoldPrice] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    if (product) {
      setSoldPrice(String(product.selling_price || 0));
      setTransactionDate(new Date().toISOString().slice(0, 10));
    }
  }, [product]);

  if (!product) return null;

  const priceNum = Number(soldPrice) || 0;
  const hppNum = Number(product.hpp_allocated) || 0;
  const profitResult = calculateSaleProfit(priceNum, hppNum);

  const priceDiff = priceNum - product.selling_price;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (priceNum <= 0) {
      alert("Harga jual harus lebih besar dari 0");
      return;
    }

    onConfirmSale(product.id, priceNum, new Date(transactionDate).toISOString());
    fireSaleConfetti();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Penjualan (POS Fast-Checkout)"
      description="Konfirmasi penjualan dan sesuaikan harga deal akhir"
      maxWidth="md"
    >
      <form onSubmit={handleConfirm} className="space-y-4">
        {/* Product summary card */}
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.photo_url || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80"}
            alt={product.name}
            className="w-16 h-16 rounded-lg object-cover bg-zinc-900 shrink-0 border border-zinc-700"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant={product.grade === "GRADE_A" ? "gradeA" : "gradeB"} size="sm">
                {product.grade === "GRADE_A" ? "Grade A" : "Grade B"}
              </Badge>
              <span className="text-[10px] font-mono text-zinc-400 font-bold">{product.sku}</span>
            </div>
            <h4 className="text-sm font-bold text-white truncate">{product.name}</h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Target Harga Awal: <strong className="text-zinc-200">{formatIDR(product.selling_price)}</strong>
            </p>
          </div>
        </div>

        {/* Price Adjustment Inputs */}
        <div className="space-y-3 pt-1">
          <Input
            label="Harga Kesepakatan / Deal Akhir (Rp)"
            type="number"
            min="0"
            prefixText="Rp"
            value={soldPrice}
            onChange={(e) => setSoldPrice(e.target.value)}
            placeholder="175000"
            helperText={
              priceDiff < 0
                ? `Diskon diberikan: -${formatIDR(Math.abs(priceDiff))}`
                : priceDiff > 0
                ? `Harga di atas target: +${formatIDR(priceDiff)}`
                : "Sesuai target harga katalog"
            }
            required
          />

          <Input
            label="Tanggal Transaksi"
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            required
          />
        </div>

        {/* Live Net Profit Engine Display (DESIGN.md Section 4.3 & 5.4) */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-900 border-2 border-emerald-500/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Harga Jual Aktual:</span>
            <span className="font-semibold text-white">{formatIDR(priceNum)}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Alokasi HPP Bal:</span>
            <span className="font-semibold text-rose-400">-{formatIDR(hppNum)}</span>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-300">Laba Bersih Transaksi:</span>
              <p className="text-[10px] text-zinc-400">Section 4.3 Transaction Engine</p>
            </div>
            <div className="text-right">
              <span
                className={`text-lg font-black ${
                  profitResult.is_profitable ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {formatIDR(profitResult.net_profit)}
              </span>
              <p className="text-xs font-bold text-emerald-400">
                Margin: {profitResult.margin_percent}%
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="success" size="lg" className="flex-1 font-bold">
            <CheckCircle className="w-4 h-4" />
            <span>Konfirmasi Transaksi Terjual</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
