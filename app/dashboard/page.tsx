"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Bal,
  Product,
  Transaction,
  DashboardMetrics,
  MonthlyProfitData,
  BalPerformanceData,
} from "@/lib/types";
import { thriftStore } from "@/lib/storage/store";
import { formatIDR } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { ProfitLossChart } from "@/components/charts/profit-loss-chart";
import { BalPerformanceChart } from "@/components/charts/bal-performance-chart";
import { ProductModal } from "@/components/inventory/product-modal";
import { POSModal } from "@/components/sales/pos-modal";
import { ProductCard } from "@/components/inventory/product-card";
import { BalCalculatorForm } from "@/components/bal/bal-calculator-form";
import { Modal } from "@/components/ui/modal";
import {
  DollarSign,
  TrendingUp,
  Layers,
  Shirt,
  ShoppingBag,
  Plus,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function DashboardOverviewPage() {
  const [bals, setBals] = useState<Bal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [monthlyProfitData, setMonthlyProfitData] = useState<MonthlyProfitData[]>([]);
  const [balPerformanceData, setBalPerformanceData] = useState<BalPerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBalModalOpen, setIsBalModalOpen] = useState(false);
  const [sellingProduct, setSellingProduct] = useState<Product | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [fetchedBals, fetchedProducts, fetchedTransactions] = await Promise.all([
        thriftStore.getBals(),
        thriftStore.getProducts(),
        thriftStore.getTransactions(),
      ]);

      setBals(fetchedBals);
      setProducts(fetchedProducts);
      setTransactions(fetchedTransactions);
      setMetrics(thriftStore.computeDashboardMetrics(fetchedProducts, fetchedTransactions, fetchedBals));
      setMonthlyProfitData(thriftStore.computeMonthlyProfitData(fetchedTransactions));
      setBalPerformanceData(thriftStore.computeBalPerformanceMatrix(fetchedBals, fetchedProducts));
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

  const handleSaveBal = async (balData: Omit<Bal, "id" | "created_at">) => {
    await thriftStore.addBal(balData);
    setIsBalModalOpen(false);
  };

  const handleSaveProduct = async (productData: Omit<Product, "id" | "created_at">) => {
    await thriftStore.addProduct(productData);
    setIsProductModalOpen(false);
  };

  const handleConfirmSale = async (productId: string, soldPrice: number, transactionDate: string) => {
    await thriftStore.sellProduct(productId, soldPrice, transactionDate);
    setSellingProduct(null);
  };

  const readyProducts = products.filter((p) => p.status === "READY").slice(0, 4);

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
        title="Dashboard Keuangan & Stok"
        subtitle="Pantau modal bal, HPP teralokasi, laba bersih, dan sisa perputaran stok"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsBalModalOpen(true)} className="text-xs">
              <Plus className="w-3.5 h-3.5" /> + Tambah Bal
            </Button>
            <Button variant="gold" size="sm" onClick={() => setIsProductModalOpen(true)} className="text-xs shadow-md">
              <Plus className="w-3.5 h-3.5" /> + Upload Item
            </Button>
          </>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Modal Tertanam (Stok Ready)"
            value={formatIDR(metrics?.totalCapitalUnsoldStock || 0)}
            subtitle={`Dari ${metrics?.totalItemsReady || 0} pcs pakaian siap jual`}
            icon={DollarSign}
            variant="amber"
          />
          <StatCard
            title="Laba Bersih Bulan Ini"
            value={formatIDR(metrics?.totalNetProfitMonth || 0)}
            subtitle={`Omset: ${formatIDR(metrics?.totalRevenueMonth || 0)}`}
            icon={TrendingUp}
            variant="emerald"
            trend={{ value: "Realized Profit", isPositive: (metrics?.totalNetProfitMonth || 0) >= 0 }}
          />
          <StatCard
            title="Total Pakaian Terjual"
            value={`${metrics?.totalItemsSold || 0} Pcs`}
            subtitle={`Rata-rata Margin: ${metrics?.averageMarginPercent || 0}%`}
            icon={Shirt}
            variant="blue"
          />
          <StatCard
            title="Bal Aktif Berjalan"
            value={`${metrics?.activeBalCount || 0} Bal`}
            subtitle={`Total Laba Bersih: ${formatIDR(metrics?.totalNetProfitAllTime || 0)}`}
            icon={Layers}
            variant="amber"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProfitLossChart data={monthlyProfitData} />
          <BalPerformanceChart data={balPerformanceData} />
        </div>

        {/* POS Fast Action */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                Stok Siap Jual (POS Fast Action)
              </h3>
              <p className="text-xs text-zinc-400">Klik &ldquo;Jual Sekarang&rdquo; untuk mencatat transaksi kilat</p>
            </div>
            <Link
              href="/dashboard/inventory"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              Lihat Semua ({products.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {readyProducts.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <Shirt className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-300">Belum ada item berstatus READY</p>
              <p className="text-xs text-zinc-500 mt-0.5">Upload pakaian baru dari bal untuk memulai penjualan</p>
              <Button variant="gold" size="sm" className="mt-3" onClick={() => setIsProductModalOpen(true)}>
                + Upload Item Sekarang
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {readyProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onSellClick={(p) => setSellingProduct(p)}
                  onEditClick={() => {}}
                  onDeleteClick={(id) => thriftStore.deleteProduct(id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bal Modal */}
      <Modal
        isOpen={isBalModalOpen}
        onClose={() => setIsBalModalOpen(false)}
        title="Input Pembelian & Sortir Bal Baru"
        description="Hitung modal bal dan alokasi HPP per pcs secara otomatis"
        maxWidth="lg"
      >
        <BalCalculatorForm
          existingBalsCount={bals.length}
          onSave={handleSaveBal}
          onCancel={() => setIsBalModalOpen(false)}
        />
      </Modal>

      {/* Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        bals={bals}
        totalProductsCount={products.length}
      />

      {/* POS Modal */}
      <POSModal
        isOpen={!!sellingProduct}
        onClose={() => setSellingProduct(null)}
        product={sellingProduct}
        onConfirmSale={handleConfirmSale}
      />
    </div>
  );
}
