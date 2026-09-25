// src/lib/utils.ts

type DateValue = string | Date | null | undefined;

/**
 * Konversi tanggal ke format YYYY-MM-DD 
 * Digunakan khusus untuk mengisi nilai pada <input type="date">
 */
export function toInputDateFormat(dateValue: DateValue): string {
  if (!dateValue) return "";
  
  if (typeof dateValue === 'string') {
    const trimmed = dateValue.trim();

    // 1. Jika data sudah berbentuk YYYY-MM-DD (contoh: 2026-09-23), langsung kembalikan
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    // 2. Deteksi manual format Indonesia (Bisa singkatan "Okt" atau penuh "Oktober")
    const indoMonths: Record<string, string> = {
      "jan": "01", "januari": "01",
      "feb": "02", "februari": "02",
      "mar": "03", "maret": "03",
      "apr": "04", "april": "04", 
      "mei": "05",
      "jun": "06", "juni": "06",
      "jul": "07", "juli": "07",
      "agu": "08", "agustus": "08", 
      "sep": "09", "september": "09",
      "okt": "10", "oktober": "10", 
      "nov": "11", "november": "11", 
      "des": "12", "desember": "12"
    };

    const parts = trimmed.split(/\s+/);
    if (parts.length >= 3) {
      const day = parts[0].padStart(2, "0");
      const monthStr = parts[1].toLowerCase();
      const year = parts[2];
      
      // Jika bulan dikenali dan tahun adalah 4 digit angka
      if (indoMonths[monthStr] && /^\d{4}$/.test(year)) {
        return `${year}-${indoMonths[monthStr]}-${day}`;
      }
    }
  }

  // 3. Fallback (Cadangan) untuk objek Date bawaan atau format standar Inggris
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return ""; // Jika benar-benar gagal diparsing

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Konversi tanggal ke format "05 Sep 2026"
 * Digunakan untuk tampilan antarmuka UI (Tabel, Card, dll)
 */
export function formatDateIndo(dateValue: DateValue): string {
  if (!dateValue) return "-";
  
  if (typeof dateValue === 'string') {
    const trimmed = dateValue.trim();

    // 1. Jika string sudah berformat "DD MMM YYYY" atau sejenisnya (misal: "21 Okt 2026")
    if (/^\d{1,2}\s[a-zA-Z]{3,9}\s\d{4}$/.test(trimmed)) {
      return trimmed;
    }

    // 2. MENCEGAH TIMEZONE BUG: Jika string datang dari DB berupa "YYYY-MM-DD" murni
    // Memecah manual agar tidak dikonversi ke UTC yang berisiko mundur 1 hari.
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split("-");
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      // Mengubah format "2026-09-01" menjadi "01 Sep 2026"
      return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
    }
  }

  // 3. Fallback: Eksekusi sebagai Object Date (untuk format Date/Timestamp ISO)
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return String(dateValue); // Kembalikan nilai mentah jika gagal baca

  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  
  const day = String(d.getDate()).padStart(2, "0");
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
}