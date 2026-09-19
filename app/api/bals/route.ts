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
        purchase_price: parseNumber(body.purchase_price, 0),
        shipping_cost: parseNumber(body.shipping_cost, 0),
        laundry_cost: parseNumber(body.laundry_cost, 0),
        packing_cost: parseNumber(body.packing_cost, 0),
        total_grade_a_qty: Math.floor(parseNumber(body.total_grade_a_qty, 0)),
        total_grade_b_qty: Math.floor(parseNumber(body.total_grade_b_qty, 0)),
        total_defective_qty: Math.floor(parseNumber(body.total_defective_qty, 0)),
        hpp_per_pcs: parseNumber(body.hpp_per_pcs, 0),
        status: body.status ?? "ACTIVE",
        notes: sanitizeNull(body.notes),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
