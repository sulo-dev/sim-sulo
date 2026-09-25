"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type AuditLog = {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  module: string;
  detail: string;
  ipAddress: string;
  status: string;
};

type Props = {
  initialData: AuditLog[];
};

// Varian Animasi untuk Baris Tabel
const tableContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const tableRowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }
};

export default function AuditClient({ initialData }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");

  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ 
    show: false, message: "", type: "success" 
  });
  
  const triggerNotification = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000); // Diseragamkan 5 detik
  };

  // Opsi unik untuk filter modul
  const uniqueModules = Array.from(new Set(initialData.map(log => log.module))).filter(Boolean);

  const filteredData = initialData.filter((item) => {
    const matchesSearch = 
      item.admin.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.detail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = moduleFilter === "All" || item.module === moduleFilter;
    
    return matchesSearch && matchesModule;
  });

  // Kalkulasi Statistik Mini
  const totalLogs = initialData.length;
  const failedLogs = initialData.filter(log => log.status.toLowerCase() === "failed" || log.status.toLowerCase() === "gagal").length;
  const authLogs = initialData.filter(log => log.action.toUpperCase().includes("LOGIN") || log.action.toUpperCase().includes("AUTH")).length;

  // ==========================================
  // FUNGSI UNDUH CSV (Standar Excel Indonesia)
  // ==========================================
  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      triggerNotification("Tidak ada data untuk diekspor!", "error");
      return;
    }

    const headers = ["ID", "Waktu (WITA)", "Admin", "IP Address", "Modul", "Aksi", "Detail Log", "Status"];
    
    // Bungkus semua data dengan tanda kutip ganda agar spasi/koma di dalam kalimat tidak merusak sel
    const csvData = filteredData.map(row => [
      `"${row.id}"`,
      `"${row.timestamp}"`,
      `"${row.admin}"`,
      `"${row.ipAddress}"`,
      `"${row.module}"`,
      `"${row.action}"`,
      `"${row.detail.replace(/"/g, '""').replace(/\n/g, ' ')}"`, // Hapus enter agar tetap di 1 baris
      `"${row.status}"`
    ]);

    // Gabungkan array menggunakan TITIK KOMA (;) agar langsung rapi di kolom Excel
    const csvContent = [
      headers.map(h => `"${h}"`).join(";"), 
      ...csvData.map(e => e.join(";"))
    ].join("\n");

    // Tambahkan BOM (\uFEFF) di depan konten agar MS Excel membaca tabel dengan format UTF-8 sempurna
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SULO_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    triggerNotification("File CSV berhasil diunduh.", "success");
  };

  // ==========================================
  // FUNGSI EXPORT PDF
  // ==========================================
  const handleExportPDF = () => {
    if (filteredData.length === 0) {
      triggerNotification("Tidak ada data untuk diekspor!", "error");
      return;
    }

    const doc = new jsPDF('landscape'); 
    
    // Judul Dokumen
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Laporan Audit Logs SULO", 14, 20);
    
    // Sub-judul / Meta Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Waktu Cetak: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })} WITA`, 14, 27);
    doc.text(`Total Baris: ${filteredData.length} aktivitas`, 14, 32);

    // Format Kolom
    const tableColumn = ["Waktu", "Admin", "Modul", "Aksi", "Detail", "Status"];
    
    // Format Baris
    const tableRows = filteredData.map(log => [
      log.timestamp,
      `${log.admin}\n(IP: ${log.ipAddress})`, 
      log.module,
      log.action,
      log.detail,
      log.status
    ]);

    // Render Tabel menggunakan autoTable
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { 
        fontSize: 8, 
        cellPadding: 3,
        valign: 'middle'
      },
      headStyles: { 
        fillColor: [1, 29, 88], // Warna biru SULO (#011D58)
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Warna slate-50
      },
      columnStyles: {
        0: { cellWidth: 35 }, // Waktu
        1: { cellWidth: 40 }, // Admin
        2: { cellWidth: 25 }, // Modul
        3: { cellWidth: 25 }, // Aksi
        4: { cellWidth: 'auto' }, // Detail memanjang otomatis
        5: { cellWidth: 20 }, // Status
      }
    });

    // Eksekusi Unduh
    doc.save(`SULO_Audit_Logs_${new Date().toISOString().split('T')[0]}.pdf`);
    triggerNotification("Dokumen PDF berhasil dibuat & diunduh.", "success");
  };

  // Fungsi helper untuk badge warna aksi
  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("CREATE") || act.includes("ADD") || act.includes("INSERT")) {
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
    }
    if (act.includes("DELETE") || act.includes("REMOVE")) {
      return "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20";
    }
    if (act.includes("UPDATE") || act.includes("EDIT")) {
      return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
    }
    if (act.includes("LOGIN") || act.includes("AUTH") || act.includes("LOGOUT")) {
      return "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20";
    }
    return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative pb-10">
      
      {/* Toast Notification (Standardized top-right) */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`fixed top-8 right-8 z-[200] flex items-center gap-3 px-5 py-4 text-white font-semibold text-sm rounded-2xl shadow-2xl backdrop-blur-xl border ${
              toast.type === "success" 
                ? "bg-emerald-600 dark:bg-emerald-500 shadow-emerald-600/30 border-emerald-400/30" 
                : "bg-rose-600 dark:bg-rose-500 shadow-rose-600/30 border-rose-400/30"
            }`}
          >
            <div className="p-1 bg-white/20 rounded-lg shrink-0">
              {toast.type === "success" ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
            </div>
            <p className="pr-2">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Audit <span className="text-[#FA4D09]">Logs</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pantau seluruh riwayat aktivitas admin dan perubahan data dalam sistem secara real-time.
          </p>
        </div>
        
        {/* Indikator Keamanan */}
        <div className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl flex items-center gap-2.5 shadow-sm shrink-0">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">System Secure</span>
        </div>
      </div>

      {/* Mini Stats Ringkasan Keamanan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">Total Aktivitas</p>
            <p className="text-base font-black text-slate-900 dark:text-white truncate mt-0.5">{totalLogs} Log</p>
          </div>
        </div>
        
        <div className="p-4 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-xl shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">Sesi & Autentikasi</p>
            <p className="text-base font-black text-slate-900 dark:text-white truncate mt-0.5">{authLogs} Event</p>
          </div>
        </div>
        
        <div className="p-4 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm flex items-center gap-3 relative overflow-hidden">
          {failedLogs > 0 && <div className="absolute top-0 right-0 w-1.5 h-full bg-rose-500 animate-pulse"></div>}
          <div className={`p-3 rounded-xl shrink-0 ${failedLogs > 0 ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">Aktivitas Gagal</p>
            <p className={`text-base font-black truncate mt-0.5 ${failedLogs > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>{failedLogs} Peringatan</p>
          </div>
        </div>
      </div>

      {/* Toolbar & Ekspor Premium */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        
        {/* Search & Filter Kiri (Menyatu) */}
        <div className="flex flex-col sm:flex-row gap-0 bg-white/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm w-full xl:w-auto overflow-hidden focus-within:ring-2 focus-within:ring-[#FC7A0B]/50 transition-shadow shrink-0">
          <div className="relative w-full sm:w-72 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Cari admin atau detail aksi..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-transparent text-slate-900 dark:text-slate-200 text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          
          <select 
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="w-full sm:w-48 px-4 py-3 bg-transparent text-slate-700 dark:text-slate-300 text-sm outline-none cursor-pointer font-medium appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
          >
            <option value="All">Semua Modul</option>
            {uniqueModules.map((mod, idx) => (
              <option key={idx} value={mod}>{mod}</option>
            ))}
          </select>
        </div>

        {/* Tombol Ekspor Kanan */}
        <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0">
          <button 
            onClick={handleExportCSV}
            className="px-5 py-2.5 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-500/30 text-sm font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shadow-sm hover:shadow-emerald-500/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Unduh CSV
          </button>
          <button 
            onClick={handleExportPDF}
            className="px-5 py-2.5 bg-[#011D58] hover:bg-[#022b82] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#011D58]/20 flex items-center gap-2 active:scale-95 whitespace-nowrap shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Cetak Laporan PDF
          </button>
        </div>
      </div>

      {/* Tabel Log Premium */}
      <div className="rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-5 px-6 rounded-tl-3xl">Waktu & Transaksi ID</th>
                <th className="py-5 px-6">Identitas Admin</th>
                <th className="py-5 px-6">Modul & Area</th>
                <th className="py-5 px-6">Tindakan (Action)</th>
                <th className="py-5 px-6">Detail Log Aktivitas</th>
                <th className="py-5 px-6 rounded-tr-3xl">Status Eksekusi</th>
              </tr>
            </thead>
            <motion.tbody 
              variants={tableContainerVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-slate-100 dark:divide-slate-800/60"
            >
              <AnimatePresence mode="popLayout">
                {filteredData.length > 0 ? (
                  filteredData.map((log) => (
                    <motion.tr 
                      key={log.id}
                      variants={tableRowVariants}
                      layout
                      className="hover:bg-white dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900 dark:text-white group-hover:text-[#FA4D09] dark:group-hover:text-[#FF9F03] transition-colors">
                          {log.timestamp.split(' ')[0]}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-1 uppercase tracking-wide">
                          <span>{log.timestamp.split(' ')[1] || ""}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                          <span className="font-mono text-[10px]">{log.id.substring(0, 12)}...</span>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-black text-xs shrink-0 border border-slate-300 dark:border-slate-600 shadow-sm">
                            {log.admin.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{log.admin}</p>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                              {log.ipAddress}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-700 shadow-sm">
                          {log.module}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 w-max shadow-sm ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-normal min-w-[250px] max-w-[400px]">
                          {log.detail}
                        </p>
                      </td>

                      <td className="py-4 px-6">
                        {log.status.toLowerCase() === 'success' || log.status.toLowerCase() === 'berhasil' ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Success</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse"></div>
                            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">Failed</span>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <p className="text-slate-900 dark:text-white font-bold mb-1">Aktivitas Tidak Ditemukan</p>
                      <p className="text-sm text-slate-500">Tidak ada log aktivitas yang cocok dengan pencarian Anda.</p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setModuleFilter("All");
                        }}
                        className="mt-6 px-6 py-2.5 bg-[#011D58] hover:bg-[#022b82] text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-[#011D58]/20"
                      >
                        Reset Filter Pencarian
                      </button>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>
      </div>
    </div>
  );
}