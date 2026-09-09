"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bal,
  Product,
  Transaction,
  DashboardMetrics,
  MonthlyProfitData,
  BalPerformanceData,
} from "@/lib/types";
import { thriftStore } from "@/lib/storage/store";
import { Header } from "@/components/layout/header";
import { StatCard } from "@/components/ui/stat-card";
import { ProfitLossChart } from "@/components/charts/profit-loss-chart";
import { BalPerformanceChart } from "@/components/charts/bal-performance-chart";
import { CategoryDistributionChart } from "@/components/charts/category-distribution-chart";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/utils";
import {
  TrendingUp,
  DollarSign,
  Layers,
  Download,
  Percent,
  Loader2,
} from "lucide-react";

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [bals, setBals] = useState<Bal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyProfitData, setMonthlyProfitData] = useState<MonthlyProfitData[]>([]);
  const [balPerformanceData, setBalPerformanceData] = useState<BalPerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleExportJSON = () => {
    const backupData = {
      exported_at: new Date().toISOString(),
      bals,
      products,
      transactions,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `maul_thrift_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
        title="Analitik Bisnis & Laporan Keuangan"
        subtitle="Analisis mendalam performa ROI tiap bal, perputaran margin pakaian, dan riwayat laba rugi"
        actions={
          <Button variant="outline" size="sm" onClick={handleExportJSON} className="text-xs">
            <Download className="w-3.5 h-3.5" /> Export Data Backup
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Omset Penjualan"
            value={formatIDR(metrics?.totalRevenueAllTime || 0)}
            subtitle="Akumulasi seluruh transaksi"
            icon={DollarSign}
            variant="amber"
          />
          <StatCard
            title="Total Laba Bersih"
            value={formatIDR(metrics?.totalNetProfitAllTime || 0)}
            subtitle="Setelah dikurangi HPP & operasional"
            icon={TrendingUp}
            variant="emerald"
          />
          <StatCard
            title="Rata-rata Margin Laba"
            value={`${metrics?.averageMarginPercent || 0}%`}
            subtitle="Persentase laba per pcs"
            icon={Percent}
            variant="blue"
          />
          <StatCard
            title="Modal Terkunci di Stok"
            value={formatIDR(metrics?.totalCapitalUnsoldStock || 0)}
            subtitle={`${metrics?.totalItemsReady || 0} pcs pakaian belum terjual`}
            icon={Layers}
            variant="amber"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProfitLossChart data={monthlyProfitData} />
          <BalPerformanceChart data={balPerformanceData} />
        </div>

        {/* Category Breakdown & Bal Profitability Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CategoryDistributionChart products={products} />
          </div>

          <div className="lg:col-span-2">
            <Card className="border-zinc-800 bg-zinc-900/90 h-full flex flex-col justify-between">
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    Tabel Rekapitulasi Performa per Bal
                  </CardTitle>
                  <CardDescription>
                    Rincian modal awal, omset terkumpul, laba bersih, dan sisa stok
                  </CardDescription>
                </div>
              </CardHeader>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/70 border-b border-zinc-800 text-zinc-400 font-semibold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Kode & Nama Bal</th>
                      <th className="py-2.5 px-3 text-right">Modal Awal</th>
                      <th className="py-2.5 px-3 text-right">Omset</th>
                      <th className="py-2.5 px-3 text-right">Laba Bersih</th>
                      <th className="py-2.5 px-3 text-center">ROI</th>
                      <th className="py-2.5 px-3 text-center">Stok Terjual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {balPerformanceData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-zinc-500">
                          Belum ada data bal untuk ditampilkan.
                        </td>
                      </tr>
                    ) : (
                      balPerformanceData.map((bal) => (
                        <tr key={bal.bal_code} className="hover:bg-zinc-800/40">
                          <td className="py-2.5 px-3">
                            <p className="font-bold text-white">{bal.bal_code}</p>
                            <p className="text-[10px] text-zinc-400 truncate max-w-[140px]">{bal.bal_name}</p>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-zinc-300">
                            {formatIDR(bal.total_capital)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">
                            {formatIDR(bal.total_revenue)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-amber-400 font-bold">
                            {formatIDR(bal.net_profit)}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-zinc-200">
                            <span className={`px-2 py-0.5 rounded text-[11px] ${
                              bal.roi_percent >= 100
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                : "bg-amber-950 text-amber-400 border border-amber-800"
                            }`}>
                              {bal.roi_percent}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center text-zinc-300 font-medium">
                            {bal.items_sold} / {bal.items_total} pcs
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
