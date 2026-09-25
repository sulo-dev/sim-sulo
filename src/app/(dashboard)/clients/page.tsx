import { sql } from "@/lib/db";
import { Metadata } from "next";
import Clientsclient, { ClientData } from "./Clientsclient";

// Mencegah Next.js melakukan caching statis pada halaman ini
// Memastikan data klien di dashboard selalu up-to-date (Real-time)
export const dynamic = "force-dynamic";

// Mengatur judul pada tab browser
export const metadata: Metadata = {
  title: "Direktori Klien | SULOMIS",
  description: "Kelola data klien, kontak PIC, dan aset digital mereka.",
};

export default async function ClientsPage() {
  try {
    // Mengeksekusi kueri langsung ke database
    const clientsData = (await sql`
      SELECT 
        c.id, 
        c.company_name as "companyName", 
        c.pic_name as "picName", 
        c.email, 
        c.status,
        COALESCE(json_agg(w.name) FILTER (WHERE w.name IS NOT NULL), '[]') as websites
      FROM clients c
      LEFT JOIN websites w ON c.id = w.client_id
      GROUP BY c.id
      ORDER BY c.id ASC
    `) as ClientData[];

    return <Clientsclient initialClients={clientsData} />;
    
  } catch (error) {
    // Log error ke server console untuk keperluan debugging
    console.error("[DB_ERROR] Gagal mengambil data klien:", error);
    
    // Fallback UI jika koneksi database gagal
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-3xl max-w-7xl mx-auto">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-full mb-4 shadow-sm">
          <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-bold text-xl text-rose-600 dark:text-rose-400 mb-2">
          Gagal Memuat Database
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Terjadi kesalahan saat mencoba mengambil data klien dari database. Pastikan server database menyala dan koneksi aman.
        </p>
      </div>
    );
  }
}