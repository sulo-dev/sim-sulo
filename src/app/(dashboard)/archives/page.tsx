import { sql } from "@/lib/db";
import { Metadata } from "next";
import ArchiveClient from "./ArchiveClient";

// Memastikan data Arsip Sentral selalu real-time (tidak di-cache)
export const dynamic = "force-dynamic";

// Metadata untuk SEO dan Judul Tab Browser Resmi SULO-MIS
export const metadata: Metadata = {
  title: "Arsip Sentral | SULO-MIS",
  description:
    "Manajemen dokumen, legalitas PT, dan berkas proyek terpusat SULO.",
};

export default async function ArchivesPage() {
  try {
    // 1. Ambil Data Arsip Beserta Nama Website/Proyek Terkait
    const archivesQuery: any = await sql`
      SELECT 
        a.id, 
        a.category, 
        a.website_id, 
        w.name AS website_name,
        a.title, 
        a.file_url, 
        a.file_extension, 
        a.file_size, 
        a.uploaded_by, 
        a.created_at
      FROM archives a
      LEFT JOIN websites w ON a.website_id = w.id
      ORDER BY a.created_at DESC, a.id DESC
    `;

    // 2. Ambil Data Website untuk Opsi Dropdown Filter/Tambah Arsip
    const websitesQuery: any = await sql`
      SELECT id, name 
      FROM websites 
      ORDER BY name ASC
    `;

    // Ekstrak Baris Data Aman (menyesuaikan driver database postgres/neon)
    const archiveRows = Array.isArray(archivesQuery)
      ? archivesQuery
      : archivesQuery?.rows || [];
    const websiteRows = Array.isArray(websitesQuery)
      ? websitesQuery
      : websitesQuery?.rows || [];

    // 3. Format & Normalisasi Tipe Data (Mapping ke CamelCase untuk Client Component)
    const formattedArchives = archiveRows.map((a: any) => {
      let dateStr = "-";
      if (a.created_at) {
        const d = new Date(a.created_at);
        dateStr = !isNaN(d.getTime()) ? d.toISOString() : String(a.created_at);
      }

      return {
        id: Number(a.id),
        category: String(a.category || "Uncategorized"),
        websiteId: a.website_id ? Number(a.website_id) : null,
        websiteName: a.website_name ? String(a.website_name) : undefined,
        title: String(a.title || "Untitled Document"),
        fileUrl: String(a.file_url || ""),
        fileExtension: String(a.file_extension || "unknown"),
        fileSize: String(a.file_size || "0 KB"),
        uploadedBy: String(a.uploaded_by || "Sistem"),
        uploadDate: dateStr,
      };
    });

    const formattedWebsites = websiteRows.map((w: any) => ({
      id: Number(w.id),
      name: String(w.name),
    }));

    // 4. SERIALIZATION BOUNDARY: Pastikan JSON Murni Tanpa Objek JS Non-Primitif
    const serializedArchives = JSON.parse(JSON.stringify(formattedArchives));
    const serializedWebsites = JSON.parse(JSON.stringify(formattedWebsites));

    return (
      <ArchiveClient
        initialData={serializedArchives}
        websites={serializedWebsites}
      />
    );
  } catch (error) {
    // Log Error Server-Side untuk Kemudahan Debugging
    console.error("[ARCHIVES_PAGE_ERROR] Gagal memuat data arsip:", error);

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
          Gagal Memuat Arsip Sentral
        </h3>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
          Terjadi galat saat mengambil data berkas dari database SULO-MIS. Pastikan koneksi server Anda stabil.
        </p>
      </div>
    );
  }
}