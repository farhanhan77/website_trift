"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Bal, Product, ProductStatus } from "@/lib/types";
import { thriftStore } from "@/lib/storage/store";
import { Header } from "@/components/layout/header";
import { ProductCard } from "@/components/inventory/product-card";
import { ProductModal } from "@/components/inventory/product-modal";
import { POSModal } from "@/components/sales/pos-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shirt,
  Plus,
  Search,
  ArrowUpDown,
  Loader2,
  LayoutGrid,
  List,
} from "lucide-react";
import { formatIDR } from "@/lib/utils";

export default function InventoryPage() {
  const searchParams = useSearchParams();
  const initialBalParam = searchParams.get("balId") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [bals, setBals] = useState<Bal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBalId, setSelectedBalId] = useState(initialBalParam);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [sortOption, setSortOption] = useState<
    "GRADE_A_FIRST" | "GRADE_B_FIRST" | "PRICE_HIGH" | "PRICE_LOW" | "NEWEST"
  >("GRADE_A_FIRST");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [sellingProduct, setSellingProduct] = useState<Product | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [fetchedProducts, fetchedBals] = await Promise.all([
        thriftStore.getProducts(),
        thriftStore.getBals(),
      ]);
      setProducts(fetchedProducts);
      setBals(fetchedBals);
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

  const handleSaveProduct = async (productData: Omit<Product, "id" | "created_at">) => {
    if (editingProduct) {
      await thriftStore.updateProduct(editingProduct.id, productData);
      setEditingProduct(null);
    } else {
      await thriftStore.addProduct(productData);
      setIsProductModalOpen(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus item pakaian ini dari katalog?")) {
      await thriftStore.deleteProduct(productId);
    }
  };

  const handleConfirmSale = async (productId: string, soldPrice: number, transactionDate: string) => {
    await thriftStore.sellProduct(productId, soldPrice, transactionDate);
    setSellingProduct(null);
  };

  const handleStatusChange = async (product: Product, newStatus: ProductStatus) => {
    await thriftStore.updateProduct(product.id, { status: newStatus });
  };

  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.notes && p.notes.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesBal = !selectedBalId || p.bal_id === selectedBalId;
        const matchesStatus = selectedStatus === "ALL" || p.status === selectedStatus;
        const matchesCategory = selectedCategory === "ALL" || p.category === selectedCategory;
        return matchesSearch && matchesBal && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        if (sortOption === "GRADE_A_FIRST") {
          if (a.grade === "GRADE_A" && b.grade !== "GRADE_A") return -1;
          if (a.grade !== "GRADE_A" && b.grade === "GRADE_A") return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortOption === "GRADE_B_FIRST") {
          if (a.grade === "GRADE_B" && b.grade !== "GRADE_B") return -1;
          if (a.grade !== "GRADE_B" && b.grade === "GRADE_B") return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortOption === "PRICE_HIGH") return b.selling_price - a.selling_price;
        if (sortOption === "PRICE_LOW") return a.selling_price - b.selling_price;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [products, searchQuery, selectedBalId, selectedStatus, selectedCategory, sortOption]);

  const gradeACount = products.filter((p) => p.grade === "GRADE_A").length;
  const gradeBCount = products.filter((p) => p.grade === "GRADE_B").length;

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
        title="Katalog Inventaris & Stok Thrift"
        subtitle="Kelola pakaian per piece, upload foto dari galeri HP, filter grade sortir dan status penjualan"
        actions={
          <Button
            variant="gold"
            size="sm"
            onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
            className="text-xs shadow-md"
          >
            <Plus className="w-3.5 h-3.5" /> + Upload Pakaian Baru
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-5">
        {/* Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama pakaian, brand, atau SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-700/80 px-2.5 py-1.5 rounded-xl text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as typeof sortOption)}
                  className="bg-transparent text-zinc-200 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="GRADE_A_FIRST" className="bg-zinc-900">Grade A → Grade B ⭐</option>
                  <option value="GRADE_B_FIRST" className="bg-zinc-900">Grade B → Grade A 🏷️</option>
                  <option value="NEWEST" className="bg-zinc-900">Terbaru Ditambahkan</option>
                  <option value="PRICE_HIGH" className="bg-zinc-900">Harga: Tertinggi ke Terendah</option>
                  <option value="PRICE_LOW" className="bg-zinc-900">Harga: Terendah ke Tertinggi</option>
                </select>
              </div>
              <div className="hidden sm:flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400"}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === "table" ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-zinc-800/80 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-zinc-400 mr-1">Status:</span>
              {["ALL", "READY", "BOOKED", "SOLD"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors text-[11px] ${
                    selectedStatus === status
                      ? "bg-amber-500 text-zinc-950"
                      : "bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                  }`}
                >
                  {status === "ALL" ? "Semua Status" : status}
                </button>
              ))}
            </div>
            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />
            {bals.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-zinc-400 mr-1">Bal Asal:</span>
                <select
                  value={selectedBalId}
                  onChange={(e) => setSelectedBalId(e.target.value)}
                  className="bg-zinc-950 text-zinc-200 border border-zinc-800 rounded-lg px-2.5 py-1 text-[11px] focus:outline-none focus:border-amber-500"
                >
                  <option value="">Semua Bal</option>
                  {bals.map((b) => (
                    <option key={b.id} value={b.id}>{b.bal_code} ({b.bal_name})</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-zinc-400 mr-1">Kategori:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-zinc-950 text-zinc-200 border border-zinc-800 rounded-lg px-2.5 py-1 text-[11px] focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">Semua Kategori</option>
                {["HOODIE", "CREWNECK", "JACKET", "PANTS", "OTHERS"].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
          <span>
            Menampilkan <strong className="text-white">{filteredAndSortedProducts.length}</strong> dari {products.length} total item
          </span>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-semibold">{gradeACount} Grade A</span>
            <span>•</span>
            <span className="text-blue-400 font-semibold">{gradeBCount} Grade B</span>
          </div>
        </div>

        {/* Product Catalog */}
        {filteredAndSortedProducts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <Shirt className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-200">Tidak Ada Item yang Cocok</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian, filter status, atau unggah item pakaian baru.
            </p>
            <Button variant="gold" className="mt-4" onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}>
              + Upload Item Thrift
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAndSortedProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onSellClick={(p) => setSellingProduct(p)}
                onEditClick={(p) => setEditingProduct(p)}
                onDeleteClick={handleDeleteProduct}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">Foto & Item</th>
                    <th className="py-3 px-4">Grade & Kategori</th>
                    <th className="py-3 px-4">Bal Asal</th>
                    <th className="py-3 px-4 text-right">HPP Alokasi</th>
                    <th className="py-3 px-4 text-right">Harga Jual</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredAndSortedProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-800/40">
                      <td className="py-3 px-4 flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.photo_url || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80"}
                          alt={p.name}
                          className="w-12 h-12 rounded-lg object-cover bg-zinc-950 border border-zinc-700 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-white line-clamp-1">{p.name}</p>
                          <span className="font-mono text-[10px] text-zinc-400 font-bold">{p.sku}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <Badge variant={p.grade === "GRADE_A" ? "gradeA" : "gradeB"} size="sm">
                            {p.grade === "GRADE_A" ? "Grade A" : "Grade B"}
                          </Badge>
                          <p className="text-[10px] text-zinc-400">{p.category}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-300 font-medium">
                        {p.bal ? p.bal.bal_code : "-"}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-zinc-300">
                        {formatIDR(p.hpp_allocated)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-400">
                        {p.status === "SOLD" && p.sold_price ? formatIDR(p.sold_price) : formatIDR(p.selling_price)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={p.status === "READY" ? "ready" : p.status === "BOOKED" ? "booked" : "sold"} size="sm">
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {p.status === "READY" && (
                            <Button variant="gold" size="sm" className="text-xs h-7 px-2.5" onClick={() => setSellingProduct(p)}>
                              Jual
                            </Button>
                          )}
                          <Button variant="secondary" size="sm" className="text-xs h-7 px-2" onClick={() => setEditingProduct(p)}>
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen || !!editingProduct}
        onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
        bals={bals}
        defaultBalId={selectedBalId}
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
