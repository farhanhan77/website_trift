"use client";

import React, { useState, useRef } from "react";
import { Camera, X, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  category?: string;
}

const SAMPLE_PRESETS: Record<string, string[]> = {
  CREWNECK: [
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80",
  ],
  HOODIE: [
    "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
  ],
  JACKET: [
    "https://images.unsplash.com/photo-1489286696299-aa74fc69e90f?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80",
  ],
  PANTS: [
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=600&q=80",
  ],
  OTHERS: [
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
  ],
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function ImageUploader({ value, onChange, category = "CREWNECK" }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error state
    setUploadError(null);

    // Validasi tipe file
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError("Format tidak didukung. Gunakan JPEG, PNG, atau WEBP.");
      return;
    }

    // Validasi ukuran file
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("Ukuran file melebihi batas 5MB.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        // Tidak set Content-Type — browser otomatis set multipart boundary
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Gagal mengupload foto");
      }

      onChange(data.url);
    } catch (err: any) {
      setUploadError(err.message ?? "Terjadi kesalahan saat upload. Coba lagi.");
      console.error("[ImageUploader] upload error:", err);
    } finally {
      setIsUploading(false);
      // Reset input agar file yang sama bisa dipilih lagi jika perlu
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSelectPreset = (url: string) => {
    setUploadError(null);
    onChange(url);
  };

  const presets = SAMPLE_PRESETS[category] || SAMPLE_PRESETS.CREWNECK;

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-zinc-300">
        Foto Produk (Kamera / Galeri HP)
      </label>

      {/* Hidden file input — capture="environment" buka kamera belakang di mobile */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error banner */}
      {uploadError && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/50 border border-rose-800/60 text-xs text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-zinc-700 bg-zinc-950 aspect-video max-h-56 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview produk thrift"
            className="w-full h-full object-cover object-center"
          />
          {/* Upload loading overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
              <span className="text-xs text-amber-300 font-semibold">Mengupload ke Storage...</span>
            </div>
          )}
          {/* Hover overlay actions */}
          {!isUploading && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-3.5 h-3.5 mr-1" /> Ganti Foto
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => { onChange(""); setUploadError(null); }}
              >
                <X className="w-3.5 h-3.5 mr-1" /> Hapus
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors bg-zinc-900/50 flex flex-col items-center justify-center gap-2 group
            ${isUploading
              ? "border-amber-500/60 cursor-wait"
              : "border-zinc-700 hover:border-amber-500/80 hover:bg-zinc-900 cursor-pointer"
            }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors
            ${isUploading
              ? "bg-amber-500/20 text-amber-400"
              : "bg-zinc-800 group-hover:bg-amber-500/20 text-zinc-400 group-hover:text-amber-400"
            }`}
          >
            {isUploading
              ? <Loader2 className="w-6 h-6 animate-spin" />
              : <Camera className="w-6 h-6" />
            }
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-200">
              {isUploading
                ? "Mengupload ke Supabase Storage..."
                : "Klik untuk Ambil Foto / Pilih Galeri HP"}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              JPEG, PNG, WEBP — Maks. 5MB
            </p>
          </div>
        </div>
      )}

      {/* Quick preset thumbnails */}
      <div className="space-y-1.5 pt-1">
        <p className="text-[11px] text-zinc-400 flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Atau gunakan preset foto thrift kategori ini:
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {presets.map((presetUrl, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isUploading}
              onClick={() => handleSelectPreset(presetUrl)}
              className={`relative rounded-lg overflow-hidden border w-16 h-12 shrink-0 transition-transform active:scale-95 disabled:opacity-40
                ${value === presetUrl
                  ? "border-amber-400 ring-2 ring-amber-400/40"
                  : "border-zinc-800 hover:border-zinc-600"
                }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={presetUrl} alt="Preset" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
