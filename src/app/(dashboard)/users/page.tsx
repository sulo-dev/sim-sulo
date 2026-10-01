import { sql } from "@/lib/db";
import { Metadata } from "next";
import UsersClient from "./UsersClient";

// Mencegah Caching Statis (Force Dynamic) agar data karyawan & status cuti selalu real-time
export const dynamic = "force-dynamic";

// Metadata untuk SEO dan Judul Tab Browser Resmi SULO-MIS
export const metadata: Metadata = {
  title: "Direktori Karyawan | SULO-MIS",
  description:
    "Kelola data akun, peran akses, dan status cuti tim internal SULO.",
};

export default async function UsersPage() {
  try {
    // 1. Ambil Data Pengguna dari Database (Urut Alfabetis berdasarkan Nama)
    const usersQuery: any = await sql`
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

    // Pastikan query mengembalikan array aman (menyesuaikan driver database postgres/neon)
    const userRows = Array.isArray(usersQuery)
      ? usersQuery
      : usersQuery?.rows || [];

    // Format & Normalisasi Tipe Data Pengguna
    const formattedUsers = userRows.map((user: any) => {
      let joinedStr = "-";
      if (user.joined_date) {
        const d = new Date(user.joined_date);
        joinedStr = !isNaN(d.getTime())
          ? d.toISOString().split("T")[0]
          : String(user.joined_date);
      }

      let lastLoginStr = "-";
      if (user.last_login) {
        const d = new Date(user.last_login);
        lastLoginStr = !isNaN(d.getTime())
          ? d.toISOString()
          : String(user.last_login);
      }

      return {
        id: String(user.id),
        name: String(user.name || "Unknown"),
        role: String(user.role || "Employee"),
        email: String(user.email || "-"),
        phone: String(user.phone || "-"),
        status: String(user.status || "Active"),
        annualLeaveQuota: Number(user.annual_leave_quota || 0),
        isOnLeave: Boolean(user.is_on_leave),
        joinedDate: joinedStr,
        lastLogin: lastLoginStr,
      };
    });

    // 2. SERIALIZATION BOUNDARY: Pastikan JSON Murni Tanpa Objek JS Non-Primitif
    const serializedUsers = JSON.parse(JSON.stringify(formattedUsers));

    return <UsersClient initialData={serializedUsers} />;
  } catch (error) {
    // Log Error Server-Side untuk Kemudahan Debugging
    console.error("[DB_ERROR] Gagal memuat data Direktori Karyawan:", error);

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
          Gagal Memuat Direktori Karyawan
        </h3>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
          Terjadi kesalahan saat mengambil data akun internal dari database SULO-MIS. Pastikan koneksi server Anda stabil.
        </p>
      </div>
    );
  }
}