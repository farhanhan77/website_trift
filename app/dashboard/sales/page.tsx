"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Product, Transaction } from "@/lib/types";
import { thriftStore } from "@/lib/storage/store";
import { Header } from "@/components/layout/header";
import { POSModal } from "@/components/sales/pos-modal";
import { ExpenseModal } from "@/components/sales/expense-modal";
import { TransactionHistoryTable } from "@/components/sales/transaction-history-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatIDR } from "@/lib/utils";
import {
  BadgeDollarSign,
  Receipt,
  ShoppingBag,
  TrendingUp,
  Search,
  Loader2,
} from "lucide-react";

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchItemQuery, setSearchItemQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sellingProduct, setSellingProduct] = useState<Product | null>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [fetchedProducts, fetchedTransactions] = await Promise.all([
        thriftStore.getProducts(),
        thriftStore.getTransactions(),
      ]);
      setProducts(fetchedProducts);
      setTransactions(fetchedTransactions);
    } catch (err: any) {
      setError(err.message ?? "Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribe = thriftStore.subscribe(loadData);
    return () => unsubscribe();
  }, [loadData]);

  const handleConfirmSale = async (productId: string, soldPrice: number, transactionDate: string) => {
    await thriftStore.sellProduct(productId, soldPrice, transactionDate);
    setSellingProduct(null);
  };

  const handleSaveExpense = async (expenseData: Omit<Transaction, "id" | "created_at">) => {
    await thriftStore.addTransaction(expenseData);
  };

  const handleDeleteTransaction = async (id: string) => {
    await thriftStore.deleteTransaction(id);
  };

  const readyItems = products.filter((p) => p.status === "READY" || p.status === "BOOKED");
  const filteredReadyItems = readyItems.filter((p) =>
    p.name.toLowerCase().includes(searchItemQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchItemQuery.toLowerCase())
  );

  const totalSalesRevenue = transactions
    .filter((t) => t.transaction_type === "INCOME_SALE")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalNetProfit = transactions.reduce((sum, t) => sum + (Number(t.net_profit) || 0), 0);
  const totalExpenses = transactions
    .filter((t) => t.transaction_type === "EXPENSE_OPERATIONAL")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-rose-400 font-semibold">{error}</p>
        <Button variant="outline" size="sm" onClick={loadData}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Kasir POS & Pencatat Transaksi"
        subtitle="Catat penjualan item kilat dengan negosiasi diskon harga, catat biaya operasional, dan pantau laba bersih"
        actions={
          <Button variant="danger" size="sm" onClick={() => setIsExpenseModalOpen(true)} className="text-xs">
            <Receipt className="w-3.5 h-3.5" /> + Catat Biaya Operasional
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Financial Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-zinc-900/90 border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase">Total Omset Penjualan</p>
                <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1">{formatIDR(totalSalesRevenue)}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <BadgeDollarSign className="w-5 h-5" />
              </div>
            </div>
          </Card>
          <Card className="bg-zinc-900/90 border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase">Total Laba Bersih Terkumpul</p>
                <p className={`text-xl sm:text-2xl font-black mt-1 ${totalNetProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatIDR(totalNetProfit)}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </Card>
          <Card className="bg-zinc-900/90 border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase">Pengeluaran Operasional</p>
                <p className="text-xl sm:text-2xl font-black text-rose-400 mt-1">{formatIDR(totalExpenses)}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Fast POS Picker */}
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                Pilih Pakaian untuk Kasir POS Kilat
              </h3>
              <p className="text-xs text-zinc-400">
                Tersedia <strong>{readyItems.length} pcs</strong> stok siap jual
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari SKU atau nama pakaian..."
                value={searchItemQuery}
                onChange={(e) => setSearchItemQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl bg-zinc-950 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {filteredReadyItems.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-500">
              Tidak ada pakaian siap jual yang sesuai.
            </div>
          ) : (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
              {filteredReadyItems.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSellingProduct(p)}
                  className="min-w-[200px] sm:min-w-[220px] max-w-[220px] p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/60 cursor-pointer transition-all hover:scale-[1.02] shadow-lg group flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.photo_url || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80"}
                      alt={p.name}
                      className="w-12 h-12 rounded-lg object-cover bg-zinc-900 border border-zinc-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <Badge variant={p.grade === "GRADE_A" ? "gradeA" : "gradeB"} size="sm">
                        {p.grade === "GRADE_A" ? "Grade A" : "Grade B"}
                      </Badge>
                      <p className="text-xs font-bold text-white truncate mt-1">{p.name}</p>
                      <span className="font-mono text-[10px] text-zinc-400">{p.sku}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-zinc-500 uppercase">Target Jual</p>
                      <p className="text-xs font-bold text-amber-400">{formatIDR(p.selling_price)}</p>
                    </div>
                    <Button variant="gold" size="sm" className="h-7 px-2.5 text-xs font-bold">
                      Jual ⚡
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              Riwayat Transaksi Keuangan
            </h3>
            <span className="text-xs text-zinc-400">Total {transactions.length} catatan</span>
          </div>
          <TransactionHistoryTable
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
          />
        </div>
      </div>

      <POSModal
        isOpen={!!sellingProduct}
        onClose={() => setSellingProduct(null)}
        product={sellingProduct}
        onConfirmSale={handleConfirmSale}
      />
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSaveExpense={handleSaveExpense}
      />
    </div>
  );
}
