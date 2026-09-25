import { sql } from "@/lib/db";
import { Metadata } from "next";
import FinanceClient from "./FinanceClient";

// 1. Mencegah Caching Statis (Force Dynamic)
// Memastikan data laporan keuangan selalu up-to-date (real-time) setiap halaman direfresh
export const dynamic = "force-dynamic";

// 2. Metadata untuk SEO dan Judul Tab Browser
export const metadata: Metadata = {
  title: "Laporan Keuangan | SULOMIS",
  description: "Pantau arus kas, biaya server bulanan, dan margin keuntungan tiap proyek klien.",
};

export default async function FinancePage() {
  try {
    // 1. Ambil data tagihan keuangan beserta ID Website (website_id)
    // Diubah menjadi DESC agar tagihan terbaru berada di posisi teratas
    const financesQuery = await sql`
      SELECT 
        f.id,
        f.website_id,
        w.name AS website_name,
        c.company_name AS client_name,
        f.billing_cycle,
        f.revenue,
        f.infrastructure_cost,
        f.cost_breakdown,
        f.next_billing,
        f.status
      FROM finances f
      JOIN websites w ON f.website_id = w.id
      JOIN clients c ON w.client_id = c.id
      ORDER BY f.id DESC
    `;

    // 2. Ambil data List Proyek untuk Dropdown di Add & Edit form
    const websitesQuery = await sql`
      SELECT w.id, w.name, c.company_name AS client_name
      FROM websites w
      JOIN clients c ON w.client_id = c.id
      ORDER BY w.name ASC
    `;

    // Pastikan query mengembalikan array (menyesuaikan driver database postgres/neon)
    const financeRows = Array.isArray(financesQuery) ? financesQuery : (financesQuery as any).rows || [];
    const websiteRows = Array.isArray(websitesQuery) ? websitesQuery : (websitesQuery as any).rows || [];

    // Format Data Keuangan
    const formattedFinances = financeRows.map((f: any) => {
      const revenue = Number(f.revenue || 0);
      const cost = Number(f.infrastructure_cost || 0);
      const profit = revenue - cost;

      return {
        id: Number(f.id),
        websiteId: Number(f.website_id), // Penting: Untuk auto-select di form Edit
        websiteName: f.website_name || "Proyek Tidak Diketahui",
        clientName: f.client_name || "Klien Tidak Diketahui",
        billingCycle: f.billing_cycle || "-",
        revenue: revenue,
        cost: cost,
        profit: profit,
        costBreakdown: f.cost_breakdown || [], 
        nextBilling: f.next_billing || "-",
        status: f.status || "Unpaid",
      };
    });

    // Format Data Website (Dropdown List)
    const formattedWebsites = websiteRows.map((w: any) => ({
      id: Number(w.id),
      name: w.name,
      clientName: w.client_name || "Tanpa Klien"
    }));

    // 3. Lempar kedua datanya ke Client Component
    return <FinanceClient initialData={formattedFinances} websites={formattedWebsites} />;

  } catch (error) {
    // 4. Error Boundary (Fallback UI Server-Side) jika Database Terputus
    console.error("[DB_ERROR] Gagal memuat data laporan keuangan:", error);
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-3xl max-w-7xl mx-auto">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-full mb-4 shadow-sm border border-rose-100 dark:border-rose-500/30">
          <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-bold text-xl text-rose-600 dark:text-rose-400 mb-2">
          Gagal Memuat Laporan Keuangan
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Terjadi kesalahan saat mencoba mengambil data keuangan dari database. Pastikan koneksi server Anda stabil atau hubungi Administrator SULO-MIS.
        </p>
      </div>
    );
  }
}