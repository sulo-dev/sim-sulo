import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ==========================================
// 1. TAILWIND UTILITIES
// ==========================================

/**
 * Menggabungkan class Tailwind secara dinamis dan cerdas.
 * Mencegah konflik class (misal: p-4 dan p-2 akan menjadi p-2).
 * Sangat berguna untuk pembuatan komponen UI yang reusable.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ==========================================
// 2. STRING & FORMATTING UTILITIES
// ==========================================

/**
 * Konversi angka menjadi format mata uang Rupiah (IDR).
 * Contoh: 1500000 -> "Rp 1.500.000"
 */
export function formatRupiah(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "Rp 0";
  
  const numericValue = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numericValue)) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);
}

/**
 * Mengambil inisial dari sebuah nama (Maksimal 2 huruf).
 * Contoh: "Ahmad Rizky" -> "AR", "Budi" -> "B", "Unknown" -> "U"
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  const words = name.trim().split(/\s+/);
  
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return words[0].charAt(0).toUpperCase();
}

// ==========================================
// 3. DATE & TIME UTILITIES
// ==========================================

type DateValue = string | Date | null | undefined;

/**
 * Konversi tanggal ke format YYYY-MM-DD
 * Digunakan KHUSUS untuk mengisi nilai (value) pada form <input type="date">
 */
export function toInputDateFormat(dateValue: DateValue): string {
  if (!dateValue) return "";
  
  if (typeof dateValue === "string") {
    const trimmed = dateValue.trim();

    // 1. Jika data sudah berbentuk YYYY-MM-DD, langsung kembalikan
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    // 2. Deteksi manual format Indonesia (Bisa singkatan "Okt" atau penuh "Oktober")
    const indoMonths: Record<string, string> = {
      jan: "01", januari: "01",
      feb: "02", februari: "02",
      mar: "03", maret: "03",
      apr: "04", april: "04",
      mei: "05",
      jun: "06", juni: "06",
      jul: "07", juli: "07",
      agu: "08", agustus: "08",
      sep: "09", september: "09",
      okt: "10", oktober: "10",
      nov: "11", november: "11",
      des: "12", desember: "12",
    };

    const parts = trimmed.split(/\s+/);
    if (parts.length >= 3) {
      const day = parts[0].padStart(2, "0");
      const monthStr = parts[1].toLowerCase();
      const year = parts[2];
      
      if (indoMonths[monthStr] && /^\d{4}$/.test(year)) {
        return `${year}-${indoMonths[monthStr]}-${day}`;
      }
    }
  }

  // 3. Fallback (Cadangan) untuk objek Date bawaan atau format ISO
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Konversi tanggal ke format "05 Sep 2026"
 * Digunakan untuk tampilan antarmuka UI (Tabel, Card, dll).
 * Aman dari bug Timezone yang membuat tanggal mundur 1 hari.
 */
export function formatDateIndo(dateValue: DateValue): string {
  if (!dateValue) return "-";
  
  if (typeof dateValue === "string") {
    const trimmed = dateValue.trim();

    // 1. Jika string sudah berformat "21 Okt 2026", kembalikan langsung
    if (/^\d{1,2}\s[a-zA-Z]{3,9}\s\d{4}$/.test(trimmed)) {
      return trimmed;
    }

    // 2. MENCEGAH TIMEZONE BUG: Jika string datang dari DB berupa "YYYY-MM-DD"
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split("-");
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
    }
  }

  // 3. Fallback: Eksekusi sebagai Object Date
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return String(dateValue);

  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const day = String(d.getDate()).padStart(2, "0");
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Konversi waktu ke format lengkap "05 Sep 2026, 14:30 WITA"
 * Sangat berguna untuk fitur Audit Logs & CRM Log Komunikasi.
 */
export function formatDateTimeIndo(dateValue: DateValue): string {
  if (!dateValue) return "-";
  
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return String(dateValue);

  const datePart = formatDateIndo(d);
  
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${datePart}, ${hours}:${minutes} WITA`;
}