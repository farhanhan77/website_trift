import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

function checkAuth(request: NextRequest): boolean {
  const cookie = request.cookies.get(AUTH_COOKIE_NAME);
  return !!cookie?.value;
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

// GET /api/transactions — ambil semua transaksi beserta data produk
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;
    const { data, error } = await supabase
      .from("transactions")
      .select("*, product:products(id, name, sku, photo_url, grade, category)")
      .order("transaction_date", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/transactions — tambah transaksi baru (khusus EXPENSE_OPERATIONAL)
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    if (body.transaction_type === "INCOME_SALE") {
      return NextResponse.json(
        { error: "Gunakan /api/products/sell untuk mencatat penjualan" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        transaction_type: body.transaction_type,
        product_id: sanitizeNull(body.product_id),
        bal_id: sanitizeNull(body.bal_id),
        description: body.description,
        amount: parseNumber(body.amount, 0),
        net_profit: parseNumber(body.net_profit, 0),
        transaction_date: sanitizeNull(body.transaction_date) ?? new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
