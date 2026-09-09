"use client";

import React, { useState, useEffect } from "react";
import { Bal } from "@/lib/types";
import { calculateBalHpp, BalCostInput } from "@/lib/cogs-calculator";
import { formatIDR, generateBalCode } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, AlertTriangle, Layers, CheckCircle2 } from "lucide-react";

export interface BalCalculatorFormProps {
  initialBal?: Bal | null;
  existingBalsCount?: number;
  onSave: (balData: Omit<Bal, "id" | "created_at">) => void;
  onCancel: () => void;
}

export function BalCalculatorForm({
  initialBal,
  existingBalsCount = 0,
  onSave,
  onCancel,
}: BalCalculatorFormProps) {
  const [balName, setBalName] = useState(initialBal?.bal_name || "");
  const [balCode, setBalCode] = useState(
    initialBal?.bal_code || generateBalCode(existingBalsCount)
  );
  const [notes, setNotes] = useState(initialBal?.notes || "");

  // Cost breakdowns
  const [purchasePrice, setPurchasePrice] = useState<string>(
    initialBal?.purchase_price ? String(initialBal.purchase_price) : ""
  );
  const [shippingCost, setShippingCost] = useState<string>(
    initialBal?.shipping_cost ? String(initialBal.shipping_cost) : ""
  );
  const [laundryCost, setLaundryCost] = useState<string>(
    initialBal?.laundry_cost ? String(initialBal.laundry_cost) : ""
  );
  const [packingCost, setPackingCost] = useState<string>(
    initialBal?.packing_cost ? String(initialBal.packing_cost) : ""
  );

  // Sortir quantities
  const [gradeAQty, setGradeAQty] = useState<string>(
    initialBal?.total_grade_a_qty !== undefined ? String(initialBal.total_grade_a_qty) : ""
  );
  const [gradeBQty, setGradeBQty] = useState<string>(
    initialBal?.total_grade_b_qty !== undefined ? String(initialBal.total_grade_b_qty) : ""
  );
  const [defectQty, setDefectQty] = useState<string>(
    initialBal?.total_defective_qty !== undefined ? String(initialBal.total_defective_qty) : ""
  );

  // Calculated COGS
  const [calcResult, setCalcResult] = useState({
    total_capital: 0,
    sellable_qty: 0,
    total_qty: 0,
    hpp_per_pcs: 0,
    defect_cost_burden: 0,
  });

  useEffect(() => {
    const input: BalCostInput = {
      purchase_price: Number(purchasePrice) || 0,
      shipping_cost: Number(shippingCost) || 0,
      laundry_cost: Number(laundryCost) || 0,
      packing_cost: Number(packingCost) || 0,
      total_grade_a_qty: Number(gradeAQty) || 0,
      total_grade_b_qty: Number(gradeBQty) || 0,
      total_defective_qty: Number(defectQty) || 0,
    };

    setCalcResult(calculateBalHpp(input));
  }, [purchasePrice, shippingCost, laundryCost, packingCost, gradeAQty, gradeBQty, defectQty]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!balName.trim()) {
      alert("Silakan masukkan nama bal");
      return;
    }

    if (calcResult.sellable_qty <= 0) {
      alert("Jumlah baju layak jual (Grade A + Grade B) minimal 1 pcs");
      return;
    }

    onSave({
      bal_code: balCode.trim() || generateBalCode(existingBalsCount),
      bal_name: balName.trim(),
      purchase_price: Number(purchasePrice) || 0,
      shipping_cost: Number(shippingCost) || 0,
      laundry_cost: Number(laundryCost) || 0,
      packing_cost: Number(packingCost) || 0,
      total_capital: calcResult.total_capital,
      total_grade_a_qty: Number(gradeAQty) || 0,
      total_grade_b_qty: Number(gradeBQty) || 0,
      total_defective_qty: Number(defectQty) || 0,
      hpp_per_pcs: calcResult.hpp_per_pcs,
      status: initialBal?.status || "ACTIVE",
      notes: notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Basic Bal Info */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> 1. Informasi Bal
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Kode Bal"
            value={balCode}
            onChange={(e) => setBalCode(e.target.value)}
            placeholder="BAL-2026-001"
            required
          />
          <Input
            label="Nama / Deskripsi Bal"
            value={balName}
            onChange={(e) => setBalName(e.target.value)}
            placeholder="e.g. Crewneck Vintage USA Grade A/B"
            required
          />
        </div>
      </div>

      {/* 2. Operational Cost Breakdown */}
      <div className="space-y-3 pt-2 border-t border-zinc-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <Calculator className="w-3.5 h-3.5" /> 2. Rincian Biaya Modal (Capital Overhead)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Harga Beli Bal Pokok"
            type="number"
            min="0"
            prefixText="Rp"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            placeholder="4.500.000"
            required
          />
          <Input
            label="Ongkir & Ekspedisi Bal"
            type="number"
            min="0"
            prefixText="Rp"
            value={shippingCost}
            onChange={(e) => setShippingCost(e.target.value)}
            placeholder="250.000"
          />
          <Input
            label="Biaya Laundry / Cuci Uap"
            type="number"
            min="0"
            prefixText="Rp"
            value={laundryCost}
            onChange={(e) => setLaundryCost(e.target.value)}
            placeholder="300.000"
          />
          <Input
            label="Biaya Tagging, Plastik & Packing"
            type="number"
            min="0"
            prefixText="Rp"
            value={packingCost}
            onChange={(e) => setPackingCost(e.target.value)}
            placeholder="150.000"
          />
        </div>
      </div>

      {/* 3. Sortir & Grade Breakdown */}
      <div className="space-y-3 pt-2 border-t border-zinc-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" /> 3. Hasil Sortir Isi Bal (Pcs)
        </h4>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
            <Input
              label="Grade A (Pcs)"
              type="number"
              min="0"
              suffixText="pcs"
              value={gradeAQty}
              onChange={(e) => setGradeAQty(e.target.value)}
              placeholder="65"
              required
            />
            <p className="text-[10px] text-emerald-400 mt-1">Kondisi istimewa / mulus</p>
          </div>

          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30">
            <Input
              label="Grade B (Pcs)"
              type="number"
              min="0"
              suffixText="pcs"
              value={gradeBQty}
              onChange={(e) => setGradeBQty(e.target.value)}
              placeholder="30"
              required
            />
            <p className="text-[10px] text-blue-400 mt-1">Minor cacat / warna turun</p>
          </div>

          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30">
            <Input
              label="Rijek / Cacat (Pcs)"
              type="number"
              min="0"
              suffixText="pcs"
              value={defectQty}
              onChange={(e) => setDefectQty(e.target.value)}
              placeholder="5"
            />
            <p className="text-[10px] text-rose-400 mt-1">Beban diserap produk layak</p>
          </div>
        </div>
      </div>

      {/* 4. Live COGS/HPP Calculation Auto-Summary Banner (DESIGN.md Section 4 & 5.2) */}
      <div className="rounded-xl bg-gradient-to-br from-amber-500/15 via-zinc-900 to-zinc-900 border-2 border-amber-500/40 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Kalkulasi HPP Real-time (COGS Engine)
            </span>
          </div>
          <span className="text-[11px] text-zinc-400">Formula Section 4.1 & 4.2</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800">
            <p className="text-[10px] text-zinc-400 uppercase font-semibold">Total Modal Bal</p>
            <p className="text-sm sm:text-base font-extrabold text-white mt-0.5">
              {formatIDR(calcResult.total_capital)}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800">
            <p className="text-[10px] text-zinc-400 uppercase font-semibold">Total Layak Jual</p>
            <p className="text-sm sm:text-base font-extrabold text-emerald-400 mt-0.5">
              {calcResult.sellable_qty} pcs
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800">
            <p className="text-[10px] text-zinc-400 uppercase font-semibold">Total Isi Bal</p>
            <p className="text-sm sm:text-base font-extrabold text-zinc-300 mt-0.5">
              {calcResult.total_qty} pcs
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/50">
            <p className="text-[10px] text-amber-300 uppercase font-bold">HPP Pokok / Pcs</p>
            <p className="text-sm sm:text-lg font-black text-amber-400 mt-0.5">
              {formatIDR(calcResult.hpp_per_pcs)}
            </p>
          </div>
        </div>

        {calcResult.defect_cost_burden > 0 && (
          <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center gap-2 text-xs text-amber-300/90">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Beban <strong>{defectQty} pcs baju rijek</strong> otomatis diserap oleh {calcResult.sellable_qty} pcs layak jual (+{formatIDR(calcResult.defect_cost_burden)}/pcs).
            </span>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-zinc-300">Catatan Bal (Opsional)</label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Catatan kondisi bal, supplier, no resi, dll..."
          className="w-full rounded-lg bg-zinc-900 border border-zinc-700/80 p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" variant="gold">
          {initialBal ? "Simpan Perubahan Bal" : "Buat & Hitung Bal Baru"}
        </Button>
      </div>
    </form>
  );
}
