import { sql } from "@/lib/db";
import { Metadata } from "next";
import AssetClient from "./AssetClient";

// Mencegah Caching Statis (Force Dynamic) agar data inventaris aset selalu real-time
export const dynamic = "force-dynamic";

// Metadata untuk SEO dan Judul Tab Browser Resmi SULO-MIS
export const metadata: Metadata = {
  title: "Manajemen Aset | SULO-MIS",
  description:
    "Kelola inventaris, kondisi, dan peminjaman perangkat operasional tim SULO.",
};

export default async function AssetsPage() {
  try {
    // 1. Ambil Data Aset Beserta Nama Peminjam dari Tabel Users
    const assetsQuery: any = await sql`
      SELECT 
        a.id, 
        a.asset_code as "assetCode", 
        a.name, 
        a.category, 
        a.purchase_date::text as "purchaseDate", 
        a.price, 
        a.condition, 
        a.status, 
        a.assigned_to as "assignedTo", 
        a.notes,
        u.name as "assigneeName"
      FROM company_assets a
      LEFT JOIN users u ON a.assigned_to = u.id
      ORDER BY a.purchase_date DESC NULLS LAST, a.id DESC
    `;

    // 2. Ambil Data Users (Tim/Karyawan Active) untuk Dropdown Modal
    const usersQuery: any = await sql`
      SELECT id, name FROM users 
      WHERE status = 'Active' 
      ORDER BY name ASC
    `;

    // Pastikan Query Mengembalikan Array Aman (menyesuaikan driver database postgres/neon)
    const assetRows = Array.isArray(assetsQuery)
      ? assetsQuery
      : assetsQuery?.rows || [];
    const userRows = Array.isArray(usersQuery)
      ? usersQuery
      : usersQuery?.rows || [];

    // Format & Normalisasi Tipe Data Aset
    const formattedAssets = assetRows.map((asset: any) => ({
      id: Number(asset.id),
      assetCode: String(asset.assetCode || ""),
      name: String(asset.name || ""),
      category: String(asset.category || "Laptop"),
      purchaseDate: asset.purchaseDate ? String(asset.purchaseDate) : null,
      price: asset.price ? String(asset.price) : "0",
      condition: String(asset.condition || "Good"),
      status: String(asset.status || "Available"),
      assignedTo: asset.assignedTo ? String(asset.assignedTo) : null,
      notes: asset.notes ? String(asset.notes) : null,
      assigneeName: asset.assigneeName ? String(asset.assigneeName) : null,
    }));

    // Format Data Dropdown Users
    const formattedUsers = userRows.map((user: any) => ({
      id: String(user.id),
      name: String(user.name),
    }));

    // 3. Serialisasi Data Aman untuk React Client Component
    const serializedAssets = JSON.parse(JSON.stringify(formattedAssets));
    const serializedUsers = JSON.parse(JSON.stringify(formattedUsers));

    return (
      <AssetClient
        initialData={serializedAssets}
        users={serializedUsers}
      />
    );
  } catch (error) {
    // Log Error Server-Side untuk Kemudahan Debugging
    console.error("[DB_ERROR] Gagal memuat data aset:", error);

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
          Gagal Memuat Data Inventaris
        </h3>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
          Terjadi kesalahan saat mengambil data inventaris aset dari database SULO-MIS. Pastikan koneksi server Anda stabil.
        </p>
      </div>
    );
  }
}