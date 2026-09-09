import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

const BUCKET = "product-photos";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function checkAuth(request: NextRequest): boolean {
  const cookie = request.cookies.get(AUTH_COOKIE_NAME);
  return !!cookie?.value;
}

/**
 * POST /api/upload
 * Body: multipart/form-data dengan field "file"
 * Returns: { url: string } — public URL dari Supabase Storage
 */
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan di request" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan JPEG, PNG, atau WEBP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file melebihi batas 5MB." },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Buat nama file unik: timestamp + random + ekstensi
    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `product_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `products/${fileName}`;

    // Convert File ke ArrayBuffer untuk upload
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Ambil public URL
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error("Gagal mendapatkan public URL dari Supabase Storage");
    }

    return NextResponse.json({ url: urlData.publicUrl }, { status: 201 });
  } catch (err: any) {
    console.error("[Upload Error]", err);
    return NextResponse.json(
      { error: err.message ?? "Gagal mengupload foto" },
      { status: 500 }
    );
  }
}
