import { sql } from "@/lib/db";
import { Metadata } from "next";
import WebsitesClient from "./WebsitesClient";

// Mencegah Next.js melakukan caching statis pada halaman ini
// Memastikan data proyek website di dashboard selalu up-to-date (Real-time) setiap kali di-refresh
export const dynamic = "force-dynamic";

// Metadata untuk SEO dan Judul Tab Browser
export const metadata: Metadata = {
  title: "Manajemen Proyek Website | SULO-MIS",
  description: "Kelola seluruh portal, aplikasi web, dan landing page milik klien SULO.",
};

export default async function WebsitesPage() {
  try {
    // 1. AMBIL DATA LENGKAP WEBSITE
    const websitesQuery: any = await sql`
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

    // 2. AMBIL DATA KLIEN (Untuk Opsi Dropdown Tambah Website)
    const clientsQuery: any = await sql`
      SELECT id, company_name FROM clients ORDER BY company_name ASC
    `;

    // Pastikan hasil query selalu terurai sebagai Array aman
    const websites = Array.isArray(websitesQuery)
      ? websitesQuery
      : websitesQuery?.rows || [];
    const clients = Array.isArray(clientsQuery)
      ? clientsQuery
      : clientsQuery?.rows || [];

    // 3. Format Data untuk Dikirim ke Client Component
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
    // Log Error ke Console Server untuk Kemudahan Debugging
    console.error("[DB_ERROR] Gagal memuat data website:", error);

    // Fallback UI Elegan saat Koneksi Database Mengalami Kegagalan
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] p-8 text-center bg-rose-50/50 dark:bg-rose-500/10 border border-rose-200/80 dark:border-rose-500/20 rounded-3xl max-w-7xl mx-auto backdrop-blur-xl shadow-sm my-6">
        <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-rose-500 mb-4 shadow-sm border border-rose-100 dark:border-rose-500/20">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-1.5">
          Gagal Memuat Data Website
        </h3>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
          Terjadi kesalahan saat mencoba mengambil daftar proyek website dari database SULO-MIS. Pastikan koneksi server Anda stabil.
        </p>
      </div>
    );
  }
}