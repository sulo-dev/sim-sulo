import { sql } from "@/lib/db";
import { Metadata } from "next";
import WebsitesClient from "./WebsitesClient";

// 1. Mencegah Caching Statis (Force Dynamic)
// Memastikan data proyek website di dashboard selalu up-to-date (Real-time) setiap kali di-refresh
export const dynamic = "force-dynamic";

// 2. Metadata untuk SEO dan Judul Tab Browser
export const metadata: Metadata = {
  title: "Manajemen Proyek Website | SULOMIS",
  description: "Kelola seluruh portal, aplikasi web, dan landing page klien.",
};

export default async function WebsitesPage() {
  try {
    // AMBIL DATA LENGKAP WEBSITE
    const websitesQuery = await sql`
      SELECT 
        w.id, 
        w.client_id,
        w.name, 
        w.status, 
        w.tech_stack,
        w.production_url,
        c.company_name as client_name
      FROM websites w
      LEFT JOIN clients c ON w.client_id = c.id
      ORDER BY w.id DESC
    `;

    // AMBIL DATA KLIEN (Untuk Dropdown Tambah Website)
    const clientsQuery = await sql`
      SELECT id, company_name FROM clients ORDER BY company_name ASC
    `;

    // Pastikan query mengembalikan array (menyesuaikan driver database postgres/neon)
    const websites = Array.isArray(websitesQuery) ? websitesQuery : (websitesQuery as any).rows || [];
    const clients = Array.isArray(clientsQuery) ? clientsQuery : (clientsQuery as any).rows || [];

    // Format data untuk dikirim ke Client Component
    const formattedWebsites = websites.map((web: any) => ({
      id: web.id.toString(),
      clientId: web.client_id,
      name: web.name,
      clientName: web.client_name || "Klien Tidak Diketahui",
      status: web.status || "Active",
      techStack: web.tech_stack || "",
      productionUrl: web.production_url || "",
    }));

    const formattedClients = clients.map((client: any) => ({
      id: client.id,
      companyName: client.company_name,
    }));

    return (
      <WebsitesClient 
        initialWebsites={formattedWebsites} 
        clients={formattedClients} 
      />
    );

  } catch (error) {
    // 3. Error Boundary (Fallback UI Server-Side) jika Database Terputus
    console.error("[DB_ERROR] Gagal memuat data website:", error);
    
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
          Terjadi kesalahan saat mencoba mengambil daftar proyek website dari database. Pastikan koneksi server Anda stabil.
        </p>
      </div>
    );
  }
}