import { sql } from "@/lib/db";
import { Metadata } from "next";
import WebsiteDetailClient from "./WebsiteDetailClient";

// Mencegah Caching Statis agar data proyek, kredensial, dan arsip selalu real-time
export const dynamic = "force-dynamic";

// Dynamic Metadata untuk Tab Browser
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const websiteId = Number(resolvedParams.id);

    if (isNaN(websiteId)) {
      return { title: "Proyek Tidak Valid | SULO-MIS" };
    }

    const websiteQuery: any = await sql`SELECT name FROM websites WHERE id = ${websiteId}`;
    const websiteRows = Array.isArray(websiteQuery)
      ? websiteQuery
      : websiteQuery?.rows || [];

    if (!websiteRows || websiteRows.length === 0) {
      return { title: "Proyek Tidak Ditemukan | SULO-MIS" };
    }

    return {
      title: `${websiteRows[0].name} - Detail Proyek | SULO-MIS`,
      description: `Manajemen sistem, brankas kredensial, dan arsip untuk proyek ${websiteRows[0].name}`,
    };
  } catch (error) {
    return { title: "Kesalahan Sistem | SULO-MIS" };
  }
}

export default async function WebsiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const resolvedParams = await params;
    const websiteId = Number(resolvedParams.id);

    // 1. Ambil Daftar Klien untuk Opsi Form Edit Proyek
    const clientsQuery: any = await sql`
      SELECT id, company_name FROM clients ORDER BY company_name ASC
    `;
    const clientRows = Array.isArray(clientsQuery)
      ? clientsQuery
      : clientsQuery?.rows || [];

    const formattedClients = clientRows.map((client: any) => ({
      id: Number(client.id),
      companyName: client.company_name,
    }));

    // Validasi ID Numerik
    if (isNaN(websiteId)) {
      return (
        <WebsiteDetailClient website={null} allClients={formattedClients} />
      );
    }

    // 2. Ambil Data Website Utama (Di-join dengan Nama Klien)
    const websiteQuery: any = await sql`
      SELECT 
        w.id, w.name, w.status, w.client_id, w.tech_stack, w.production_url, w.staging_url,
        c.company_name as client_name
      FROM websites w
      LEFT JOIN clients c ON w.client_id = c.id
      WHERE w.id = ${websiteId}
    `;
    const websiteRows = Array.isArray(websiteQuery)
      ? websiteQuery
      : websiteQuery?.rows || [];

    if (!websiteRows || websiteRows.length === 0) {
      return (
        <WebsiteDetailClient website={null} allClients={formattedClients} />
      );
    }

    const website = websiteRows[0];

    // 3. Ambil Arsip Berkas Terkait dari Tabel "archives"
    const archivesQuery: any = await sql`
      SELECT id, title, category, file_url, created_at
      FROM archives
      WHERE website_id = ${websiteId}
      ORDER BY created_at DESC
    `;
    const archiveRows = Array.isArray(archivesQuery)
      ? archivesQuery
      : archivesQuery?.rows || [];

    // 4. Ambil Kredensial Akses Rahasia dari Tabel "credentials"
    const credentialsQuery: any = await sql`
      SELECT id, category, title, username, password, access_url, notes 
      FROM credentials 
      WHERE website_id = ${websiteId} 
      ORDER BY category ASC
    `;
    const credentialRows = Array.isArray(credentialsQuery)
      ? credentialsQuery
      : credentialsQuery?.rows || [];

    // 5. Format Susunan Data Sesuai Kontrak Tipe WebsiteDetailClient
    const formattedWebsite = {
      id: Number(website.id),
      name: website.name,
      status: website.status || "Active",
      clientId: Number(website.client_id),
      clientName: website.client_name || "Klien Tidak Diketahui",
      techStack: website.tech_stack || "",
      productionUrl: website.production_url || "",
      stagingUrl: website.staging_url || "",

      // Mapping data arsip
      archives: archiveRows.map((a: any) => ({
        id: Number(a.id),
        title: a.title,
        category: a.category || "Dokumen",
        fileUrl: a.file_url || "",
        uploadedAt: a.created_at
          ? new Date(a.created_at).toISOString()
          : "",
      })),

      // Mapping data kredensial vault
      credentials: credentialRows.map((c: any) => ({
        id: Number(c.id),
        category: c.category || "Akses Umum",
        title: c.title || "",
        username: c.username || "-",
        password: c.password || "",
        accessUrl: c.access_url || "",
        notes: c.notes || "",
      })),
    };

    // 6. Serialisasi Aman untuk React Client Component
    const serializedWebsite = JSON.parse(JSON.stringify(formattedWebsite));
    const serializedClients = JSON.parse(JSON.stringify(formattedClients));

    return (
      <WebsiteDetailClient
        website={serializedWebsite}
        allClients={serializedClients}
      />
    );
  } catch (error) {
    console.error(
      "[DB_ERROR] Gagal memuat halaman detail website:",
      error
    );

    // Fallback UI Elegan saat Terjadi Kesalahan Database
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] p-8 text-center bg-rose-50/50 dark:bg-rose-500/10 border border-rose-200/80 dark:border-rose-500/20 rounded-3xl max-w-4xl mx-auto backdrop-blur-xl shadow-sm my-8">
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
          Gagal Memuat Detail Proyek
        </h3>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
          Terjadi kesalahan saat mencoba mengambil detail proyek website dari database SULO-MIS. Silakan periksa koneksi server Anda.
        </p>
      </div>
    );
  }
}