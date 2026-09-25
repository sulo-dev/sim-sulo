import { sql } from "@/lib/db";
import { Metadata } from "next";
import WebsiteDetailClient from "./WebsiteDetailClient";

// 1. Mencegah Caching Statis agar data proyek dan dokumen selalu real-time
export const dynamic = "force-dynamic";

// 2. Dynamic Metadata: Mengubah Judul Tab Browser sesuai Nama Website
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const websiteId = Number(resolvedParams.id);
    
    if (isNaN(websiteId)) {
      return { title: "Proyek Tidak Valid | SULOMIS" };
    }

    const websiteQuery: any = await sql`SELECT name FROM websites WHERE id = ${websiteId}`;
    const websiteRows = Array.isArray(websiteQuery) ? websiteQuery : websiteQuery.rows || [];

    if (!websiteRows || websiteRows.length === 0) {
      return { title: "Proyek Tidak Ditemukan | SULOMIS" };
    }

    return { 
      title: `${websiteRows[0].name} - Detail Proyek | SULOMIS`,
      description: `Manajemen sistem, tech stack, dan dokumen untuk proyek ${websiteRows[0].name}`
    };
  } catch (error) {
    return { title: "Sistem Error | SULOMIS" };
  }
}

export default async function WebsiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const websiteId = Number(resolvedParams.id);

    // Ambil Daftar Klien untuk keperluan form Edit Proyek
    const clientsQuery: any = await sql`SELECT id, company_name FROM clients ORDER BY company_name ASC`;
    const clientRows = Array.isArray(clientsQuery) ? clientsQuery : clientsQuery.rows || [];
    const formattedClients = clientRows.map((client: any) => ({
      id: client.id,
      companyName: client.company_name,
    }));

    // Jika ID tidak berupa angka, lempar state null ke Client Component (agar menampilkan Empty State yang elegan)
    if (isNaN(websiteId)) {
      return <WebsiteDetailClient website={null} allClients={formattedClients} />;
    }

    // Ambil Data Website Utama (Di-join dengan nama klien)
    const websiteQuery: any = await sql`
      SELECT 
        w.id, w.name, w.status, w.client_id, w.tech_stack, w.production_url,
        c.company_name as client_name
      FROM websites w
      LEFT JOIN clients c ON w.client_id = c.id
      WHERE w.id = ${websiteId}
    `;
    const websiteRows = Array.isArray(websiteQuery) ? websiteQuery : websiteQuery.rows || [];

    // Jika website tidak ditemukan
    if (!websiteRows || websiteRows.length === 0) {
      return <WebsiteDetailClient website={null} allClients={formattedClients} />;
    }

    const website = websiteRows[0];

    // Ambil Dokumen Terkait
    const documentsQuery: any = await sql`
      SELECT id, title, upload_date, file_url
      FROM documents
      WHERE website_id = ${websiteId}
    `;
    const documentRows = Array.isArray(documentsQuery) ? documentsQuery : documentsQuery.rows || [];

    // Susun format data untuk Front-End
    const formattedWebsite = {
      id: Number(website.id),
      name: website.name,
      status: website.status || "Active",
      clientId: Number(website.client_id),
      clientName: website.client_name || "Klien Tidak Diketahui",
      techStack: website.tech_stack || "",
      productionUrl: website.production_url || "",
      documents: documentRows.map((d: any) => ({
        id: Number(d.id),
        title: d.title,
        fileUrl: d.file_url || "",
        date: d.upload_date 
          ? new Date(d.upload_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) 
          : 'Tanggal tidak tersedia',
      }))
    };

    return <WebsiteDetailClient website={formattedWebsite} allClients={formattedClients} />;

  } catch (error) {
    // 3. Error Boundary (Fallback UI Server-Side) jika Database Terputus
    console.error("[DB_ERROR] Gagal memuat halaman detail website:", error);
    
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
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Terjadi galat pada sistem saat mencoba memuat data proyek. Silakan periksa koneksi server atau hubungi Administrator SULO-MIS.
        </p>
      </div>
    );
  }
}