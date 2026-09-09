/**
 * TypeScript types yang dipetakan dari schema Supabase (supabase/schema.sql)
 * Digunakan sebagai generic parameter pada createClient<Database>()
 */

export type Database = {
  public: {
    Tables: {
      bals: {
        Row: {
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
          status: "ACTIVE" | "CLOSED" | "DELETED";
          notes: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          bal_code: string;
          bal_name: string;
          purchase_price: number;
          shipping_cost: number;
          laundry_cost: number;
          packing_cost: number;
          total_grade_a_qty: number;
          total_grade_b_qty: number;
          total_defective_qty: number;
          hpp_per_pcs: number;
          status?: "ACTIVE" | "CLOSED" | "DELETED";
          notes?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };        Update: {
          bal_code?: string;
          bal_name?: string;
          purchase_price?: number;
          shipping_cost?: number;
          laundry_cost?: number;
          packing_cost?: number;
          total_grade_a_qty?: number;
          total_grade_b_qty?: number;
          total_defective_qty?: number;
          hpp_per_pcs?: number;
          status?: "ACTIVE" | "CLOSED" | "DELETED";
          notes?: string | null;
          updated_at?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          sku: string;
          bal_id: string | null;
          name: string;
          category: "HOODIE" | "CREWNECK" | "JACKET" | "PANTS" | "OTHERS";
          grade: "GRADE_A" | "GRADE_B";
          photo_url: string | null;
          selling_price: number;
          hpp_allocated: number;
          status: "READY" | "BOOKED" | "SOLD";
          sold_price: number | null;
          sold_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          sku: string;
          bal_id?: string | null;
          name: string;
          category: "HOODIE" | "CREWNECK" | "JACKET" | "PANTS" | "OTHERS";
          grade: "GRADE_A" | "GRADE_B";
          photo_url?: string | null;
          selling_price: number;
          hpp_allocated: number;
          status?: "READY" | "BOOKED" | "SOLD";
          sold_price?: number | null;
          sold_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          sku?: string;
          bal_id?: string | null;
          name?: string;
          category?: "HOODIE" | "CREWNECK" | "JACKET" | "PANTS" | "OTHERS";
          grade?: "GRADE_A" | "GRADE_B";
          photo_url?: string | null;
          selling_price?: number;
          hpp_allocated?: number;
          status?: "READY" | "BOOKED" | "SOLD";
          sold_price?: number | null;
          sold_at?: string | null;
          notes?: string | null;
          updated_at?: string | null;
        };
      };
      transactions: {
        Row: {
          id: string;
          transaction_type: "INCOME_SALE" | "EXPENSE_OPERATIONAL";
          product_id: string | null;
          bal_id: string | null;
          description: string;
          amount: number;
          net_profit: number;
          transaction_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_type: "INCOME_SALE" | "EXPENSE_OPERATIONAL";
          product_id?: string | null;
          bal_id?: string | null;
          description: string;
          amount: number;
          net_profit: number;
          transaction_date?: string;
          created_at?: string;
        };
        Update: {
          transaction_type?: "INCOME_SALE" | "EXPENSE_OPERATIONAL";
          product_id?: string | null;
          bal_id?: string | null;
          description?: string;
          amount?: number;
          net_profit?: number;
          transaction_date?: string;
        };
      };
    };
  };
};
