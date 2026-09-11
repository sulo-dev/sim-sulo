"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Sambutan */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Dashboard <span className="text-[#FA4D09]">Operasional</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pantau seluruh infrastruktur klien, domain, dan pemeliharaan secara terpusat.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Badge Sistem Normal menggunakan warna SULO Base */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#011D58]/10 dark:bg-[#011D58]/40 text-[#011D58] dark:text-[#FF9F03] border border-[#011D58]/20 dark:border-[#FF9F03]/30 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#FC7A0B] animate-pulse"></span>
            Sistem Normal • 100% Uptime
          </span>
        </div>
      </div>

      {/* Grid Statistik Kartu (Diupgrade dengan Palet SULO & Data MRR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Klien (SULO Base) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-100 dark:shadow-none backdrop-blur-xl transition-all hover:scale-[1.02] group">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-[#011D58] dark:group-hover:text-[#FF9F03] transition-colors">Total Klien Aktif</p>
            <span className="p-2 rounded-xl bg-[#011D58]/10 text-[#011D58] dark:bg-[#FF9F03]/10 dark:text-[#FF9F03] text-sm">🏢</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">12</h3>
          <span className="text-xs font-semibold text-[#FC7A0B] mt-3 inline-block">↑ 2 klien baru bulan ini</span>
        </div>

        {/* Card 2: Website Terkelola (SULO Secondary) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-100 dark:shadow-none backdrop-blur-xl transition-all hover:scale-[1.02] group">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-[#FC7A0B] transition-colors">Website Terkelola</p>
            <span className="p-2 rounded-xl bg-[#FC7A0B]/10 text-[#FC7A0B] text-sm">🌐</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">18</h3>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-3 inline-block">15 Berjalan, 3 Staging</span>
        </div>

        {/* Card 3: MRR / Pendapatan (SULO Highlight) - Sesuai PRD */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-100 dark:shadow-none backdrop-blur-xl transition-all hover:scale-[1.02] group">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-[#FF9F03] transition-colors">MRR Bulanan</p>
            <span className="p-2 rounded-xl bg-[#FF9F03]/10 text-[#FF9F03] text-sm">💳</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Rp 6.5M</h3>
          <span className="text-xs font-semibold text-[#FC7A0B] mt-2.5 inline-block">Proyeksi margin 45%</span>
        </div>

        {/* Card 4: Critical Alerts (SULO Primary) - 3D Glow sesuai PRD */}
        <div className="p-6 rounded-2xl bg-[#FA4D09]/5 dark:bg-[#FA4D09]/10 border border-[#FA4D09]/30 shadow-[0_0_20px_rgba(250,77,9,0.15)] dark:shadow-[0_0_25px_rgba(250,77,9,0.2)] backdrop-blur-xl transition-all hover:scale-[1.02] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FA4D09]/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex justify-between items-center mb-2 relative z-10">
            <p className="text-xs font-bold uppercase tracking-wider text-[#FA4D09]">Aset Expired</p>
            <span className="p-2 rounded-xl bg-[#FA4D09]/20 text-[#FA4D09] text-sm animate-bounce">⚠️</span>
          </div>
          <h3 className="text-3xl font-black text-[#FA4D09] mt-2 relative z-10">2</h3>
          <span className="text-xs font-semibold text-[#FA4D09]/80 dark:text-[#FA4D09] mt-3 inline-block relative z-10">Domain & SSL (H-14)</span>
        </div>
      </div>

      {/* Bagian Grid Tambahan: Tabel Status & Aktivitas (Lebih Detail) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tabel Utama (2 Kolom) */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-xl p-6 shadow-lg shadow-slate-100 dark:shadow-none">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pantauan Proyek Aktif</h3>
            <Link href="/websites" className="text-xs font-bold text-[#FC7A0B] hover:text-[#FA4D09] transition-colors">Lihat Semua &rarr;</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Proyek & Klien</th>
                  <th className="py-3 px-4 font-semibold">Status Tagihan</th>
                  <th className="py-3 px-4 font-semibold">Tiket Aktif</th>
                  <th className="py-3 px-4 font-semibold text-right">Perpanjangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">Portal Desa Digital</p>
                    <p className="text-[11px] text-slate-500">Pemerintah Desa</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">Lunas</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-[#FA4D09]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FA4D09]"></span> 2 Perbaikan
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">
                    15 Agu 2027
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">Sikeris Management</p>
                    <p className="text-[11px] text-slate-500">CV Afila Media Karya</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FF9F03]/20 text-[#FC7A0B] border border-[#FF9F03]/30">Menunggu (H-5)</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Aman (0)
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">
                    10 Nov 2026
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">SULO-MIS Internal</p>
                    <p className="text-[11px] text-slate-500">SULO.dev</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#011D58]/10 text-[#011D58] dark:bg-[#011D58]/40 dark:text-[#FF9F03] border border-[#011D58]/20">Internal</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-[#FC7A0B]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FC7A0B]"></span> 1 Fitur Baru
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">
                    -
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel Aktivitas & Peringatan Cepat (1 Kolom) */}
        <div className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-xl p-6 shadow-lg shadow-slate-100 dark:shadow-none flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Log Sistem Keamanan</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#011D58]/10 text-[#011D58] dark:bg-[#FF9F03]/10 dark:text-[#FF9F03] mt-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Database Neon Tersinkron</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Hari ini, 10:45 WITA</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 mt-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Vault Kredensial Terenkripsi</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Hari ini, 09:12 WITA</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#FA4D09]/10 text-[#FA4D09] mt-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Peringatan: Vercel SSL Expiring</p>
                  <p className="text-[11px] text-[#FA4D09] font-medium mt-0.5">Butuh tindakan (H-14)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sesi Keamanan (Sesuai PRD) */}
          <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800/80">
            <div className="p-3.5 rounded-xl bg-[#011D58] dark:bg-[#011D58]/40 border border-[#011D58]/50 text-xs text-white font-medium flex items-center justify-between shadow-lg shadow-[#011D58]/20">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Sesi Admin Aman
              </span>
              <span className="text-[#FF9F03]">Auto-logout 45m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}