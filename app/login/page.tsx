"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Sparkles, Delete, ArrowRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const router = useRouter();

  // Handle hardware keyboard typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        if (pin.length < 6) {
          handleNumberClick(e.key);
        }
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Enter") {
        if (pin.length >= 4) {
          handleSubmit(pin);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pin]);

  const handleNumberClick = (num: string) => {
    if (pin.length >= 6) return;
    const newPin = pin + num;
    setPin(newPin);
    setError("");

    // Auto submit on 6 digits
    if (newPin.length === 6) {
      handleSubmit(newPin);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError("");
  };

  const handleClear = () => {
    setPin("");
    setError("");
  };

  const handleSubmit = async (pinToSubmit: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinToSubmit }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("maul_thrift_session", "active");
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.error || "PIN tidak valid!");
        triggerShake();
        setPin("");
      }
    } catch {
      // Fallback for local preview without backend server
      if (pinToSubmit === "123456") {
        localStorage.setItem("maul_thrift_session", "active");
        router.push("/dashboard");
      } else {
        setError("PIN salah. Default: 123456");
        triggerShake();
        setPin("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <div className="min-h-screen bg-[#090B0E] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative w-full max-w-sm flex flex-col items-center">
        {/* Brand Icon & Heading */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-500 p-0.5 shadow-2xl shadow-amber-500/20 mb-4">
            <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
              <span className="text-2xl font-black text-amber-400">M</span>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            MAUL THRIFT
            <Sparkles className="w-4 h-4 text-amber-400" />
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Sistem Keuangan & Manajemen Stok Thrift</p>
        </div>

        {/* PIN Entry Card */}
        <div className="w-full bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-zinc-400 mb-4">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Masukkan 6-Digit PIN Akses</span>
          </div>

          {/* 6 Dots Indicator */}
          <div
            className={`flex justify-center items-center gap-3.5 my-5 ${
              isShaking ? "animate-bounce text-rose-500" : ""
            }`}
          >
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const isFilled = index < pin.length;
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    isFilled
                      ? "bg-amber-400 shadow-lg shadow-amber-400/50 scale-110"
                      : "bg-zinc-800 border border-zinc-700"
                  }`}
                />
              );
            })}
          </div>

          {/* Error display */}
          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-rose-400 mb-4 bg-rose-950/40 border border-rose-800/40 py-2 px-3 rounded-lg">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Virtual Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 mt-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleNumberClick(num)}
                className="h-14 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 active:bg-amber-500/20 active:scale-95 text-xl font-bold text-white transition-all flex items-center justify-center border border-zinc-700/50"
              >
                {num}
              </button>
            ))}

            {/* Clear Button */}
            <button
              type="button"
              onClick={handleClear}
              className="h-14 rounded-xl bg-zinc-800/40 hover:bg-zinc-800 text-xs font-bold text-zinc-400 hover:text-white transition-all flex items-center justify-center border border-zinc-800"
            >
              CLEAR
            </button>

            {/* Zero */}
            <button
              type="button"
              onClick={() => handleNumberClick("0")}
              className="h-14 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 active:bg-amber-500/20 active:scale-95 text-xl font-bold text-white transition-all flex items-center justify-center border border-zinc-700/50"
            >
              0
            </button>

            {/* Backspace */}
            <button
              type="button"
              onClick={handleBackspace}
              className="h-14 rounded-xl bg-zinc-800/40 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all flex items-center justify-center border border-zinc-800"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Submit button for accessibility */}
          <Button
            className="w-full mt-4"
            size="lg"
            variant="gold"
            isLoading={isLoading}
            disabled={pin.length < 4}
            onClick={() => handleSubmit(pin)}
          >
            <span>Buka Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="mt-4 text-center">
            <p className="text-[11px] text-zinc-400">
              Default PIN pengujian: <span className="font-mono text-amber-400 font-bold">123456</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
