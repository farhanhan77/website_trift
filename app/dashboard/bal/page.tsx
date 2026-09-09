"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Bal, Product } from "@/lib/types";
import { thriftStore } from "@/lib/storage/store";
import { Header } from "@/components/layout/header";
import { BalCard } from "@/components/bal/bal-card";
import { BalCalculatorForm } from "@/components/bal/bal-calculator-form";
import { ProductModal } from "@/components/inventory/product-modal";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Layers, Plus, Calculator, Loader2 } from "lucide-react";
import { formatIDR } from "@/lib/utils";

export default function BalManagementPage() {
  const [bals, setBals] = useState<Bal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "CLOSED">("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBal, setEditingBal] = useState<Bal | null>(null);
  const [targetProductBal, setTargetProductBal] = useState<Bal | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [fetchedBals, fetchedProducts] = await Promise.all([
        thriftStore.getBals(),
        thriftStore.getProducts(),
      ]);
      setBals(fetchedBals);
      setProducts(fetchedProducts);
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

  const handleSaveNewBal = async (balData: Omit<Bal, "id" | "created_at">) => {
    await thriftStore.addBal(balData);
    setIsCreateModalOpen(false);
  };

  const handleUpdateBal = async (balData: Omit<Bal, "id" | "created_at">) => {
    if (editingBal) {
      await thriftStore.updateBal(editingBal.id, balData);
      setEditingBal(null);
    }
  };

  const handleDeleteBal = async (balId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus Bal ini? Item produk di dalamnya akan tetap tersimpan.")) {
      await thriftStore.deleteBal(balId);
    }
  };

  const handleSaveProduct = async (productData: Omit<Product, "id" | "created_at">) => {
    await thriftStore.addProduct(productData);
    setTargetProductBal(null);
  };

  const filteredBals = bals.filter((b) => {
    if (filterStatus === "ALL") return true;
    return b.status === filterStatus;
  });

  const totalCapitalAllBals = bals.reduce((sum, b) => sum + (Number(b.total_capital) || 0), 0);
  const totalSellablePcs = bals.reduce((sum, b) => sum + b.total_grade_a_qty + b.total_grade_b_qty, 0);

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
        title="Manajemen Bal & Sortir"
        subtitle="Kelola pembelian bal mentah, breakdown biaya operasional, dan alokasi HPP per pcs"
        actions={
          <Button variant="gold" size="sm" onClick={() => setIsCreateModalOpen(true)} className="text-xs shadow-md">
            <Plus className="w-3.5 h-3.5" /> + Beli & Sortir Bal Baru
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-zinc-900/90 border-zinc-800">
            <p className="text-xs font-semibold text-zinc-400 uppercase">Total Modal Semua Bal</p>
            <p className="text-xl font-black text-amber-400 mt-1">{formatIDR(totalCapitalAllBals)}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Termasuk ongkir, laundry & packing</p>
          </Card>
          <Card className="bg-zinc-900/90 border-zinc-800">
            <p className="text-xs font-semibold text-zinc-400 uppercase">Total Kapasitas Pakaian</p>
            <p className="text-xl font-black text-emerald-400 mt-1">{totalSellablePcs} Pcs</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Grade A + Grade B (beban rijek tercover)</p>
          </Card>
          <Card className="bg-zinc-900/90 border-zinc-800">
            <p className="text-xs font-semibold text-zinc-400 uppercase">Jumlah Batch Bal</p>
            <p className="text-xl font-black text-white mt-1">{bals.length} Batch</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">{bals.filter((b) => b.status === "ACTIVE").length} Bal Aktif</p>
          </Card>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            {(["ALL", "ACTIVE", "CLOSED"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  filterStatus === status
                    ? status === "ALL" ? "bg-amber-500 text-zinc-950"
                      : status === "ACTIVE" ? "bg-emerald-500 text-zinc-950"
                      : "bg-zinc-700 text-white"
                    : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                {status === "ALL"
                  ? `Semua Bal (${bals.length})`
                  : status === "ACTIVE"
                  ? `Bal Aktif (${bals.filter((b) => b.status === "ACTIVE").length})`
                  : `Bal Selesai (${bals.filter((b) => b.status === "CLOSED").length})`}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(true)} className="text-xs">
            <Calculator className="w-3.5 h-3.5" /> Kalkulator Bal
          </Button>
        </div>

        {/* Bal List */}
        {filteredBals.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <Layers className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-200">Belum Ada Bal yang Terdaftar</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Mulai dengan mencatat pembelian bal baru untuk menghitung HPP per piece secara presisi.
            </p>
            <Button variant="gold" className="mt-4" onClick={() => setIsCreateModalOpen(true)}>
              + Input Bal Baru Sekarang
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredBals.map((bal) => (
              <BalCard
                key={bal.id}
                bal={bal}
                products={products}
                onEdit={(b) => setEditingBal(b)}
                onDelete={handleDeleteBal}
                onAddProduct={(b) => setTargetProductBal(b)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Bal Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Pembelian & Kalkulator Sortir Bal Baru"
        description="Rincikan modal pembelian, ongkir, laundry, packing dan hasil sortir Grade A/B/Defect"
        maxWidth="lg"
      >
        <BalCalculatorForm
          existingBalsCount={bals.length}
          onSave={handleSaveNewBal}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Bal Modal */}
      <Modal
        isOpen={!!editingBal}
        onClose={() => setEditingBal(null)}
        title="Edit Data Bal & Sortir"
        description="Perubahan HPP akan otomatis disinkronkan ke pakaian berstatus READY dari bal ini"
        maxWidth="lg"
      >
        {editingBal && (
          <BalCalculatorForm
            initialBal={editingBal}
            existingBalsCount={bals.length}
            onSave={handleUpdateBal}
            onCancel={() => setEditingBal(null)}
          />
        )}
      </Modal>

      {/* Add Product with pre-selected Bal */}
      <ProductModal
        isOpen={!!targetProductBal}
        onClose={() => setTargetProductBal(null)}
        onSave={handleSaveProduct}
        bals={bals}
        defaultBalId={targetProductBal?.id}
        totalProductsCount={products.length}
      />
    </div>
  );
}
