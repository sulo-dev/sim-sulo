import { sql } from "@/lib/db";
import { Metadata } from "next";
import PayrollClient from "./PayrollClient";

// Mencegah Caching Statis (Force Dynamic) agar data payroll selalu real-time
export const dynamic = "force-dynamic";

// Metadata untuk SEO dan Judul Tab Browser Resmi SULO-MIS
export const metadata: Metadata = {
  title: "Rekap Honor & Payroll | SULO-MIS",
  description:
    "Catatan penggajian, bagi hasil, dan bonus tim developer SULO.",
};

export default async function PayrollPage() {
  try {
    // 1. Ambil data payroll, JOIN ke tabel users (untuk nama tim) dan websites (untuk nama proyek)
    const payrollsQuery: any = await sql`
      SELECT 
        p.id, 
        p.user_id as "userId", 
        u.name as "userName",
        p.website_id as "websiteId", 
        w.name as "websiteName",
        p.type, 
        p.amount, 
        p.payment_date::text as "paymentDate", 
        p.status, 
        p.notes
      FROM payrolls p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN websites w ON p.website_id = w.id
      ORDER BY p.payment_date DESC NULLS LAST, p.id DESC
    `;

    // 2. Ambil data anggota tim (Hanya yang Active) untuk dropdown form
    const usersQuery: any = await sql`
      SELECT id, name FROM users 
      WHERE status = 'Active' 
      ORDER BY name ASC
    `;

    // 3. Ambil data proyek/website untuk dropdown form Bonus/Bagi Hasil
    const websitesQuery: any = await sql`
      SELECT id, name FROM websites 
      ORDER BY name ASC
    `;

    // Pastikan query mengembalikan array aman (menyesuaikan driver database postgres/neon)
    const payrollRows = Array.isArray(payrollsQuery)
      ? payrollsQuery
      : payrollsQuery?.rows || [];
    const userRows = Array.isArray(usersQuery)
      ? usersQuery
      : usersQuery?.rows || [];
    const websiteRows = Array.isArray(websitesQuery)
      ? websitesQuery
      : websitesQuery?.rows || [];

    // Format & Sanitasi Data Payroll
    const formattedPayrolls = payrollRows.map((pay: any) => ({
      id: Number(pay.id),
      userId: String(pay.userId || ""),
      userName: pay.userName || "Anggota Tim",
      websiteId: pay.websiteId ? Number(pay.websiteId) : null,
      websiteName: pay.websiteName || null,
      type: pay.type || "Gaji Pokok",
      amount: pay.amount ? String(pay.amount) : "0",
      paymentDate: pay.paymentDate ? String(pay.paymentDate) : null,
      status: pay.status || "Unpaid",
      notes: pay.notes || null,
    }));

    // Format Data Users & Websites Dropdown
    const formattedUsers = userRows.map((u: any) => ({
      id: String(u.id),
      name: String(u.name),
    }));

    const formattedWebsites = websiteRows.map((w: any) => ({
      id: Number(w.id),
      name: String(w.name),
    }));

    // 4. Serialisasi Data Aman untuk React Client Component
    const serializedPayrolls = JSON.parse(JSON.stringify(formattedPayrolls));
    const serializedUsers = JSON.parse(JSON.stringify(formattedUsers));
    const serializedWebsites = JSON.parse(JSON.stringify(formattedWebsites));

    return (
      <PayrollClient
        initialData={serializedPayrolls}
        users={serializedUsers}
        websites={serializedWebsites}
      />
    );
  } catch (error) {
    // Log Error Server-Side untuk Kemudahan Debugging
    console.error("[DB_ERROR] Gagal memuat data payroll:", error);

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
          Gagal Memuat Data Payroll
        </h3>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
          Terjadi kesalahan saat mencoba mengambil catatan honorarium dari database SULO-MIS. Pastikan koneksi server Anda stabil.
        </p>
      </div>
    );
  }
}