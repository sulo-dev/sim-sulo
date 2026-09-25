import { sql } from "@/lib/db";
import { Metadata } from "next";
import AuditClient from "./AuditClient";

// 1. Mencegah Caching Statis (Force Dynamic)
// Memastikan data riwayat log aktivitas selalu real-time setiap kali halaman dimuat
export const dynamic = "force-dynamic";

// 2. Metadata untuk SEO dan Judul Tab Browser
export const metadata: Metadata = {
  title: "Audit Logs | SULOMIS",
  description: "Pantau seluruh riwayat aktivitas admin dan perubahan data dalam sistem secara real-time.",
};

export default async function AuditPage() {
  try {
    // 1. Ambil data log dari database, urutkan dari yang terbaru
    const logsQuery = await sql`
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
      ORDER BY timestamp DESC
    `;

    // Pastikan query mengembalikan array (menangani perbedaan output dari berbagai driver postgres/neon)
    const logsRows = Array.isArray(logsQuery) ? logsQuery : (logsQuery as any).rows || [];

    // Format Data Log agar siap dikonsumsi Client Component
    const formattedLogs = logsRows.map((log: any) => {
      // Memastikan format waktu konstan (YYYY-MM-DD HH:mm:ss) zona waktu WITA (Asia/Makassar)
      // Ini penting agar fungsi split(' ') di AuditClient.tsx berjalan dengan mulus.
      const formattedTime = log.timestamp 
        ? new Date(log.timestamp).toLocaleString("sv-SE", { timeZone: "Asia/Makassar" }).replace("T", " ")
        : "-";

      return {
        id: String(log.id),
        timestamp: formattedTime,
        admin: log.admin || "Unknown",
        action: log.action || "-",
        module: log.module || "-",
        detail: log.detail || "-",
        ipAddress: log.ip_address || "-",
        status: log.status || "Success"
      };
    });

    // 2. Lempar data ke Client Component
    return <AuditClient initialData={formattedLogs} />;

  } catch (error) {
    // 3. Error Boundary (Fallback UI Server-Side) jika Database Terputus
    console.error("[DB_ERROR] Gagal memuat data Audit Logs:", error);
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-3xl max-w-7xl mx-auto mt-8 shadow-sm">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-full mb-4 shadow-sm border border-rose-100 dark:border-rose-500/30">
          <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-bold text-xl text-rose-600 dark:text-rose-400 mb-2">
          Gagal Memuat Audit Logs
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Terjadi kesalahan saat mencoba mengambil histori aktivitas dari database. Pastikan koneksi server Anda stabil atau hubungi Administrator SULO-MIS.
        </p>
      </div>
    );
  }
}