import { sql } from "@/lib/db";
import { Metadata } from "next";
import UsersClient from "./UsersClient";

// 1. Mencegah Caching Statis (Force Dynamic)
// Memastikan data kehadiran, cuti, dan status karyawan selalu real-time
export const dynamic = "force-dynamic";

// 2. Metadata untuk SEO dan Judul Tab Browser
export const metadata: Metadata = {
  title: "Direktori Karyawan | SULOMIS",
  description: "Kelola data akun, peran akses, dan status cuti tim internal SULO.",
};

export default async function UsersPage() {
  try {
    // 1. Ambil data pengguna dari database
    // Diubah menjadi ORDER BY name ASC agar daftar nama tersusun rapi secara alfabetis
    const usersQuery = await sql`
      SELECT 
        id,
        name,
        role,
        email,
        phone,
        status,
        annual_leave_quota,
        is_on_leave,
        joined_date,
        last_login
      FROM users
      ORDER BY name ASC
    `;

    // Pastikan query mengembalikan array (menangani output dinamis dari driver postgres/neon)
    const usersRows = Array.isArray(usersQuery) ? usersQuery : (usersQuery as any).rows || [];

    // Format Data Pengguna untuk Client Component
    const formattedUsers = usersRows.map((user: any) => ({
      id: String(user.id),
      name: String(user.name || "Unknown"),
      role: String(user.role || "Employee"),
      email: String(user.email || "-"),
      phone: String(user.phone || "-"),
      status: String(user.status || "Active"),
      annualLeaveQuota: Number(user.annual_leave_quota || 0),
      isOnLeave: Boolean(user.is_on_leave),
      joinedDate: user.joined_date ? new Date(user.joined_date).toLocaleDateString("id-ID") : "-",
      lastLogin: user.last_login ? new Date(user.last_login).toLocaleString("id-ID") : "-"
    }));

    // 2. Lempar data ke Client Component
    return <UsersClient initialData={formattedUsers} />;

  } catch (error) {
    // 3. Error Boundary (Fallback UI Server-Side) jika Database Terputus
    console.error("[DB_ERROR] Gagal memuat data Direktori Karyawan:", error);
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-3xl max-w-7xl mx-auto mt-8 shadow-sm">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-full mb-4 shadow-sm border border-rose-100 dark:border-rose-500/30">
          <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-bold text-xl text-rose-600 dark:text-rose-400 mb-2">
          Gagal Memuat Direktori Karyawan
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Terjadi kesalahan saat mencoba mengambil data akun internal dari database. Pastikan koneksi server Anda stabil atau hubungi Administrator SULO-MIS.
        </p>
      </div>
    );
  }
}