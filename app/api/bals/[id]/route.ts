import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

function checkAuth(request: NextRequest): boolean {
  const cookie = request.cookies.get(AUTH_COOKIE_NAME);
  return !!cookie?.value;
}

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

    const allowedFields = [
      "bal_code", "bal_name", "purchase_price", "shipping_cost",
      "laundry_cost", "packing_cost", "total_grade_a_qty",
      "total_grade_b_qty", "total_defective_qty", "hpp_per_pcs",
      "status", "notes",
    ];
    for (const field of allowedFields) {
      if (field in body) updatePayload[field] = body[field];
    }

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
        .update({ hpp_allocated: body.hpp_per_pcs, updated_at: new Date().toISOString() })
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
