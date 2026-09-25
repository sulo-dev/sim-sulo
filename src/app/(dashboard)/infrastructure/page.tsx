import { sql } from "@/lib/db";
import { Metadata } from "next";
import InfrastructuresClient from "./InfrastructureClient";

// 1. Mencegah Caching Statis (Force Dynamic)
// Memastikan data aset dan infrastruktur selalu up-to-date setiap kali halaman dimuat
export const dynamic = "force-dynamic";

// 2. Metadata untuk SEO dan Judul Tab Browser
export const metadata: Metadata = {
  title: "Manajemen Infrastruktur | SULOMIS",
  description: "Kelola dan pantau masa aktif Domain, Hosting, Server, dan SSL proyek klien.",
};

export default async function InfrastructuresPage() {
  try {
    // 1. Ambil data infrastruktur beserta nama websitenya
    const infraQuery = await sql`
      SELECT 
        i.*, 
        w.name as website_name 
      FROM infrastructures i
      LEFT JOIN websites w ON i.website_id = w.id
      ORDER BY i.id DESC
    `;

    // 2. Ambil daftar website untuk dropdown tambah/edit data
    const websitesQuery = await sql`
      SELECT id, name FROM websites ORDER BY name ASC
    `;

    // Pastikan query mengembalikan array (menyesuaikan driver database postgres/neon)
    const infraRows = Array.isArray(infraQuery) ? infraQuery : (infraQuery as any).rows || [];
    const websiteRows = Array.isArray(websitesQuery) ? websitesQuery : (websitesQuery as any).rows || [];

    // Format ke bentuk camelCase untuk UI
    const formattedInfra = infraRows.map((item: any) => ({
      id: Number(item.id), // Diubah ke Number agar sesuai dengan type Infrastructure di Client Component
      websiteId: Number(item.website_id),
      websiteName: item.website_name || "Proyek Tidak Diketahui",
      type: item.type || "Domain",
      provider: item.provider || "",
      asset: item.asset || "",
      // Kirim raw date / ISO String, biarkan Client Component yang memformat dengan formatDateIndo
      expiry: item.expiry ? new Date(item.expiry).toISOString() : "", 
      status: item.status || "Safe",
      purchaseDate: item.purchase_date ? new Date(item.purchase_date).toISOString() : "",
      renewalPrice: item.renewal_price ? String(item.renewal_price) : "",
      billingCycle: item.billing_cycle || "Tahun",
    }));

    const formattedWebsites = websiteRows.map((web: any) => ({
      id: Number(web.id),
      name: web.name,
    }));

    return <InfrastructuresClient initialData={formattedInfra} websites={formattedWebsites} />;

  } catch (error) {
    // 3. Error Boundary (Fallback UI Server-Side) jika Database Terputus
    console.error("[DB_ERROR] Gagal memuat data infrastruktur:", error);
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-3xl max-w-7xl mx-auto">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-full mb-4 shadow-sm border border-rose-100 dark:border-rose-500/30">
          <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-bold text-xl text-rose-600 dark:text-rose-400 mb-2">
          Gagal Memuat Database
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Terjadi kesalahan saat mencoba mengambil daftar aset infrastruktur. Pastikan koneksi server stabil atau hubungi Administrator.
        </p>
      </div>
    );
  }
}