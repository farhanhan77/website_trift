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

// PATCH /api/products/[id] — update produk
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if ("sku" in body) updatePayload.sku = body.sku;
    if ("name" in body) updatePayload.name = body.name;
    if ("category" in body) updatePayload.category = body.category;
    if ("grade" in body) updatePayload.grade = body.grade;
    if ("status" in body) updatePayload.status = body.status;
    if ("bal_id" in body) updatePayload.bal_id = sanitizeNull(body.bal_id);
    if ("photo_url" in body) updatePayload.photo_url = sanitizeNull(body.photo_url);
    if ("notes" in body) updatePayload.notes = sanitizeNull(body.notes);
    if ("sold_at" in body) updatePayload.sold_at = sanitizeNull(body.sold_at);
    if ("selling_price" in body) updatePayload.selling_price = parseNumber(body.selling_price, 0);
    if ("hpp_allocated" in body) updatePayload.hpp_allocated = parseNumber(body.hpp_allocated, 0);
    if ("sold_price" in body) updatePayload.sold_price = parseNumber(body.sold_price, null);

    const { data, error } = await supabase
      .from("products")
      .update(updatePayload)
      .eq("id", params.id)
      .select("*, bal:bals(*)")
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/products/[id] — hapus produk dan transaksi terkait
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    // Hapus transaksi terkait dulu
    await supabase.from("transactions").delete().eq("product_id", params.id);

    // Hapus produk
    const { error } = await supabase.from("products").delete().eq("id", params.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
