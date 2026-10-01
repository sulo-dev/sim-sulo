import { sql } from "@/lib/db";
import { Metadata } from "next";
import AuditClient from "./AuditClient";

// 1. Mencegah Caching Statis (Force Dynamic)
// Memastikan data riwayat log aktivitas selalu real-time setiap kali halaman dimuat
export const dynamic = "force-dynamic";

// 2. Metadata untuk SEO dan Judul Tab Browser Resmi SULO-MIS
export const metadata: Metadata = {
  title: "Audit Logs | SULO-MIS",
  description:
    "Pantau seluruh riwayat aktivitas admin dan perubahan data dalam sistem secara real-time.",
};

export default async function AuditPage() {
  try {
    // 1. Ambil Data Log dari Database (Urutkan dari yang Terbaru)
    const logsQuery: any = await sql`
      SELECT 
        id,
        timestamp,
        admin,
        action,
        module,
        detail,
        ip_address,
        status
      FROM audit_logs
      ORDER BY timestamp DESC, id DESC
    `;

    // Pastikan query mengembalikan array aman (menyesuaikan driver database postgres/neon)
    const logRows = Array.isArray(logsQuery)
      ? logsQuery
      : logsQuery?.rows || [];

    // Format Data Log agar Siap Dikonsumsi Client Component
    const formattedLogs = logRows.map((log: any) => {
      let formattedTime = "-";
      if (log.timestamp) {
        try {
          const d = new Date(log.timestamp);
          if (!isNaN(d.getTime())) {
            // Format konstan YYYY-MM-DD HH:mm:ss dalam zona waktu WITA (Asia/Makassar)
            formattedTime = d
              .toLocaleString("sv-SE", { timeZone: "Asia/Makassar" })
              .replace("T", " ");
          } else {
            formattedTime = String(log.timestamp);
          }
        } catch {
          formattedTime = String(log.timestamp);
        }
      }

      return {
        id: String(log.id || ""),
        timestamp: formattedTime,
        admin: String(log.admin || "System Admin"),
        action: String(log.action || "-"),
        module: String(log.module || "-"),
        detail: String(log.detail || "-"),
        ipAddress: String(log.ip_address || "127.0.0.1"),
        status: String(log.status || "Success"),
      };
    });

    // 2. SERIALIZATION BOUNDARY: Pastikan JSON Murni Tanpa Objek JS Non-Primitif
    const serializedLogs = JSON.parse(JSON.stringify(formattedLogs));

    return <AuditClient initialData={serializedLogs} />;
  } catch (error) {
    // Log Error Server-Side untuk Kemudahan Debugging
    console.error("[DB_ERROR] Gagal memuat data Audit Logs:", error);

    // Fallback UI Elegan SULO-MIS saat Terjadi Kesalahan Database
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] p-8 text-center bg-rose-50/50 dark:bg-rose-500/10 border border-rose-200/80 dark:border-rose-500/20 rounded-3xl max-w-7xl mx-auto backdrop-blur-xl shadow-sm my-8">
        <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-rose-500 mb-4 shadow-sm border border-rose-100 dark:border-rose-500/20">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-1.5">
          Gagal Memuat Audit Logs
        </h3>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
          Terjadi kesalahan saat mengambil histori aktivitas dari database SULO-MIS. Pastikan koneksi server Anda stabil.
        </p>
      </div>
    );
  }
}