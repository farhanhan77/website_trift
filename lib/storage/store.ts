/**
 * ThriftStore — Supabase-backed async data service
 *
 * Arsitektur: semua operasi CRUD memanggil API routes (/api/bals, /api/products, dll.)
 * yang di server side menggunakan Supabase service role key.
 *
 * State management: setelah setiap mutasi, store memanggil notify() agar
 * komponen yang subscribe (via thriftStore.subscribe()) otomatis re-fetch data.
 */

import {
  Bal,
  Product,
  Transaction,
  DashboardMetrics,
  MonthlyProfitData,
  BalPerformanceData,
} from "../types";
import { calculateSaleProfit, calculateBalRoi } from "../cogs-calculator";

type Listener = () => void;

// ─── Helpers ────────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errBody.error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

const sanitizeNull = (val: any) => {
  if (val === "" || val === undefined || val === null) return null;
  return typeof val === "string" && val.trim() === "" ? null : val;
};

const parseNumber = (val: any, fallback: number | null = 0) => {
  if (val === "" || val === null || val === undefined) return fallback;
  const num = Number(val);
  return isNaN(num) ? fallback : num;
};

// ─── Store Class ─────────────────────────────────────────────────────────────

class ThriftStore {
  private listeners: Set<Listener> = new Set();

  // ── Subscription ──────────────────────────────────────────────────────────

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error("[ThriftStore] subscriber error:", err);
      }
    });
  }

  // ── BAL METHODS ───────────────────────────────────────────────────────────

  public async getBals(): Promise<Bal[]> {
    return apiFetch<Bal[]>("/api/bals");
  }

  public async getBal(id: string): Promise<Bal | null> {
    const bals = await this.getBals();
    return bals.find((b) => b.id === id) ?? null;
  }

  public async addBal(bal: Omit<Bal, "id" | "created_at">): Promise<Bal> {
    const payload = {
      ...bal,
      bal_code: bal.bal_code,
      bal_name: bal.bal_name,
      purchase_price: parseNumber(bal.purchase_price, 0),
      shipping_cost: parseNumber(bal.shipping_cost, 0),
      laundry_cost: parseNumber(bal.laundry_cost, 0),
      packing_cost: parseNumber(bal.packing_cost, 0),
      total_grade_a_qty: Math.floor(parseNumber(bal.total_grade_a_qty, 0) || 0),
      total_grade_b_qty: Math.floor(parseNumber(bal.total_grade_b_qty, 0) || 0),
      total_defective_qty: Math.floor(parseNumber(bal.total_defective_qty, 0) || 0),
      hpp_per_pcs: parseNumber(bal.hpp_per_pcs, 0),
      status: bal.status || "ACTIVE",
      notes: sanitizeNull(bal.notes),
    };
    const newBal = await apiFetch<Bal>("/api/bals", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    this.notify();
    return newBal;
  }

  public async updateBal(id: string, updates: Partial<Bal>): Promise<Bal> {
    const payload: Record<string, any> = { ...updates };
    if ("purchase_price" in updates) payload.purchase_price = parseNumber(updates.purchase_price, 0);
    if ("shipping_cost" in updates) payload.shipping_cost = parseNumber(updates.shipping_cost, 0);
    if ("laundry_cost" in updates) payload.laundry_cost = parseNumber(updates.laundry_cost, 0);
    if ("packing_cost" in updates) payload.packing_cost = parseNumber(updates.packing_cost, 0);
    if ("total_grade_a_qty" in updates) payload.total_grade_a_qty = Math.floor(parseNumber(updates.total_grade_a_qty, 0) || 0);
    if ("total_grade_b_qty" in updates) payload.total_grade_b_qty = Math.floor(parseNumber(updates.total_grade_b_qty, 0) || 0);
    if ("total_defective_qty" in updates) payload.total_defective_qty = Math.floor(parseNumber(updates.total_defective_qty, 0) || 0);
    if ("hpp_per_pcs" in updates) payload.hpp_per_pcs = parseNumber(updates.hpp_per_pcs, 0);
    if ("notes" in updates) payload.notes = sanitizeNull(updates.notes);

    const updatedBal = await apiFetch<Bal>(`/api/bals/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    this.notify();
    return updatedBal;
  }

  public async deleteBal(id: string): Promise<void> {
    await apiFetch<{ success: boolean }>(`/api/bals/${id}`, {
      method: "DELETE",
    });
    this.notify();
  }

  // ── PRODUCT METHODS ───────────────────────────────────────────────────────

  public async getProducts(): Promise<Product[]> {
    return apiFetch<Product[]>("/api/products");
  }

  public async getProduct(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find((p) => p.id === id) ?? null;
  }

  public async addProduct(productData: any): Promise<Product> {
    const payload = {
      ...productData,
      bal_id: sanitizeNull(productData.bal_id),
      photo_url: sanitizeNull(productData.photo_url),
      notes: sanitizeNull(productData.notes),
      selling_price: parseNumber(productData.selling_price, 0),
      hpp_allocated: parseNumber(productData.hpp_allocated, 0),
      sold_price: parseNumber(productData.sold_price, null),
      status: productData.status ?? "READY",
    };

    const newProduct = await apiFetch<Product>("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    this.notify();
    return newProduct;
  }

  public async updateProduct(
    id: string,
    updates: Partial<Product>
  ): Promise<Product> {
    const payload: Record<string, any> = { ...updates };
    if ("bal_id" in updates) payload.bal_id = sanitizeNull(updates.bal_id);
    if ("photo_url" in updates) payload.photo_url = sanitizeNull(updates.photo_url);
    if ("notes" in updates) payload.notes = sanitizeNull(updates.notes);
    if ("selling_price" in updates) payload.selling_price = parseNumber(updates.selling_price, 0);
    if ("hpp_allocated" in updates) payload.hpp_allocated = parseNumber(updates.hpp_allocated, 0);
    if ("sold_price" in updates) payload.sold_price = parseNumber(updates.sold_price, null);

    const updatedProduct = await apiFetch<Product>(`/api/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    this.notify();
    return updatedProduct;
  }

  public async deleteProduct(id: string): Promise<void> {
    await apiFetch<{ success: boolean }>(`/api/products/${id}`, {
      method: "DELETE",
    });
    this.notify();
  }

  // ── POS SELL ENGINE ───────────────────────────────────────────────────────

  public async sellProduct(
    productId: string,
    soldPrice: number,
    transactionDate: string = new Date().toISOString()
  ): Promise<{ product: Product; transaction: Transaction }> {
    const result = await apiFetch<{ product: Product; transaction: Transaction }>(
      "/api/products/sell",
      {
        method: "POST",
        body: JSON.stringify({
          productId,
          soldPrice: parseNumber(soldPrice, 0),
          transactionDate: sanitizeNull(transactionDate) ?? new Date().toISOString(),
        }),
      }
    );
    this.notify();
    return result;
  }

  // ── TRANSACTION METHODS ───────────────────────────────────────────────────

  public async getTransactions(): Promise<Transaction[]> {
    return apiFetch<Transaction[]>("/api/transactions");
  }

  public async addTransaction(
    tx: Omit<Transaction, "id" | "created_at">
  ): Promise<Transaction> {
    const payload = {
      ...tx,
      product_id: sanitizeNull(tx.product_id),
      bal_id: sanitizeNull(tx.bal_id),
      amount: parseNumber(tx.amount, 0),
      net_profit: parseNumber(tx.net_profit, 0),
      transaction_date: sanitizeNull(tx.transaction_date) ?? new Date().toISOString(),
    };
    const newTx = await apiFetch<Transaction>("/api/transactions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    this.notify();
    return newTx;
  }

  public async deleteTransaction(id: string): Promise<void> {
    await apiFetch<{ success: boolean }>(`/api/transactions/${id}`, {
      method: "DELETE",
    });
    this.notify();
  }

  // ── ANALYTICS & AGGREGATIONS ──────────────────────────────────────────────

  public computeDashboardMetrics(
    products: Product[],
    transactions: Transaction[],
    bals: Bal[]
  ): DashboardMetrics {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalCapitalUnsoldStock = products
      .filter((p) => p.status === "READY" || p.status === "BOOKED")
      .reduce((sum, p) => sum + (Number(p.hpp_allocated) || 0), 0);

    const thisMonthTxs = transactions.filter((t) => {
      const d = new Date(t.transaction_date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalNetProfitMonth = thisMonthTxs.reduce(
      (sum, t) => sum + (Number(t.net_profit) || 0),
      0
    );
    const totalRevenueMonth = thisMonthTxs
      .filter((t) => t.transaction_type === "INCOME_SALE")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalNetProfitAllTime = transactions.reduce(
      (sum, t) => sum + (Number(t.net_profit) || 0),
      0
    );
    const totalRevenueAllTime = transactions
      .filter((t) => t.transaction_type === "INCOME_SALE")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const activeBalCount = bals.filter((b) => b.status === "ACTIVE").length;
    const totalItemsSold = products.filter((p) => p.status === "SOLD").length;
    const totalItemsReady = products.filter((p) => p.status === "READY").length;

    const soldItemsWithHpp = products.filter(
      (p) => p.status === "SOLD" && p.sold_price && p.sold_price > 0
    );
    const averageMarginPercent =
      soldItemsWithHpp.length > 0
        ? Number(
            (
              soldItemsWithHpp.reduce((acc, p) => {
                const profit = (p.sold_price || 0) - (p.hpp_allocated || 0);
                return acc + (profit / (p.sold_price || 1)) * 100;
              }, 0) / soldItemsWithHpp.length
            ).toFixed(1)
          )
        : 0;

    return {
      totalCapitalUnsoldStock,
      totalNetProfitMonth,
      totalNetProfitAllTime,
      activeBalCount,
      totalItemsSold,
      totalItemsReady,
      totalRevenueMonth,
      totalRevenueAllTime,
      averageMarginPercent,
    };
  }

  public computeMonthlyProfitData(transactions: Transaction[]): MonthlyProfitData[] {
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];

    const result: Record<
      string,
      { revenue: number; netProfit: number; expenses: number }
    > = {};

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      result[key] = { revenue: 0, netProfit: 0, expenses: 0 };
    }

    transactions.forEach((tx) => {
      const d = new Date(tx.transaction_date);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      if (result[key]) {
        if (tx.transaction_type === "INCOME_SALE") {
          result[key].revenue += Number(tx.amount) || 0;
          result[key].netProfit += Number(tx.net_profit) || 0;
        } else if (tx.transaction_type === "EXPENSE_OPERATIONAL") {
          result[key].expenses += Number(tx.amount) || 0;
          result[key].netProfit += Number(tx.net_profit) || 0;
        }
      }
    });

    return Object.entries(result).map(([month, data]) => ({
      month,
      revenue: Math.round(data.revenue),
      netProfit: Math.round(data.netProfit),
      expenses: Math.round(data.expenses),
    }));
  }

  public computeBalPerformanceMatrix(
    bals: Bal[],
    products: Product[]
  ): BalPerformanceData[] {
    return bals.map((bal) => {
      const balProducts = products.filter((p) => p.bal_id === bal.id);
      const soldProducts = balProducts.filter((p) => p.status === "SOLD");

      const total_revenue = soldProducts.reduce(
        (sum, p) => sum + (Number(p.sold_price) || 0),
        0
      );
      const total_sale_profit = soldProducts.reduce(
        (sum, p) =>
          sum + ((Number(p.sold_price) || 0) - (Number(p.hpp_allocated) || 0)),
        0
      );

      const roi_percent = calculateBalRoi(total_revenue, bal.total_capital);

      return {
        bal_code: bal.bal_code,
        bal_name: bal.bal_name,
        total_capital: bal.total_capital,
        total_revenue,
        net_profit: total_sale_profit,
        roi_percent,
        items_total: bal.total_grade_a_qty + bal.total_grade_b_qty,
        items_sold: soldProducts.length,
        items_remaining: balProducts.filter(
          (p) => p.status === "READY" || p.status === "BOOKED"
        ).length,
        status: bal.status,
      };
    });
  }
}

export const thriftStore = new ThriftStore();
