import { sql } from "@/lib/db";
import { Metadata } from "next";
import FinanceClient from "./FinanceClient";

// Mencegah Caching Statis (Force Dynamic)
// Memastikan data laporan keuangan selalu up-to-date (real-time) setiap kali halaman direfresh
export const dynamic = "force-dynamic";

// Metadata untuk SEO dan Judul Tab Browser Resmi SULO-MIS
export const metadata: Metadata = {
  title: "Laporan Keuangan | SULO-MIS",
  description:
    "Pantau arus kas, biaya server bulanan, dan margin keuntungan tiap proyek klien SULO.",
};

export default async function FinancePage() {
  try {
    // 1. Ambil Data Tagihan Keuangan Beserta Website & Client
    const financesQuery: any = await sql`
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

    // 2. Ambil Data List Proyek untuk Dropdown di Add & Edit Form
    const websitesQuery: any = await sql`
      SELECT w.id, w.name, c.company_name AS client_name
      FROM websites w
      JOIN clients c ON w.client_id = c.id
      ORDER BY w.name ASC
    `;

    // Pastikan Query Mengembalikan Array Aman
    const financeRows = Array.isArray(financesQuery)
      ? financesQuery
      : financesQuery?.rows || [];
    const websiteRows = Array.isArray(websitesQuery)
      ? websitesQuery
      : websitesQuery?.rows || [];

    // Format Data Keuangan
    const formattedFinances = financeRows.map((f: any) => {
      const revenue = Number(f.revenue || 0);
      const cost = Number(f.infrastructure_cost || 0);
      const profit = revenue - cost;

      let nextBillingStr = "-";
      if (f.next_billing) {
        const d = new Date(f.next_billing);
        nextBillingStr = !isNaN(d.getTime())
          ? d.toISOString()
          : String(f.next_billing);
      }

      return {
        id: Number(f.id),
        websiteId: Number(f.website_id),
        websiteName: f.website_name || "Proyek Tidak Diketahui",
        clientName: f.client_name || "Klien Tidak Diketahui",
        billingCycle: f.billing_cycle || "-",
        revenue: revenue,
        cost: cost,
        profit: profit,
        costBreakdown: f.cost_breakdown || [],
        nextBilling: nextBillingStr,
        status: f.status || "Unpaid",
      };
    });

    // Format Data Website Dropdown
    const formattedWebsites = websiteRows.map((w: any) => ({
      id: Number(w.id),
      name: String(w.name),
      clientName: w.client_name || "Tanpa Klien",
    }));

    // 3. Serialisasi Aman untuk React Client Component
    const serializedFinances = JSON.parse(JSON.stringify(formattedFinances));
    const serializedWebsites = JSON.parse(JSON.stringify(formattedWebsites));

    return (
      <FinanceClient
        initialData={serializedFinances}
        websites={serializedWebsites}
      />
    );
  } catch (error) {
    // Log Error Server-Side untuk Kemudahan Debugging
    console.error("[DB_ERROR] Gagal memuat data laporan keuangan:", error);

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
          Gagal Memuat Laporan Keuangan
        </h3>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
          Terjadi kesalahan saat mencoba mengambil data keuangan dari database SULO-MIS. Pastikan koneksi server Anda stabil.
        </p>
      </div>
    );
  }
}