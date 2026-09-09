import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";
import type { Database } from "@/lib/supabase/types";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

function checkAuth(request: NextRequest): boolean {
  const cookie = request.cookies.get(AUTH_COOKIE_NAME);
  return !!cookie?.value;
}

// DELETE /api/transactions/[id]
// Jika transaksi INCOME_SALE → revert status produk kembali ke READY
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();

    // Fetch transaksi dulu untuk cek tipe & product_id
    const { data: tx, error: fetchErr } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", params.id)
      .returns<TransactionRow[]>()
      .single();

    if (fetchErr || !tx) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    // Revert produk ke READY jika ini transaksi penjualan
    if (tx.transaction_type === "INCOME_SALE" && tx.product_id) {
      const revertUpdate: ProductUpdate = {
        status: "READY",
        sold_price: null,
        sold_at: null,
        updated_at: new Date().toISOString(),
      };
      await supabase
        .from("products")
        .update(revertUpdate as any)
        .eq("id", tx.product_id);
    }

    // Hapus transaksi
    const { error: deleteErr } = await supabase
      .from("transactions")
      .delete()
      .eq("id", params.id);

    if (deleteErr) throw deleteErr;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
