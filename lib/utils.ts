import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIDR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "Rp 0";
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "0";
  }
  return new Intl.NumberFormat("id-ID").format(amount);
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return String(dateString);
  }
}

export function formatDateTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return String(dateString);
  }
}

export function generateSku(category: string, grade: string, existingCount: number = 0): string {
  const categoryPrefixes: Record<string, string> = {
    HOODIE: "HD",
    CREWNECK: "CRW",
    JACKET: "JKT",
    PANTS: "PNT",
    OTHERS: "OTH",
  };

  const gradeCode = grade === "GRADE_B" ? "B" : "A";
  const prefix = categoryPrefixes[category.toUpperCase()] || "ITM";
  const num = String(existingCount + 1).padStart(3, "0");
  const randomSuffix = Math.floor(Math.random() * 900 + 100);

  return `${prefix}-${gradeCode}-${num}-${randomSuffix}`;
}

export function generateBalCode(existingCount: number = 0): string {
  const year = new Date().getFullYear();
  const num = String(existingCount + 1).padStart(3, "0");
  return `BAL-${year}-${num}`;
}

export function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
