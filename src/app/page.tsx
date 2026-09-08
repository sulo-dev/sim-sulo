"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Sambutan */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Dashboard Operasional</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pantau seluruh infrastruktur klien, domain, dan pemeliharaan secara terpusat.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sistem Normal • 100% Uptime
          </span>
        </div>
      </div>

      {/* Grid Statistik Kartu (Diupgrade agar sangat elegan di mode terang & gelap) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-lg shadow-slate-100 dark:shadow-none backdrop-blur-xl transition-all hover:scale-[1.02]">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Total Klien Aktif</p>
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm">🏢</span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">12</h3>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-3 inline-block">↑ 2 klien baru bulan ini</span>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-lg shadow-slate-100 dark:shadow-none backdrop-blur-xl transition-all hover:scale-[1.02]">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Website Terkelola</p>
            <span className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-sm">🌐</span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">18</h3>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-3 inline-block">15 Berjalan, 3 Staging</span>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-lg shadow-slate-100 dark:shadow-none backdrop-blur-xl transition-all hover:scale-[1.02]">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Aset Segera Expired</p>
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm">⚠️</span>
          </div>
          <h3 className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">2</h3>
          <span className="text-xs font-semibold text-amber-600/80 dark:text-amber-400/80 mt-3 inline-block">Domain & SSL dalam 30 hari</span>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-lg shadow-slate-100 dark:shadow-none backdrop-blur-xl transition-all hover:scale-[1.02]">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Tiket Terbuka</p>
            <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm">🎫</span>
          </div>
          <h3 className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">1</h3>
          <span className="text-xs font-semibold text-rose-600/80 dark:text-rose-400/80 mt-3 inline-block">Perlu penanganan segera</span>
        </div>
      </div>

      {/* Bagian Grid Tambahan: Tabel Status Website & Aktivitas Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabel Utama (2 Kolom) */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl p-6 shadow-lg shadow-slate-100 dark:shadow-none">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Status Website Klien Terbaru</h3>
            <Link href="/websites" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Lihat Semua &rarr;</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Nama Website</th>
                  <th className="py-3 px-4 font-semibold">Klien</th>
                  <th className="py-3 px-4 font-semibold">Tech Stack</th>
                  <th className="py-3 px-4 font-semibold">Status Kontrak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                <tr>
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">Portal Desa Digital</td>
                  <td className="py-4 px-4 text-slate-500 dark:text-slate-400">Pemerintah Desa</td>
                  <td className="py-4 px-4"><span className="px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-medium">Next.js / Tailwind</span></td>
                  <td className="py-4 px-4"><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">Active Contract</span></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">Sikeris Management</td>
                  <td className="py-4 px-4 text-slate-500 dark:text-slate-400">CV Afila Media Karya</td>
                  <td className="py-4 px-4"><span className="px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-medium">React / Node</span></td>
                  <td className="py-4 px-4"><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">Warranty</span></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">SULO-MIS Internal</td>
                  <td className="py-4 px-4 text-slate-500 dark:text-slate-400">SULO.dev</td>
                  <td className="py-4 px-4"><span className="px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-medium">Next.js 15 / Prisma</span></td>
                  <td className="py-4 px-4"><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">Internal System</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel Aktivitas & Peringatan Cepat (1 Kolom) */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl p-6 shadow-lg shadow-slate-100 dark:shadow-none flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Aktivitas Sistem</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">Database Neon tersinkron</p>
                  <p className="text-xs text-slate-400">Hari ini, 10:45 WITA</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">Backup otomatis Vercel Blob</p>
                  <p className="text-xs text-slate-400">Kemarin, 23:00 WITA</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">Peringatan: Domain SSL Vercel</p>
                  <p className="text-xs text-slate-400">2 hari yang lalu</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300 font-medium text-center">
              Sesi Admin aktif • Auto-logout 45 menit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}