"use client";

import React, { useState } from "react";
import { Transaction } from "@/lib/types";
import { formatIDR, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Trash2,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  ShoppingBag,
} from "lucide-react";

export interface TransactionHistoryTableProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

export function TransactionHistoryTable({
  transactions,
  onDeleteTransaction,
}: TransactionHistoryTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "INCOME_SALE" | "EXPENSE_OPERATIONAL">("ALL");

  const filtered = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "ALL" || t.transaction_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <Card className="p-0 overflow-hidden border-zinc-800 bg-zinc-900/90">
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-zinc-950/40">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              filterType === "ALL"
                ? "bg-amber-500 text-zinc-950"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Semua ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType("INCOME_SALE")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              filterType === "INCOME_SALE"
                ? "bg-emerald-500 text-zinc-950"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Penjualan ({transactions.filter((t) => t.transaction_type === "INCOME_SALE").length})
          </button>
          <button
            onClick={() => setFilterType("EXPENSE_OPERATIONAL")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              filterType === "EXPENSE_OPERATIONAL"
                ? "bg-rose-500 text-zinc-950"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Biaya ({transactions.filter((t) => t.transaction_type === "EXPENSE_OPERATIONAL").length})
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-950/70 border-b border-zinc-800 text-zinc-400 font-semibold uppercase">
            <tr>
              <th className="py-3 px-4">Tipe & Tanggal</th>
              <th className="py-3 px-4">Keterangan / Produk</th>
              <th className="py-3 px-4 text-right">Nominal (Omset)</th>
              <th className="py-3 px-4 text-right">Laba Bersih</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-400">
                  Tidak ada catatan transaksi yang sesuai.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => {
                const isSale = tx.transaction_type === "INCOME_SALE";
                return (
                  <tr key={tx.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1.5 rounded-lg ${
                            isSale
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {isSale ? (
                            <ShoppingBag className="w-3.5 h-3.5" />
                          ) : (
                            <Receipt className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-200">
                            {isSale ? "Penjualan" : "Biaya Operasional"}
                          </p>
                          <p className="text-[10px] text-zinc-400">
                            {formatDateTime(tx.transaction_date)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-zinc-200 max-w-xs truncate">
                      {tx.description}
                    </td>

                    <td className="py-3 px-4 text-right font-extrabold text-white whitespace-nowrap">
                      <span className={isSale ? "text-emerald-400" : "text-rose-400"}>
                        {isSale ? "+" : "-"}
                        {formatIDR(tx.amount)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-extrabold whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-0.5 ${
                          tx.net_profit >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {tx.net_profit >= 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        {formatIDR(tx.net_profit)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm("Hapus catatan transaksi ini? (Status stok barang akan dikembalikan ke READY jika ini transaksi penjualan)")) {
                            onDeleteTransaction(tx.id);
                          }
                        }}
                        className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Hapus / Batal Transaksi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
