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

const parseNumber = (val: any, fallback: number = 0) => {
  if (val === "" || val === null || val === undefined) return fallback;
  const num = Number(val);
  return isNaN(num) ? fallback : num;
};

// PATCH /api/bals/[id] — update bal
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

    if ("bal_code" in body) updatePayload.bal_code = body.bal_code;
    if ("bal_name" in body) updatePayload.bal_name = body.bal_name;
    if ("status" in body) updatePayload.status = body.status;
    if ("notes" in body) updatePayload.notes = sanitizeNull(body.notes);
    if ("purchase_price" in body) updatePayload.purchase_price = parseNumber(body.purchase_price, 0);
    if ("shipping_cost" in body) updatePayload.shipping_cost = parseNumber(body.shipping_cost, 0);
    if ("laundry_cost" in body) updatePayload.laundry_cost = parseNumber(body.laundry_cost, 0);
    if ("packing_cost" in body) updatePayload.packing_cost = parseNumber(body.packing_cost, 0);
    if ("total_grade_a_qty" in body) updatePayload.total_grade_a_qty = Math.floor(parseNumber(body.total_grade_a_qty, 0));
    if ("total_grade_b_qty" in body) updatePayload.total_grade_b_qty = Math.floor(parseNumber(body.total_grade_b_qty, 0));
    if ("total_defective_qty" in body) updatePayload.total_defective_qty = Math.floor(parseNumber(body.total_defective_qty, 0));
    if ("hpp_per_pcs" in body) updatePayload.hpp_per_pcs = parseNumber(body.hpp_per_pcs, 0);

    const { data, error } = await supabase
      .from("bals")
      .update(updatePayload)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    // Jika hpp_per_pcs berubah, propagate ke produk READY dari bal ini
    if ("hpp_per_pcs" in body) {
      await supabase
        .from("products")
        .update({ hpp_allocated: parseNumber(body.hpp_per_pcs, 0), updated_at: new Date().toISOString() })
        .eq("bal_id", params.id)
        .eq("status", "READY");
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/bals/[id] — hapus bal (FK SET NULL akan null-kan bal_id di products)
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
    const { error } = await supabase.from("bals").delete().eq("id", params.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
