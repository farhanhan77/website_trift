"use client";

import React, { useState, useEffect } from "react";
import { Bal, Product, ProductCategory, ProductGrade, ProductStatus } from "@/lib/types";
import { generateSku, formatIDR } from "@/lib/utils";
import { calculateSaleProfit } from "@/lib/cogs-calculator";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "./image-uploader";
import { Sparkles, DollarSign, Tag, Info } from "lucide-react";

export interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Omit<Product, "id" | "created_at">) => void;
  initialProduct?: Product | null;
  bals: Bal[];
  defaultBalId?: string;
  totalProductsCount?: number;
}

const CATEGORIES: ProductCategory[] = ["CREWNECK", "HOODIE", "JACKET", "PANTS", "OTHERS"];

export function ProductModal({
  isOpen,
  onClose,
  onSave,
  initialProduct,
  bals,
  defaultBalId,
  totalProductsCount = 0,
}: ProductModalProps) {
  const [name, setName] = useState(initialProduct?.name || "");
  const [balId, setBalId] = useState(
    initialProduct?.bal_id || defaultBalId || (bals.length > 0 ? bals[0].id : "")
  );
  const [category, setCategory] = useState<ProductCategory>(
    initialProduct?.category || "CREWNECK"
  );
  const [grade, setGrade] = useState<ProductGrade>(
    initialProduct?.grade || "GRADE_A"
  );
  const [sku, setSku] = useState(
    initialProduct?.sku || generateSku(category, grade, totalProductsCount)
  );
  const [photoUrl, setPhotoUrl] = useState(initialProduct?.photo_url || "");
  const [sellingPrice, setSellingPrice] = useState<string>(
    initialProduct?.selling_price ? String(initialProduct.selling_price) : ""
  );
  const [status, setStatus] = useState<ProductStatus>(
    initialProduct?.status || "READY"
  );
  const [notes, setNotes] = useState(initialProduct?.notes || "");

  // Find selected bal
  const selectedBal = bals.find((b) => b.id === balId);
  const allocatedHpp = selectedBal ? selectedBal.hpp_per_pcs : 0;

  // Auto regenerate SKU if category or grade changes for new product
  useEffect(() => {
    if (!initialProduct) {
      setSku(generateSku(category, grade, totalProductsCount));
    }
  }, [category, grade, initialProduct, totalProductsCount]);

  // Update balId if defaultBalId changes
  useEffect(() => {
    if (defaultBalId && !initialProduct) {
      setBalId(defaultBalId);
    }
  }, [defaultBalId, initialProduct]);

  // Calculate profit preview
  const priceNum = Number(sellingPrice) || 0;
  const profitPreview = calculateSaleProfit(priceNum, allocatedHpp);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Silakan masukkan nama produk thrift");
      return;
    }
    if (!balId) {
      alert("Silakan pilih Bal Asal");
      return;
    }
    if (!sellingPrice || priceNum <= 0) {
      alert("Silakan masukkan target harga jual");
      return;
    }

    onSave({
      sku: sku.trim() || generateSku(category, grade, totalProductsCount),
      bal_id: balId,
      name: name.trim(),
      category,
      grade,
      photo_url:
        photoUrl ||
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
      selling_price: priceNum,
      hpp_allocated: allocatedHpp,
      status,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialProduct ? "Edit Item Thrift" : "Input Item Baru ke Katalog"}
      description="Masukkan item thrift satuan, hubungkan dengan Bal untuk kalkulasi HPP otomatis"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bal Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300">
            Pilih Bal Asal (Sumber HPP Modal) <span className="text-amber-400">*</span>
          </label>
          <select
            value={balId}
            onChange={(e) => setBalId(e.target.value)}
            className="w-full rounded-lg bg-zinc-900 border border-zinc-700/80 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            required
          >
            {bals.map((b) => (
              <option key={b.id} value={b.id}>
                {b.bal_code} - {b.bal_name} (HPP: {formatIDR(b.hpp_per_pcs)})
              </option>
            ))}
          </select>
          {selectedBal && (
            <p className="text-[11px] text-amber-400 flex items-center gap-1 mt-1">
              <Info className="w-3 h-3" /> HPP dialokasikan otomatis:{" "}
              <strong>{formatIDR(selectedBal.hpp_per_pcs)} / pcs</strong>
            </p>
          )}
        </div>

        {/* Item Name */}
        <Input
          label="Nama Item Thrift"
          placeholder="e.g. Nike Vintage Center Swoosh Navy (Size L)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Category & Grade */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="w-full rounded-lg bg-zinc-900 border border-zinc-700/80 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">Grade Sortir</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGrade("GRADE_A")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  grade === "GRADE_A"
                    ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/30"
                    : "bg-zinc-900 text-zinc-400 border border-zinc-700 hover:border-zinc-500"
                }`}
              >
                Grade A ⭐
              </button>
              <button
                type="button"
                onClick={() => setGrade("GRADE_B")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  grade === "GRADE_B"
                    ? "bg-blue-500 text-zinc-950 shadow-md shadow-blue-500/30"
                    : "bg-zinc-900 text-zinc-400 border border-zinc-700 hover:border-zinc-500"
                }`}
              >
                Grade B 🏷️
              </button>
            </div>
          </div>
        </div>

        {/* SKU & Price */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Kode SKU Barcode"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="CRW-A-001"
            required
          />
          <Input
            label="Target Harga Jual"
            type="number"
            min="0"
            prefixText="Rp"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            placeholder="175.000"
            required
          />
        </div>

        {/* Profit Estimation Live Card */}
        {priceNum > 0 && (
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-zinc-400">Estimasi Laba Bersih:</span>
              <p
                className={`text-sm font-bold ${
                  profitPreview.is_profitable ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {formatIDR(profitPreview.net_profit)} ({profitPreview.margin_percent}%)
              </p>
            </div>
            <div className="text-right">
              <span className="text-zinc-400">Alokasi HPP Bal:</span>
              <p className="text-sm font-semibold text-amber-400">{formatIDR(allocatedHpp)}</p>
            </div>
          </div>
        )}

        {/* Image Uploader */}
        <ImageUploader
          value={photoUrl}
          onChange={(url) => setPhotoUrl(url)}
          category={category}
        />

        {/* Status (if editing) */}
        {initialProduct && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">Status Stok</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus)}
              className="w-full rounded-lg bg-zinc-900 border border-zinc-700/80 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
            >
              <option value="READY">READY (Siap Jual)</option>
              <option value="BOOKED">BOOKED (Di-booking Pembeli)</option>
              <option value="SOLD">SOLD (Sudah Terjual)</option>
            </select>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300">Catatan Item (Minus / Ukuran / Detail)</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Kondisi 9/10, PxL 68x56cm, sablon aman mulus..."
            className="w-full rounded-lg bg-zinc-900 border border-zinc-700/80 p-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="gold">
            {initialProduct ? "Simpan Perubahan" : "Tambahkan ke Stok"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
