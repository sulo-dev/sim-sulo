import { sql } from "@/lib/db";
import { Metadata } from "next";
import TicketsClient from "./TicketsClient";
import { formatDateIndo } from "@/lib/utils";

// Mencegah Caching Statis (Force Dynamic) agar data tiket selalu up-to-date
export const dynamic = "force-dynamic";

// Metadata untuk SEO dan Judul Tab Browser
export const metadata: Metadata = {
  title: "Helpdesk & Tiket | SULO-MIS",
  description: "Manajemen perbaikan bug, pemeliharaan rutin, dan laporan kendala klien SULO.",
};

export default async function TicketsPage() {
  try {
    // 1. Ambil Data Tiket Dukungan dari Database
    const ticketsQuery: any = await sql`
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

    // 2. Ambil Data Website untuk Opsi Form Tambah/Edit Tiket
    const websitesQuery: any = await sql`
      SELECT id, name FROM websites ORDER BY name ASC
    `;

    // Pastikan hasil query terurai aman sebagai Array
    const ticketsRows = Array.isArray(ticketsQuery)
      ? ticketsQuery
      : ticketsQuery?.rows || [];
    const websitesRows = Array.isArray(websitesQuery)
      ? websitesQuery
      : websitesQuery?.rows || [];

    // Format Data Website Dropdown
    const formattedWebsites = websitesRows.map((website: any) => ({
      id: Number(website.id),
      name: String(website.name),
    }));

    // Format & Sanitasi Data Tiket (Proteksi ID & Tanggal)
    const formattedTickets = ticketsRows.map((ticket: any, index: number) => {
      const validId =
        ticket.id !== null && ticket.id !== undefined && !isNaN(Number(ticket.id))
          ? Number(ticket.id)
          : index + 10000;

      return {
        id: validId,
        websiteId: ticket.website_id ? Number(ticket.website_id) : null,
        title: ticket.title || "Tanpa Judul",
        priority: ticket.priority || "Medium",
        status: ticket.status || "Open",
        date: ticket.reported_date ? formatDateIndo(ticket.reported_date) : "-",
        reportedDateRaw: ticket.reported_date
          ? new Date(ticket.reported_date).toISOString()
          : "",
        reportedDate: ticket.reported_date
          ? formatDateIndo(ticket.reported_date)
          : "-",
        description: ticket.description || "",
        websiteName: ticket.website_name || "Internal / General",
        clientName: ticket.company_name || "-",
      };
    });

    // 3. Serialisasi Data untuk React Client Component
    const serializedTickets = JSON.parse(JSON.stringify(formattedTickets));
    const serializedWebsites = JSON.parse(JSON.stringify(formattedWebsites));

    return (
      <TicketsClient
        initialTickets={serializedTickets}
        websites={serializedWebsites}
      />
    );
  } catch (error) {
    // Log error di server console untuk memudahkan pencatatan bug
    console.error("[DB_ERROR] Gagal memuat data Helpdesk/Tiket:", error);

    // Fallback UI Elegan saat Terjadi Kesalahan Database
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
          Gagal Memuat Papan Tiket
        </h3>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
          Terjadi kesalahan saat mencoba mengambil data tiket dukungan dari database SULO-MIS. Pastikan koneksi server Anda stabil.
        </p>
      </div>
    );
  }
}