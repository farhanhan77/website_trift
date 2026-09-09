import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "./lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteksi semua route di bawah /dashboard
  if (pathname.startsWith("/dashboard")) {
    const authCookie = request.cookies.get(AUTH_COOKIE_NAME);

    // Tidak ada cookie atau nilai cookie kosong → redirect ke /login
    if (!authCookie?.value) {
      const loginUrl = new URL("/login", request.url);
      // Simpan URL tujuan agar setelah login bisa redirect balik
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Jika sudah login dan mencoba akses /login → redirect ke dashboard
  if (pathname === "/login") {
    const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
    if (authCookie?.value) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Jalankan middleware untuk dashboard dan login saja
  matcher: ["/dashboard/:path*", "/login"],
};
