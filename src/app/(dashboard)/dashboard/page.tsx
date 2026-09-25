import { sql } from "@/lib/db";
import { Metadata } from "next";
import DashboardClient from "./DashboardClient";

// Memastikan data dashboard selalu real-time (tidak di-cache)
export const dynamic = "force-dynamic";

// Konfigurasi Metadata untuk Tab Browser
export const metadata: Metadata = {
  title: "Dashboard Operasional | SULOMIS",
  description: "Pantau seluruh infrastruktur klien, domain, dan arus kas secara terpusat.",
};

// Helper super tangguh untuk membaca berbagai format tanggal (Indonesia/Inggris/ISO)
function parseIndoDate(dateStr: string | null) {
  if (!dateStr) return new Date(0); // Jika kosong, anggap data lama (awal mula)
  
  const monthMap: Record<string, string> = {
    'Jan': 'Jan', 'Feb': 'Feb', 'Mar': 'Mar', 'Apr': 'Apr', 'Mei': 'May', 'Jun': 'Jun',
    'Jul': 'Jul', 'Agu': 'Aug', 'Sep': 'Sep', 'Okt': 'Oct', 'Nov': 'Nov', 'Des': 'Dec'
  };
  
  let formattedStr = dateStr;
  for (const [id, en] of Object.entries(monthMap)) {
    formattedStr = formattedStr.replace(new RegExp(id, 'gi'), en);
  }
  
  const d = new Date(formattedStr);
  return isNaN(d.getTime()) ? new Date(0) : d;
}

export default async function DashboardPage() {
  try {
    // Ambil SEMUA data dari DB secara paralel tanpa sisa mock!
    const [clientsQuery, websitesQuery, financesQuery, infraQuery, recentProjectsQuery] = await Promise.all([
      sql`SELECT status FROM clients`,
      sql`SELECT status FROM websites`,
      sql`
        SELECT f.revenue, f.infrastructure_cost, w.go_live_date 
        FROM finances f
        JOIN websites w ON f.website_id = w.id
      `,
      sql`SELECT expiry FROM infrastructures`,
      sql`
        SELECT w.id, w.name as web_name, c.company_name, f.status as bill_status, f.next_billing 
        FROM websites w 
        JOIN clients c ON w.client_id = c.id 
        LEFT JOIN finances f ON f.website_id = w.id 
        ORDER BY w.id DESC LIMIT 5
      `
    ]);

    // Ekstrak data aman (support format Vercel & Neon Postgres)
    const clientsRows = Array.isArray(clientsQuery) ? clientsQuery : (clientsQuery as any).rows || [];
    const websitesRows = Array.isArray(websitesQuery) ? websitesQuery : (websitesQuery as any).rows || [];
    const financesRows = Array.isArray(financesQuery) ? financesQuery : (financesQuery as any).rows || [];
    const infraRows = Array.isArray(infraQuery) ? infraQuery : (infraQuery as any).rows || [];
    const projectsRows = Array.isArray(recentProjectsQuery) ? recentProjectsQuery : (recentProjectsQuery as any).rows || [];

    // 1. Kalkulasi Klien & Website (Real Data)
    const activeClients = clientsRows.filter((c: any) => c.status === 'Active').length;
    const activeWebsites = websitesRows.filter((w: any) => w.status === 'Active').length;
    const inactiveWebsites = websitesRows.filter((w: any) => w.status === 'Inactive').length;
    const stagingWebsites = websitesRows.filter((w: any) => w.status === 'Warranty' || w.status === 'Staging').length;

    // 2. Kalkulasi MRR Total & Profit Margin
    const totalRevenue = financesRows.reduce((acc: number, curr: any) => acc + Number(curr.revenue || 0), 0);
    const totalCost = financesRows.reduce((acc: number, curr: any) => acc + Number(curr.infrastructure_cost || 0), 0);
    const profitMargin = totalRevenue > 0 ? Math.round(((totalRevenue - totalCost) / totalRevenue) * 100) : 0;

    // 3. GENERATE TREND MRR (6 Bulan Terakhir dari Real DB)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const today = new Date();
    const mrrTrendData: { name: string; year: number; month: number; current: number; }[] = [];
    
    // Buat array 6 bulan ke belakang
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      mrrTrendData.push({
        name: monthNames[d.getMonth()],
        year: d.getFullYear(),
        month: d.getMonth(),
        current: 0
      });
    }

    // Hitung pendapatan (revenue) di setiap bulan
    financesRows.forEach((row: any) => {
      const rev = Number(row.revenue || 0);
      const liveDate = parseIndoDate(row.go_live_date);

      mrrTrendData.forEach(m => {
        const endOfMonth = new Date(m.year, m.month + 1, 0); // Hari terakhir di bulan tersebut
        // Jika website sudah 'live' sebelum atau pada bulan tersebut, tambahkan ke MRR bulan itu
        if (liveDate <= endOfMonth) {
          m.current += rev;
        }
      });
    });

    // 4. Kalkulasi Infrastruktur Kritis (Kedaluwarsa <= 14 hari)
    const criticalAssets = infraRows.filter((infra: any) => {
      if (!infra.expiry) return false;
      const expiryDate = parseIndoDate(infra.expiry);
      const daysLeft = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      return daysLeft <= 14 && daysLeft >= 0;
    }).length;

    // 5. Tabel Proyek Terbaru
    const recentProjects = projectsRows.map((p: any) => ({
      id: p.id,
      name: p.web_name,
      client: p.company_name,
      status: p.bill_status || 'Internal',
      nextBilling: p.next_billing || '-'
    }));

    // Kirim semua kalkulasi ke Client
    const dashboardData = {
      activeClients,
      totalWebsites: websitesRows.length,
      activeWebsites,
      stagingWebsites,
      inactiveWebsites,
      mrr: totalRevenue,
      profitMargin,
      criticalAssets,
      recentProjects,
      mrrTrendData // Data grafik yang sudah 100% riil dari database
    };

    return <DashboardClient data={dashboardData} />;

  } catch (error) {
    // Penanganan Error Database (Error Boundary)
    console.error("[DASHBOARD_DB_ERROR] Gagal memuat data Dashboard:", error);
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-3xl max-w-7xl mx-auto shadow-sm">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-full mb-4 shadow-sm border border-rose-100 dark:border-rose-500/30">
          <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-extrabold text-2xl text-rose-600 dark:text-rose-400 mb-2 tracking-tight">
          Koneksi Database Terputus
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
          Sistem gagal merender metrik dashboard operasional. Pastikan koneksi Neon DB Anda stabil atau periksa *Environment Variables* (URL koneksi).
        </p>
        <a 
          href="/"
          className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-500/30"
        >
          Muat Ulang Dashboard
        </a>
      </div>
    );
  }
}