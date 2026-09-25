import { sql } from "@/lib/db";
import { Metadata } from "next";
import TicketsClient from "./TicketsClient";
import { formatDateIndo } from "@/lib/utils"; 

// 1. Mencegah Caching Statis (Force Dynamic)
export const dynamic = "force-dynamic";

// 2. Metadata untuk SEO dan Judul Tab Browser
export const metadata: Metadata = {
  title: "Helpdesk & Tiket | SULOMIS",
  description: "Manajemen perbaikan bug, maintenance rutin, dan laporan kendala klien.",
};

export default async function TicketsPage() {
  try {
    // 1. Ambil data Tiket dari Database
    const ticketsQuery = await sql`
      SELECT 
        t.id, 
        t.website_id,
        t.title, 
        t.priority, 
        t.status, 
        t.reported_date, 
        t.description,
        w.name as website_name,
        c.company_name
      FROM tickets t
      LEFT JOIN websites w ON t.website_id = w.id
      LEFT JOIN clients c ON w.client_id = c.id
      ORDER BY t.reported_date DESC
    `;

    // 2. Ambil data Website untuk dropdown form tambah tiket
    const websitesQuery = await sql`
      SELECT id, name FROM websites ORDER BY name ASC
    `;

    // Pastikan query mengembalikan array
    const ticketsRows = Array.isArray(ticketsQuery) ? ticketsQuery : (ticketsQuery as any).rows || [];
    const websitesRows = Array.isArray(websitesQuery) ? websitesQuery : (websitesQuery as any).rows || [];

    // Format Data Website
    const formattedWebsites = websitesRows.map((website: any) => ({
      id: Number(website.id),
      name: String(website.name),
    }));

    // Pemetaan data tiket dengan proteksi anti-NaN (Mencegah ID kosong/null)
    const formattedTickets = ticketsRows.map((ticket: any, index: number) => {
      // Validasi ID: Jika id dari DB null/undefined/NaN, berikan fallback angka unik
      const validId = ticket.id !== null && ticket.id !== undefined && !isNaN(Number(ticket.id))
        ? Number(ticket.id)
        : index + 10000; // Angka unik cadangan agar tidak pernah konflik/NaN

      return {
        id: validId,
        websiteId: ticket.website_id ? Number(ticket.website_id) : null, 
        title: ticket.title || "Tanpa Judul",
        priority: ticket.priority || "Medium",
        status: ticket.status || "Open",
        date: ticket.reported_date ? formatDateIndo(ticket.reported_date) : "-",
        reportedDateRaw: ticket.reported_date ? new Date(ticket.reported_date).toISOString() : "", 
        reportedDate: ticket.reported_date ? formatDateIndo(ticket.reported_date) : "-", 
        description: ticket.description || "",
        websiteName: ticket.website_name || "Internal / General",
        clientName: ticket.company_name || "-",
      };
    });

    // 3. Kirim data tiket yang sudah dibersihkan ke Client
    return <TicketsClient initialTickets={formattedTickets} websites={formattedWebsites} />;

  } catch (error) {
    // 4. Error Boundary (Fallback UI Server-Side) jika Database Terputus
    console.error("[DB_ERROR] Gagal memuat data Helpdesk/Tiket:", error);
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-3xl max-w-7xl mx-auto mt-8 shadow-sm">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-full mb-4 shadow-sm border border-rose-100 dark:border-rose-500/30">
          <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-bold text-xl text-rose-600 dark:text-rose-400 mb-2">
          Gagal Memuat Papan Tiket
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Terjadi kesalahan saat mencoba mengambil data tiket dukungan dari database. Pastikan koneksi server Anda stabil atau hubungi Administrator SULO-MIS.
        </p>
      </div>
    );
  }
}