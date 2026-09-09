import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

function checkAuth(request: NextRequest): boolean {
  const cookie = request.cookies.get(AUTH_COOKIE_NAME);
  return !!cookie?.value;
}

// GET /api/bals — ambil semua bal, diurutkan terbaru
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;
    const { data, error } = await supabase
      .from("bals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/bals — tambah bal baru
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    const { data, error } = await supabase
      .from("bals")
      .insert({
        bal_code: body.bal_code,
        bal_name: body.bal_name,
        purchase_price: body.purchase_price,
        shipping_cost: body.shipping_cost,
        laundry_cost: body.laundry_cost,
        packing_cost: body.packing_cost,
        total_grade_a_qty: body.total_grade_a_qty,
        total_grade_b_qty: body.total_grade_b_qty,
        total_defective_qty: body.total_defective_qty,
        hpp_per_pcs: body.hpp_per_pcs,
        status: body.status ?? "ACTIVE",
        notes: body.notes ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
