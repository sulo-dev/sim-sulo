import { sql } from "@/lib/db";
import { Metadata } from "next";
import ClientDetailClient from "./ClientDetailClient";

// 1. Mencegah Caching Statis agar data klien selalu real-time
export const dynamic = "force-dynamic";

// 2. Dynamic Metadata: Mengubah Judul Tab Browser sesuai Nama Klien
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const clientId = Number(resolvedParams.id);
    
    if (isNaN(clientId)) {
      return { title: "Klien Tidak Valid | SULOMIS" };
    }

    const clientQuery: any = await sql`SELECT company_name FROM clients WHERE id = ${clientId}`;
    const clientRows = clientQuery.rows || clientQuery;

    if (!clientRows || clientRows.length === 0) {
      return { title: "Klien Tidak Ditemukan | SULOMIS" };
    }

    return { 
      title: `${clientRows[0].company_name} - Detail Klien | SULOMIS`,
      description: `Manajemen proyek dan dokumen untuk klien ${clientRows[0].company_name}`
    };
  } catch (error) {
    return { title: "Sistem Error | SULOMIS" };
  }
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const clientId = Number(resolvedParams.id);

    if (isNaN(clientId)) {
      // Kirim null dan flag error ke Client Component
      return <ClientDetailClient client={null} isInvalidId={true} />;
    }

    // Ambil Data Klien Utama
    const clientQuery: any = await sql`
      SELECT id, company_name, pic_name, email, status 
      FROM clients WHERE id = ${clientId}
    `;
    const clientRows = clientQuery.rows || clientQuery;

    if (!clientRows || clientRows.length === 0) {
      // Jika tidak ditemukan, serahkan pada Empty State UI milik Client Component
      return <ClientDetailClient client={null} />;
    }

    const client = clientRows[0];

    // Ambil Data Website Terkait
    const websitesQuery: any = await sql`
      SELECT id, name, status 
      FROM websites WHERE client_id = ${clientId}
    `;
    const websiteRows = websitesQuery.rows || websitesQuery;

    // Ambil Data Dokumen Terkait
    const documentsQuery: any = await sql`
      SELECT d.id, d.title, d.upload_date, w.name as website_name
      FROM documents d
      JOIN websites w ON d.website_id = w.id
      WHERE w.client_id = ${clientId}
    `;
    const documentRows = documentsQuery.rows || documentsQuery;

    // 3. Susun Ulang Format (Data Transformation) untuk Front-End
    const formattedClient = {
      id: Number(client.id),
      companyName: client.company_name || "Perusahaan Tidak Diketahui",
      picName: client.pic_name || "-",
      email: client.email || "",
      status: client.status || "Active",
      websites: websiteRows.map((w: any) => ({ 
        id: Number(w.id), 
        name: w.name, 
        status: w.status || "Active" 
      })),
      documents: documentRows.map((d: any) => ({
        id: Number(d.id),
        title: d.title,
        // Format Tanggal ala Indonesia (contoh: 12 Agustus 2026)
        date: d.upload_date 
          ? new Date(d.upload_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) 
          : 'Tanggal tidak tersedia',
        websiteName: d.website_name
      }))
    };

    return <ClientDetailClient client={formattedClient} />;

  } catch (error) {
    // 4. Error Boundary (Fallback UI Server-Side) jika Database Terputus
    console.error("[DB_ERROR] Gagal memuat halaman detail klien:", error);
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-3xl max-w-4xl mx-auto mt-10">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-full mb-4 shadow-sm border border-rose-100 dark:border-rose-500/30">
          <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-bold text-xl text-rose-600 dark:text-rose-400 mb-2">
          Koneksi Database Terputus
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Terjadi galat pada sistem saat mencoba memuat data riwayat klien. Silakan periksa koneksi server atau hubungi Administrator.
        </p>
      </div>
    );
  }
}