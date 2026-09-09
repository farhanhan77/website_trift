"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if session token exists in localStorage or cookies
    const session = typeof window !== "undefined" ? localStorage.getItem("maul_thrift_session") : null;
    if (session === "active") {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#090B0E] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 animate-pulse flex items-center justify-center">
          <span className="font-black text-amber-400 text-lg">M</span>
        </div>
        <p className="text-xs text-zinc-400 font-medium">Memuat Maul Thrift...</p>
      </div>
    </div>
  );
}
