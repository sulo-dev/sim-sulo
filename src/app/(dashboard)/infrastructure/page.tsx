import { sql } from "@/lib/db";
import { Metadata } from "next";
import InfrastructuresClient from "./InfrastructureClient";

// Mencegah Caching Statis (Force Dynamic) agar data infrastruktur selalu real-time
export const dynamic = "force-dynamic";

// Metadata untuk SEO dan Judul Tab Browser Resmi SULO-MIS
export const metadata: Metadata = {
  title: "Aset & Infrastruktur | SULO-MIS",
  description:
    "Kelola dan pantau masa aktif Domain, Hosting, Server, dan SSL proyek klien SULO.",
};

export default async function InfrastructuresPage() {
  try {
    // 1. Ambil Data Infrastruktur Beserta Nama Websitenya
    const infraQuery: any = await sql`
      SELECT 
        i.*, 
        w.name as website_name 
      FROM infrastructures i
      LEFT JOIN websites w ON i.website_id = w.id
      ORDER BY i.id DESC
    `;

    // 2. Ambil Daftar Website untuk Dropdown Form Tambah/Edit
    const websitesQuery: any = await sql`
      SELECT id, name FROM websites ORDER BY name ASC
    `;

    // Pastikan Query Mengembalikan Array Aman
    const infraRows = Array.isArray(infraQuery)
      ? infraQuery
      : infraQuery?.rows || [];
    const websiteRows = Array.isArray(websitesQuery)
      ? websitesQuery
      : websitesQuery?.rows || [];

    // Format Data Infrastruktur (CamelCase & Datatype Normalization)
    const formattedInfra = infraRows.map((item: any) => ({
      id: Number(item.id),
      websiteId: Number(item.website_id),
      websiteName: item.website_name || "Proyek Tidak Diketahui",
      type: item.type || "Domain",
      provider: item.provider || "",
      asset: item.asset || "",
      expiry: item.expiry ? new Date(item.expiry).toISOString() : "",
      status: item.status || "Safe",
      purchaseDate: item.purchase_date
        ? new Date(item.purchase_date).toISOString()
        : "",
      renewalPrice: item.renewal_price ? String(item.renewal_price) : "",
      billingCycle: item.billing_cycle || "Tahun",
    }));

    // Format Data Website Dropdown
    const formattedWebsites = websiteRows.map((web: any) => ({
      id: Number(web.id),
      name: String(web.name),
    }));

    // 3. Serialisasi Data Aman untuk React Client Component
    const serializedInfra = JSON.parse(JSON.stringify(formattedInfra));
    const serializedWebsites = JSON.parse(JSON.stringify(formattedWebsites));

    return (
      <InfrastructuresClient
        initialData={serializedInfra}
        websites={serializedWebsites}
      />
    );
  } catch (error) {
    // Log Error Server-Side untuk Kemudahan Debugging
    console.error("[DB_ERROR] Gagal memuat data infrastruktur:", error);

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
          Gagal Memuat Data Infrastruktur
        </h3>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
          Terjadi kesalahan saat mencoba mengambil daftar aset infrastruktur dari database SULO-MIS. Pastikan koneksi server Anda stabil.
        </p>
      </div>
    );
  }
}