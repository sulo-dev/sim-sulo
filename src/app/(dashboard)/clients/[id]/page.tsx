import { sql } from "@/lib/db";
import { Metadata } from "next";
import ClientDetailClient from "./ClientDetailClient";

// Memastikan data halaman detail klien selalu real-time (tidak di-cache)
export const dynamic = "force-dynamic";

// Dynamic Metadata untuk Tab Browser
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const clientId = Number(resolvedParams.id);

    if (isNaN(clientId)) return { title: "Klien Tidak Valid | SULO-MIS" };

    const clientQuery: any = await sql`SELECT company_name FROM clients WHERE id = ${clientId}`;
    const clientRows = Array.isArray(clientQuery) ? clientQuery : clientQuery.rows || [];

    if (!clientRows || clientRows.length === 0) {
      return { title: "Klien Tidak Ditemukan | SULO-MIS" };
    }

    return { title: `${clientRows[0].company_name} - Detail Klien | SULO-MIS` };
  } catch (error) {
    return { title: "Kesalahan Sistem | SULO-MIS" };
  }
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const resolvedParams = await params;
    const clientId = Number(resolvedParams.id);

    // Validasi ID numerik
    if (isNaN(clientId)) {
      return <ClientDetailClient client={null} isInvalidId={true} />;
    }

    // 1. Ambil Data Klien Utama
    const clientQuery: any = await sql`
      SELECT id, company_name, pic_name, email, phone, address, status 
      FROM clients WHERE id = ${clientId}
    `;
    const clientRows = Array.isArray(clientQuery) ? clientQuery : clientQuery.rows || [];

    if (!clientRows || clientRows.length === 0) {
      return <ClientDetailClient client={null} />;
    }
    const clientData = clientRows[0];

    // 2. Ambil Daftar Proyek/Website Milik Klien
    const websitesQuery: any = await sql`
      SELECT id, name, tech_stack, status, production_url 
      FROM websites WHERE client_id = ${clientId} ORDER BY id DESC
    `;
    const websiteRows = Array.isArray(websitesQuery) ? websitesQuery : websitesQuery.rows || [];

    // 3. Ambil Log Meeting / Catatan Komunikasi
    const meetingsQuery: any = await sql`
      SELECT id, title, meeting_date, notes 
      FROM meeting_logs WHERE client_id = ${clientId} ORDER BY meeting_date DESC
    `;
    const meetingRows = Array.isArray(meetingsQuery) ? meetingsQuery : meetingsQuery.rows || [];

    // 4. Ambil Dokumen & Kontrak dari Tabel "archives"
    const archivesQuery: any = await sql`
      SELECT a.id, a.title, a.created_at, w.name as website_name, a.file_url 
      FROM archives a
      JOIN websites w ON a.website_id = w.id
      WHERE w.client_id = ${clientId}
      ORDER BY a.created_at DESC
    `;
    const archiveRows = Array.isArray(archivesQuery) ? archivesQuery : archivesQuery.rows || [];

    // 5. Format Susunan Data Sesuai Kontrak Tipe ClientDetailClient
    const formattedClient = {
      id: Number(clientData.id),
      companyName: clientData.company_name,
      picName: clientData.pic_name || "-",
      email: clientData.email || "-",
      phone: clientData.phone || "-",
      address: clientData.address || "-",
      status: clientData.status || "Prospek",

      websites: websiteRows.map((w: any) => ({
        id: Number(w.id),
        name: w.name,
        techStack: w.tech_stack || "-",
        status: w.status,
        productionUrl: w.production_url || "",
      })),

      meetings: meetingRows.map((m: any) => {
        const d = new Date(m.meeting_date);
        return {
          id: Number(m.id),
          title: m.title,
          date: !isNaN(d.getTime())
            ? d.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
          notes: m.notes || "",
        };
      }),

      documents: archiveRows.map((a: any) => {
        const d = new Date(a.created_at);
        return {
          id: Number(a.id),
          title: a.title,
          websiteName: a.website_name,
          fileUrl: a.file_url || "",
          date: !isNaN(d.getTime())
            ? d.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "-",
        };
      }),
    };

    // 6. Serialisasi Aman untuk React Client Component
    const serializedData = JSON.parse(JSON.stringify(formattedClient));

    return <ClientDetailClient client={serializedData} />;
  } catch (error) {
    console.error("[CLIENT_DB_ERROR] Gagal memuat detail klien:", error);

    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] p-8 text-center bg-rose-50/50 dark:bg-rose-500/10 border border-rose-200/80 dark:border-rose-500/20 rounded-3xl max-w-4xl mx-auto backdrop-blur-xl shadow-sm my-8">
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
          Gagal Memuat Detail Klien
        </h3>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
          Terjadi kesalahan saat mengambil riwayat data klien dari database. Pastikan jaringan database stabil.
        </p>
      </div>
    );
  }
}