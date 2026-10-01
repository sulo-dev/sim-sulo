import { sql } from "@/lib/db";
import { Metadata } from "next";
import Clientsclient, { ClientData } from "./Clientsclient";

// Mencegah Next.js melakukan caching statis pada halaman ini
// Memastikan data direktori klien selalu up-to-date (Real-time)
export const dynamic = "force-dynamic";

// Mengatur judul dan deskripsi pada tab browser
export const metadata: Metadata = {
  title: "Direktori Klien | SULO-MIS",
  description: "Kelola data klien, kontak PIC, dan portofolio aset digital perusahaan.",
};

export default async function ClientsPage() {
  try {
    // Mengeksekusi kueri agregasi data klien dan daftar website terkait dari database
    const clientsQuery: any = await sql`
      SELECT 
        c.id, 
        c.company_name as "companyName", 
        c.pic_name as "picName", 
        c.email, 
        c.phone,
        c.status,
        COALESCE(json_agg(w.name) FILTER (WHERE w.name IS NOT NULL), '[]') as websites
      FROM clients c
      LEFT JOIN websites w ON c.id = w.client_id
      GROUP BY c.id
      ORDER BY c.id ASC
    `;

    // Penanganan fleksibel untuk memastikan output data selalu berupa Array
    const rows = Array.isArray(clientsQuery)
      ? clientsQuery
      : clientsQuery?.rows || [];

    return <Clientsclient initialClients={rows as ClientData[]} />;
  } catch (error) {
    // Log error ke server console untuk kemudahan debugging
    console.error("[DB_ERROR] Gagal mengambil data klien dari database:", error);

    // Fallback UI Elegan saat koneksi database mengalami kegagalan
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
          Gagal Memuat Data Klien
        </h3>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
          Terjadi kendala saat menghubungkan ke database server SULO-MIS. Pastikan koneksi jaringan database aktif dan kredensial lingkungan sudah benar.
        </p>
      </div>
    );
  }
}