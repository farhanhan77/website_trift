import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, isValidPin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin } = body;

    if (!pin || typeof pin !== "string") {
      return NextResponse.json({ error: "PIN is required" }, { status: 400 });
    }

    if (isValidPin(pin)) {
      const response = NextResponse.json({ success: true, message: "Authenticated successfully" });
      
      // Set HTTP-Only session cookie with 30-day lifetime for seamless mobile usage
      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: "authenticated_" + Date.now(),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });

      return response;
    } else {
      return NextResponse.json({ error: "PIN yang dimasukkan salah" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
