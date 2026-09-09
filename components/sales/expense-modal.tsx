"use client";

import React, { useState } from "react";
import { Transaction } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Receipt, DollarSign } from "lucide-react";

export interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expense: Omit<Transaction, "id" | "created_at">) => void;
}

const COMMON_EXPENSE_PRESETS = [
  "Plastik Polymailer & Tag Gun Refill",
  "Biaya Listrik & Air Toko / Studio",
  "Iklan Instagram & TikTok Ads",
  "Sewa Tempat / Gudang Penyimpanan",
  "Hanger Kayu & Display Racks",
  "Ongkir Retur / Operational Lainnya",
];

export function ExpenseModal({ isOpen, onClose, onSaveExpense }: ExpenseModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(amount) || 0;
    if (!description.trim()) {
      alert("Silakan masukkan keterangan pengeluaran");
      return;
    }
    if (amountNum <= 0) {
      alert("Jumlah pengeluaran harus lebih besar dari 0");
      return;
    }

    onSaveExpense({
      transaction_type: "EXPENSE_OPERATIONAL",
      description: description.trim(),
      amount: amountNum,
      net_profit: -amountNum,
      transaction_date: new Date(transactionDate).toISOString(),
    });

    setDescription("");
    setAmount("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Biaya Operasional Non-Bal"
      description="Catat biaya sewa, listrik, plastik packing, atau iklan promosi"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Presets */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300">Pilih Cepat Kategori:</label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_EXPENSE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setDescription(preset)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors text-left"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Keterangan Pengeluaran"
          placeholder="e.g. Beli Plastik Polymailer & Tag Gun Refill"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Jumlah Pengeluaran (Rp)"
            type="number"
            min="0"
            prefixText="Rp"
            placeholder="120000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <Input
            label="Tanggal Pengeluaran"
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="danger">
            Simpan Pengeluaran
          </Button>
        </div>
      </form>
    </Modal>
  );
}
