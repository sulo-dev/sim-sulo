"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data Audit Log
const allAuditLogs = [
  { id: "LOG-1045", timestamp: "10 Sep 2026, 14:30:00", user: "Admin (SULO)", action: "Menghapus Aset", module: "Infrastruktur", detail: "Menghapus domain usang (lama.com)" },
  { id: "LOG-1044", timestamp: "10 Sep 2026, 09:15:22", user: "System", action: "Auto-Renewal", module: "Keuangan", detail: "Generate Invoice Bulanan Sikeris" },
  { id: "LOG-1043", timestamp: "09 Sep 2026, 16:45:10", user: "Admin (SULO)", action: "Menutup Tiket", module: "Helpdesk", detail: "Resolusi TKT-005: Tombol cuti HRD" },
  { id: "LOG-1042", timestamp: "08 Sep 2026, 11:20:05", user: "Klien (Desa)", action: "Login Berhasil", module: "Otentikasi", detail: "IP: 114.125.10.22" },
  { id: "LOG-1041", timestamp: "08 Sep 2026, 10:05:00", user: "Admin (SULO)", action: "Update Data", module: "Website", detail: "Update stack Next.js ke v15 (Portal Desa)" },
  { id: "LOG-1040", timestamp: "05 Sep 2026, 08:30:11", user: "System", action: "Backup DB", module: "Infrastruktur", detail: "Backup rutin Database Utama (Success)" },
];

export default function AuditPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [isDownloading, setIsDownloading] = useState(false);

  // Kalkulasi Ringkasan
  const totalLogs = allAuditLogs.length;
  const authLogs = allAuditLogs.filter(l => l.module === "Otentikasi").length;
  const systemLogs = allAuditLogs.filter(l => l.user === "System").length;

  // Logika Pencarian dan Filter
  const filteredLogs = allAuditLogs.filter((log) => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.detail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = moduleFilter === "All" || log.module === moduleFilter;
    
    return matchesSearch && matchesModule;
  });

  // FUNGSI: Ekspor ke CSV
  const handleDownloadCSV = () => {
    setIsDownloading(true);

    // Sedikit delay agar UX terlihat seperti memproses data
    setTimeout(() => {
      // 1. Definisikan Header CSV
      const headers = ["ID Log", "Waktu", "Pengguna", "Aksi", "Modul Terkait", "Detail"];
      
      // 2. Map data tabel ke format baris CSV
      const csvRows = [headers.join(",")]; // Tambahkan header di baris pertama

      filteredLogs.forEach(log => {
        // Menggunakan tanda kutip ganda ("") agar koma (,) di dalam teks tidak merusak format kolom CSV
        const row = [
          log.id,
          `"${log.timestamp}"`,
          `"${log.user}"`,
          `"${log.action}"`,
          log.module,
          `"${log.detail}"`
        ];
        csvRows.push(row.join(","));
      });

      // 3. Gabungkan semua baris menjadi satu string panjang
      const csvString = csvRows.join("\n");

      // 4. Buat objek Blob untuk mendownload file
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      
      // 5. Buat elemen <a> virtual untuk men-trigger download
      const a = document.createElement("a");
      a.setAttribute("hidden", "");
      a.setAttribute("href", url);
      // Format nama file: Audit_Log_Tanggal.csv
      const dateStr = new Date().toISOString().split('T')[0];
      a.setAttribute("download", `Audit_Log_${dateStr}.csv`);
      
      document.body.appendChild(a);
      a.click(); // Klik otomatis
      
      // Bersihkan cache
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setIsDownloading(false);
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Header & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Audit <span className="text-[#FA4D09]">Trail & Log</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pantau seluruh aktivitas sistem, perubahan data, dan riwayat login.</p>
        </div>
        
        {/* TOMBOL UNDUH CSV */}
        <button 
          onClick={handleDownloadCSV}
          disabled={isDownloading || filteredLogs.length === 0}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
              Menyiapkan...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Unduh Laporan CSV
            </>
          )}
        </button>
      </div>

      {/* Mini Stats & Toolbar Pencarian */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        {/* Ringkasan */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md whitespace-nowrap shrink-0">
            <span className="p-1.5 bg-[#011D58]/10 text-[#011D58] dark:bg-[#FF9F03]/10 dark:text-[#FF9F03] rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Aktivitas</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{totalLogs} Log</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md whitespace-nowrap shrink-0">
            <span className="p-1.5 bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Log Keamanan</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{authLogs} Event</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md whitespace-nowrap shrink-0">
            <span className="p-1.5 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Otomasi Sistem</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{systemLogs} Aksi</p>
            </div>
          </div>
        </div>

        {/* Toolbar Pencarian & Filter */}
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="relative w-full sm:w-56">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Cari user, aksi, detail..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] outline-none transition-colors"
            />
          </div>
          <select 
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-xl outline-none focus:ring-[#FC7A0B] focus:border-[#FC7A0B] cursor-pointer"
          >
            <option value="All">Semua Modul</option>
            <option value="Website">Website</option>
            <option value="Infrastruktur">Infrastruktur</option>
            <option value="Keuangan">Keuangan</option>
            <option value="Helpdesk">Helpdesk</option>
            <option value="Otentikasi">Otentikasi</option>
          </select>
        </div>
      </div>

      {/* Tabel Audit Log */}
      <div className="rounded-3xl bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-4 px-6 font-semibold w-48">Waktu & ID</th>
                <th className="py-4 px-6 font-semibold">Pengguna</th>
                <th className="py-4 px-6 font-semibold">Aksi & Modul</th>
                <th className="py-4 px-6 font-semibold">Detail Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 relative">
              <AnimatePresence>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900 dark:text-slate-200">{log.timestamp.split(',')[0]}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] text-slate-500">{log.timestamp.split(',')[1]}</p>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{log.id}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${log.user === 'System' ? 'bg-purple-500' : 'bg-emerald-500'}`}></span>
                          <p className="font-medium text-slate-700 dark:text-slate-300">{log.user}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900 dark:text-white">{log.action}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#011D58]/5 text-[#011D58] dark:bg-slate-800 dark:text-slate-400 border border-[#011D58]/10 dark:border-slate-700">
                          {log.module}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-sm truncate" title={log.detail}>
                          {log.detail}
                        </p>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500 dark:text-slate-400">
                      Data audit tidak ditemukan. Coba sesuaikan kata kunci pencarian.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}