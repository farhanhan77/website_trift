export type BalStatus = 'ACTIVE' | 'CLOSED' | 'DELETED';

export interface Bal {
  id: string;
  bal_code: string;
  bal_name: string;
  purchase_price: number;
  shipping_cost: number;
  laundry_cost: number;
  packing_cost: number;
  total_capital: number;
  total_grade_a_qty: number;
  total_grade_b_qty: number;
  total_defective_qty: number;
  hpp_per_pcs: number;
  status: BalStatus;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export type ProductCategory = 'HOODIE' | 'CREWNECK' | 'JACKET' | 'PANTS' | 'OTHERS';
export type ProductGrade = 'GRADE_A' | 'GRADE_B';
export type ProductStatus = 'READY' | 'BOOKED' | 'SOLD';

export interface Product {
  id: string;
  sku: string;
  bal_id: string;
  name: string;
  category: ProductCategory;
  grade: ProductGrade;
  photo_url: string;
  selling_price: number;
  hpp_allocated: number;
  status: ProductStatus;
  sold_price?: number;
  sold_at?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  bal?: Bal;
}

export type TransactionType = 'INCOME_SALE' | 'EXPENSE_OPERATIONAL';

export interface Transaction {
  id: string;
  transaction_type: TransactionType;
  product_id?: string | null;
  bal_id?: string | null;
  description: string;
  amount: number;
  net_profit: number;
  transaction_date: string;
  created_at: string;
  product?: Product;
}

export interface DashboardMetrics {
  totalCapitalUnsoldStock: number;
  totalNetProfitMonth: number;
  totalNetProfitAllTime: number;
  activeBalCount: number;
  totalItemsSold: number;
  totalItemsReady: number;
  totalRevenueMonth: number;
  totalRevenueAllTime: number;
  averageMarginPercent: number;
}

export interface MonthlyProfitData {
  month: string;
  revenue: number;
  netProfit: number;
  expenses: number;
}

export interface BalPerformanceData {
  bal_code: string;
  bal_name: string;
  total_capital: number;
  total_revenue: number;
  net_profit: number;
  roi_percent: number;
  items_total: number;
  items_sold: number;
  items_remaining: number;
  status: BalStatus;
}
