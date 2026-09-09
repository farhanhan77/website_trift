import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

function checkAuth(request: NextRequest): boolean {
  const cookie = request.cookies.get(AUTH_COOKIE_NAME);
  return !!cookie?.value;
}

// GET /api/products — ambil semua produk beserta data bal-nya
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;
    const { data, error } = await supabase
      .from("products")
      .select("*, bal:bals(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/products — tambah produk baru
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    // Jika hpp_allocated tidak dikirim, ambil dari bal
    let hppAllocated = body.hpp_allocated;
    if (!hppAllocated && body.bal_id) {
      const { data: bal } = await supabase
        .from("bals")
        .select("hpp_per_pcs")
        .eq("id", body.bal_id)
        .single();
      if (bal) hppAllocated = bal.hpp_per_pcs;
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        sku: body.sku,
        bal_id: body.bal_id ?? null,
        name: body.name,
        category: body.category,
        grade: body.grade,
        photo_url: body.photo_url ?? null,
        selling_price: body.selling_price,
        hpp_allocated: hppAllocated ?? 0,
        status: body.status ?? "READY",
        notes: body.notes ?? null,
      })
      .select("*, bal:bals(*)")
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
