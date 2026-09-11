"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockFinances } from "@/lib/mockData";
import AddFinanceModal from "@/components/AddFinanceModal";
import EditFinanceModal from "@/components/EditFinanceModal";

export default function FinancePage() {
  // State Utama Data Keuangan
  const [finances, setFinances] = useState(mockFinances);

  // State Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null); // Untuk Modal Rincian
  const [editInvoice, setEditInvoice] = useState<any | null>(null); // Untuk Modal Edit
  const [deleteInvoice, setDeleteInvoice] = useState<any | null>(null); // Untuk Modal Hapus

  // State Loading & Filter
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [cycleFilter, setCycleFilter] = useState("All");

  // State Modul Notifikasi Toast
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  // FUNGSI: Pemicu Notifikasi Toast
  const triggerNotification = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 3500); // Hilang otomatis dalam 3.5 detik
  };

  // FUNGSI: Hapus Tagihan
  const handleDeleteConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setFinances(finances.filter(f => f.id !== deleteInvoice.id));
      setIsProcessing(false);
      setDeleteInvoice(null);
      triggerNotification("Data tagihan berhasil dihapus dari sistem.");
    }, 1000);
  };

  // FUNGSI: Simpan Edit Tagihan dari Modal Terpisah
  const handleSaveEditInvoice = (updatedInvoice: any) => {
    setFinances(finances.map(f => f.id === updatedInvoice.id ? updatedInvoice : f));
    setEditInvoice(null);
    triggerNotification("Perubahan data tagihan berhasil disimpan.");
  };

  // Kalkulasi Global (Mini Stats) menggunakan state 'finances' yang dinamis
  const totalRevenue = finances.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalCost = finances.reduce((acc, curr) => acc + curr.infrastructureCost, 0);
  const totalMargin = totalRevenue - totalCost;

  // Format Rupiah
  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  };

  // Logika Pencarian dan Filter
  const filteredFinances = finances.filter((fin) => {
    const matchesSearch = fin.project.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          fin.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || fin.status === statusFilter;
    const matchesCycle = cycleFilter === "All" || fin.billingCycle === cycleFilter;

    return matchesSearch && matchesStatus && matchesCycle;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Header & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Keuangan & <span className="text-[#FA4D09]">Tagihan</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pantau siklus penagihan klien dan rincian margin laba pemeliharaan proyek.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-[#011D58]/20 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Buat Invoice Baru
        </button>
      </div>

      {/* Kartu Ringkasan dengan Palet SULO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-100 dark:shadow-none backdrop-blur-xl group hover:border-[#011D58]/30 transition-colors">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-[#011D58] transition-colors">Total Pendapatan</p>
            <span className="p-2 bg-[#011D58]/10 text-[#011D58] dark:bg-[#FF9F03]/10 dark:text-[#FF9F03] rounded-xl"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">{formatIDR(totalRevenue)}</h3>
        </div>

        <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-100 dark:shadow-none backdrop-blur-xl group hover:border-[#FA4D09]/30 transition-colors">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-[#FA4D09] transition-colors">Beban (HPP)</p>
            <span className="p-2 bg-[#FA4D09]/10 text-[#FA4D09] rounded-xl"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg></span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">{formatIDR(totalCost)}</h3>
        </div>

        <div className="p-6 rounded-3xl bg-[#011D58]/5 dark:bg-[#011D58]/20 border border-[#011D58]/20 shadow-lg shadow-[#011D58]/10 backdrop-blur-xl group">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#011D58] dark:text-[#FF9F03]">Margin Bersih</p>
            <span className="p-2 bg-[#011D58]/10 text-[#011D58] dark:bg-[#FF9F03]/20 dark:text-[#FF9F03] rounded-xl"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
          </div>
          <h3 className={`text-3xl font-black ${totalMargin >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#FA4D09]'}`}>
            {formatIDR(totalMargin)}
          </h3>
        </div>
      </div>

      {/* Toolbar Pencarian & Filter */}
      <div className="flex flex-col sm:flex-row gap-2 w-full justify-end">
        <div className="relative w-full sm:w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            placeholder="Cari invoice, proyek, klien..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] outline-none transition-colors"
          />
        </div>
        <select 
          value={cycleFilter}
          onChange={(e) => setCycleFilter(e.target.value)}
          className="px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-xl outline-none focus:ring-[#FC7A0B] focus:border-[#FC7A0B] cursor-pointer"
        >
          <option value="All">Semua Siklus</option>
          <option value="Bulanan">Bulanan</option>
          <option value="Tahunan">Tahunan</option>
        </select>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-xl outline-none focus:ring-[#FC7A0B] focus:border-[#FC7A0B] cursor-pointer"
        >
          <option value="All">Semua Status</option>
          <option value="Paid">Lunas (Paid)</option>
          <option value="Unpaid">Belum Lunas (Unpaid)</option>
          <option value="Internal">Internal</option>
        </select>
      </div>

      {/* Tabel Detail Tagihan */}
      <div className="rounded-3xl bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-4 px-6 font-semibold">Proyek & Klien</th>
                <th className="py-4 px-6 font-semibold">Nilai Tagihan</th>
                <th className="py-4 px-6 font-semibold w-48">Rasio Margin Laba</th>
                <th className="py-4 px-6 font-semibold">Tgl Penagihan</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 relative">
              <AnimatePresence>
                {filteredFinances.length > 0 ? (
                  filteredFinances.map((fin) => {
                    const margin = fin.revenue - fin.infrastructureCost;
                    const marginPercent = fin.revenue > 0 ? Math.round((margin / fin.revenue) * 100) : 0;

                    return (
                      <motion.tr 
                        key={fin.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                      >
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-900 dark:text-white group-hover:text-[#FA4D09] transition-colors">{fin.project}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{fin.client} • <span className="text-[#FC7A0B] font-medium">{fin.billingCycle}</span></p>
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                          {formatIDR(fin.revenue)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-between items-end mb-1.5">
                            <span className={`text-xs font-bold ${margin >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#FA4D09]'}`}>
                              {formatIDR(margin)}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">{fin.revenue > 0 ? `${marginPercent}%` : 'N/A'}</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden flex">
                            {fin.revenue > 0 ? (
                              <>
                                <div className="bg-[#FA4D09] h-1.5" style={{ width: `${Math.min(100, ((fin.infrastructureCost / fin.revenue) * 100))}%` }} title={`Beban: ${formatIDR(fin.infrastructureCost)}`}></div>
                                <div className="bg-emerald-500 h-1.5" style={{ width: `${Math.max(0, marginPercent)}%` }} title={`Margin: ${formatIDR(margin)}`}></div>
                              </>
                            ) : (
                              <div className="bg-[#FA4D09] h-1.5 w-full" title={`Beban Internal: ${formatIDR(fin.infrastructureCost)}`}></div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400 font-medium">{fin.nextBilling}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            fin.status === 'Paid' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                            fin.status === 'Unpaid' ? 'bg-[#FA4D09]/10 text-[#FA4D09] border-[#FA4D09]/20' :
                            'bg-[#011D58]/10 text-[#011D58] dark:bg-[#FF9F03]/10 dark:text-[#FF9F03] border-[#011D58]/20 dark:border-[#FF9F03]/20'
                          }`}>
                            {fin.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Tombol Edit */}
                            <button 
                              onClick={() => setEditInvoice(fin)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors" 
                              title="Edit Tagihan"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            {/* Tombol Hapus */}
                            <button 
                              onClick={() => setDeleteInvoice(fin)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" 
                              title="Hapus Tagihan"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                            {/* Tombol Rincian */}
                            <button 
                              onClick={() => setSelectedInvoice(fin)}
                              className="px-3 py-1.5 text-[11px] font-bold text-[#011D58] dark:text-[#FF9F03] bg-[#011D58]/5 dark:bg-[#FF9F03]/10 hover:bg-[#011D58]/10 dark:hover:bg-[#FF9F03]/20 rounded-lg transition-colors border border-[#011D58]/10 dark:border-[#FF9F03]/20 flex items-center gap-1 ml-1"
                            >
                              Rincian <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                      Tidak ada tagihan yang cocok dengan filter atau pencarian Anda.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL SECTION */}
      {/* ============================================================== */}

      {/* 1. MODAL TAMBAH INVOICE BARU */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddFinanceModal 
            isOpen={isAddModalOpen} 
            onClose={() => {
              setIsAddModalOpen(false);
              triggerNotification("Invoice penagihan baru berhasil dibuat.");
            }} 
          />
        )}
      </AnimatePresence>

      {/* 2. MODAL RINCIAN KEUANGAN */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedInvoice(null)} className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden z-10">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Rincian Beban Proyek</h3>
                <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-[#FA4D09] bg-slate-200/50 dark:bg-slate-800 p-1.5 rounded-xl transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{selectedInvoice.client}</p>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white">{selectedInvoice.project}</h4>
                  <span className="inline-block mt-2 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500">
                    Siklus: {selectedInvoice.billingCycle}
                  </span>
                </div>

                <div className="space-y-4 mb-6">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#FA4D09] border-b border-slate-100 dark:border-slate-800 pb-2">Komponen Biaya (HPP)</h5>
                  {selectedInvoice.costBreakdown?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">{item.item}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{formatIDR(item.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-100 dark:border-slate-800 font-bold">
                    <span className="text-slate-900 dark:text-white">Total Beban Internal</span>
                    <span className="text-[#FA4D09]">{formatIDR(selectedInvoice.infrastructureCost)}</span>
                  </div>
                </div>

                <div className="bg-[#011D58]/5 dark:bg-[#011D58]/20 border border-[#011D58]/20 p-5 rounded-2xl flex justify-between items-center shadow-inner">
                  <span className="text-sm font-bold text-[#011D58] dark:text-[#FF9F03]">Nilai Penagihan Klien</span>
                  <span className="text-xl font-black text-[#011D58] dark:text-[#FF9F03]">{formatIDR(selectedInvoice.revenue)}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. MODAL EDIT INVOICE (DIPERBARUI DENGAN KOMPONEN TERPISAH) */}
      <AnimatePresence>
        {editInvoice && (
          <EditFinanceModal 
            isOpen={!!editInvoice}
            onClose={() => setEditInvoice(null)}
            invoice={editInvoice}
            onSave={handleSaveEditInvoice}
          />
        )}
      </AnimatePresence>

      {/* 4. MODAL HAPUS KONFIRMASI */}
      <AnimatePresence>
        {deleteInvoice && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteInvoice(null)} className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl max-w-md w-full z-10 text-center border border-slate-200 dark:border-slate-800/80">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-500/30">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Hapus Tagihan?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                Anda yakin ingin menghapus tagihan untuk <span className="font-bold text-slate-800 dark:text-slate-200">{deleteInvoice.project}</span>? Data ini tidak dapat dikembalikan.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDeleteInvoice(null)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm transition-colors">
                  Batal
                </button>
                <button onClick={handleDeleteConfirm} disabled={isProcessing} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-colors disabled:opacity-70">
                  {isProcessing ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Menghapus...</> : "Ya, Hapus"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING TOAST NOTIFICATION (MODUL NOTIFIKASI SUKSES) */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
            className="fixed bottom-8 right-8 z-[200] flex items-center gap-3 px-5 py-4 bg-emerald-600 dark:bg-emerald-500 text-white font-semibold text-sm rounded-2xl shadow-2xl shadow-emerald-600/30 border border-emerald-400/30 backdrop-blur-xl"
          >
            <div className="p-1 bg-white/20 rounded-lg shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="pr-2">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}