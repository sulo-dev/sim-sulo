import { sql } from "@/lib/db";
import { Metadata } from "next";
import VaultClient from "./VaultClient";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pusat Vault Kredensial | SULOMIS",
  description: "Brankas terpusat untuk menyimpan akses cPanel, VPS, Database, dan repositori proyek.",
};

export default async function VaultPage() {
  try {
    const credentialsQuery = await sql`
      SELECT 
        c.id,
        c.website_id,
        w.name AS website_name,
        cl.company_name AS client_name,
        COALESCE(c.title, c.category) AS title,
        c.category,
        COALESCE(c.access_url, '') AS access_url,
        c.username,
        COALESCE(c.password, '') AS password,
        COALESCE(c.port, '') AS port,
        COALESCE(c.notes, '') AS notes
      FROM credentials c
      JOIN websites w ON c.website_id = w.id
      LEFT JOIN clients cl ON w.client_id = cl.id
      ORDER BY c.id DESC
    `;

    const websitesQuery = await sql`
      SELECT w.id, w.name, COALESCE(cl.company_name, 'Internal') AS client_name
      FROM websites w
      LEFT JOIN clients cl ON w.client_id = cl.id
      ORDER BY w.name ASC
    `;

    const credentialRows = Array.isArray(credentialsQuery) ? credentialsQuery : (credentialsQuery as any).rows || [];
    const websiteRows = Array.isArray(websitesQuery) ? websitesQuery : (websitesQuery as any).rows || [];

    const formattedCredentials = credentialRows.map((c: any) => ({
      id: Number(c.id),
      websiteId: Number(c.website_id),
      websiteName: c.website_name || "Tanpa Nama Proyek",
      clientName: c.client_name || "Internal",
      title: c.title || c.category || "Akses Sistem",
      category: c.category || "Lainnya",
      accessUrl: c.access_url || "",
      username: c.username || "",
      password: c.password || "",
      port: c.port || "",
      notes: c.notes || "",
    }));

    const formattedWebsites = websiteRows.map((w: any) => ({
      id: Number(w.id),
      name: w.name,
      clientName: w.client_name,
    }));

    return <VaultClient initialCredentials={formattedCredentials} websites={formattedWebsites} />;

  } catch (error) {
    console.error("[DB_ERROR] Vault Page:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-3xl max-w-7xl mx-auto mt-8">
        <h3 className="font-bold text-xl text-rose-600 dark:text-rose-400 mb-2">Gagal Memuat Vault Kredensial</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">Terjadi kesalahan koneksi database.</p>
      </div>
    );
  }
}