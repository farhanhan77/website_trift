import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { calculateSaleProfit } from "@/lib/cogs-calculator";

function checkAuth(request: NextRequest): boolean {
  const cookie = request.cookies.get(AUTH_COOKIE_NAME);
  return !!cookie?.value;
}

/**
 * POST /api/products/sell
 * Body: { productId, soldPrice, transactionDate? }
 *
 * Atomic POS operation:
 * 1. Fetch produk → dapatkan hpp_allocated & info bal
 * 2. Update product status → SOLD
 * 3. Insert INCOME_SALE transaction
 */
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { productId, soldPrice, transactionDate } = body;

    if (!productId || !soldPrice) {
      return NextResponse.json(
        { error: "productId dan soldPrice wajib diisi" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;
    const txDate = transactionDate ?? new Date().toISOString();

    // 1. Fetch produk
    const { data: product, error: fetchErr } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (fetchErr || !product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    if (product.status === "SOLD") {
      return NextResponse.json({ error: "Produk sudah terjual" }, { status: 400 });
    }

    const profit = calculateSaleProfit(Number(soldPrice), Number(product.hpp_allocated));

    // 2. Update produk → SOLD
    const { data: updatedProduct, error: updateErr } = await supabase
      .from("products")
      .update({
        status: "SOLD",
        sold_price: soldPrice,
        sold_at: txDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .select("*, bal:bals(*)")
      .single();

    if (updateErr) throw updateErr;

    // 3. Insert transaksi penjualan
    const { data: transaction, error: txErr } = await supabase
      .from("transactions")
      .insert({
        transaction_type: "INCOME_SALE",
        product_id: productId,
        bal_id: product.bal_id ?? null,
        description: `Penjualan: ${product.name} (${product.sku})`,
        amount: soldPrice,
        net_profit: profit.net_profit,
        transaction_date: txDate,
      })
      .select()
      .single();

    if (txErr) throw txErr;

    return NextResponse.json({ product: updatedProduct, transaction }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
