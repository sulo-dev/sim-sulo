"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { allInfrastructures } from "@/lib/mockData";
import AddInfrastructureModal from "@/components/AddInfrastructureModal";
import InfrastructureModal from "@/components/InfrastructureModal";
import EditInfrastructureModal from "@/components/EditInfrastructureModal";

export default function InfrastructurePage() {
  // State Utama Data Infrastruktur (dijadikan state lokal agar interaktif)
  const [infrastructures, setInfrastructures] = useState(allInfrastructures);

  // State Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedInfra, setSelectedInfra] = useState<any | null>(null); // Untuk Modal Rincian
  const [editInfra, setEditInfra] = useState<any | null>(null); // Untuk Modal Edit
  const [deleteInfra, setDeleteInfra] = useState<any | null>(null); // Untuk Modal Konfirmasi Hapus

  // State Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [isProcessing, setIsProcessing] = useState(false);

  // State Modul Notifikasi Toast Sukses
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  const triggerNotification = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 3500);
  };

  // Handler Hapus Aset
  const handleDeleteConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setInfrastructures(infrastructures.filter(item => item.id !== deleteInfra.id));
      setIsProcessing(false);
      setDeleteInfra(null);
      triggerNotification("Aset infrastruktur berhasil dihapus.");
    }, 1000);
  };

  // Handler Simpan Hasil Edit
  const handleSaveEdit = (updatedData: any) => {
    setInfrastructures(infrastructures.map(item => item.id === updatedData.id ? updatedData : item));
    triggerNotification("Perubahan aset infrastruktur berhasil disimpan.");
  };

  // Kalkulasi Ringkasan (Mini Stats)
  const totalAssets = infrastructures.length;
  const safeAssets = infrastructures.filter(a => a.status === "Safe").length;
  const warningAssets = infrastructures.filter(a => a.status === "Warning").length;

  // Logika Pencarian dan Filter
  const filteredAssets = infrastructures.filter((infra) => {
    const matchesSearch = infra.asset.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          infra.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          infra.website.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || infra.status === statusFilter;
    const matchesType = typeFilter === "All" || infra.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Header & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Manajemen <span className="text-[#FA4D09]">Infrastruktur</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pantau jadwal perpanjangan (renewal) domain, hosting, dan server semua klien.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-[#011D58]/20 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Registrasi Aset Baru
        </button>
      </div>

      {/* Mini Stats & Toolbar Pencarian */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        {/* Ringkasan */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md whitespace-nowrap shrink-0">
            <span className="p-1.5 bg-[#011D58]/10 text-[#011D58] dark:bg-[#FF9F03]/10 dark:text-[#FF9F03] rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Aset</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{totalAssets} Item</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md whitespace-nowrap shrink-0">
            <span className="p-1.5 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status Aman</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{safeAssets} Item</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-[#FA4D09]/5 dark:bg-[#FA4D09]/10 border border-[#FA4D09]/20 rounded-xl backdrop-blur-md whitespace-nowrap shrink-0 shadow-[0_0_15px_rgba(250,77,9,0.1)]">
            <span className="p-1.5 bg-[#FA4D09]/20 text-[#FA4D09] rounded-lg animate-pulse"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#FA4D09]">Segera Expired</p>
              <p className="text-sm font-black text-[#FA4D09]">{warningAssets} Item</p>
            </div>
          </div>
        </div>

        {/* Toolbar Pencarian & Filter */}
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="relative w-full sm:w-56">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Cari aset, provider..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] outline-none transition-colors"
            />
          </div>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-xl outline-none focus:ring-[#FC7A0B] focus:border-[#FC7A0B] cursor-pointer"
          >
            <option value="All">Semua Tipe</option>
            <option value="Domain">Domain</option>
            <option value="Hosting">Hosting</option>
            <option value="Server">Server</option>
            <option value="SSL">SSL</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-xl outline-none focus:ring-[#FC7A0B] focus:border-[#FC7A0B] cursor-pointer"
          >
            <option value="All">Semua Status</option>
            <option value="Safe">Aman</option>
            <option value="Warning">Warning (Expired)</option>
          </select>
        </div>
      </div>

      {/* Grid Kartu Infrastruktur */}
      {filteredAssets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredAssets.map((infra, index) => (
              <motion.div
                key={infra.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                onClick={() => setSelectedInfra(infra)}
                className="p-6 rounded-3xl bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-lg hover:shadow-[#FC7A0B]/10 hover:border-[#FC7A0B] dark:hover:border-[#FC7A0B]/50 transition-all duration-300 flex flex-col justify-between group cursor-pointer relative"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#011D58] dark:text-[#FF9F03] bg-[#011D58]/10 dark:bg-[#FF9F03]/10 px-2.5 py-1 rounded-md">
                      {infra.type}
                    </span>
                    <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${
                      infra.status === 'Safe' 
                        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20' 
                        : 'text-[#FA4D09] bg-[#FA4D09]/10 border border-[#FA4D09]/20 shadow-[0_0_10px_rgba(250,77,9,0.2)]'
                    }`}>
                      {infra.status === 'Warning' ? 'Segera Expired' : 'Aman'}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#FA4D09] transition-colors">{infra.asset}</h4>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{infra.provider}</p>
                </div>
                
                <div>
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Proyek Terkait</span>
                      <span className="text-slate-700 dark:text-slate-200 font-bold truncate max-w-[150px]">{infra.website}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kedaluwarsa</span>
                      <span className={`font-black ${infra.status === 'Warning' ? 'text-[#FA4D09]' : 'text-slate-700 dark:text-slate-300'}`}>
                        {infra.expiry}
                      </span>
                    </div>
                  </div>

                  {/* Tombol Aksi di Kartu (Edit & Hapus) */}
                  <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/40">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditInfra(infra); }}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-white hover:bg-[#011D58] dark:hover:bg-[#FF9F03] dark:hover:text-slate-950 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Edit
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeleteInfra(infra); }}
                      className="px-3 py-1.5 text-xs font-bold text-red-600 hover:text-white hover:bg-red-600 bg-red-50 dark:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Hapus
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty State */
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center p-12 text-center bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed"
        >
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Aset Tidak Ditemukan</h3>
          <p className="text-sm text-slate-500 mt-1">Tidak ada infrastruktur yang cocok dengan filter atau pencarian Anda.</p>
          <button 
            onClick={() => { setSearchQuery(""); setStatusFilter("All"); setTypeFilter("All"); }}
            className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl transition-colors"
          >
            Reset Filter
          </button>
        </motion.div>
      )}

      {/* ============================================================== */}
      {/* MODAL SECTION */}
      {/* ============================================================== */}

      {/* 1. Modal Detail Infrastruktur */}
      <AnimatePresence>
        {selectedInfra && (
          <InfrastructureModal
            isOpen={!!selectedInfra}
            onClose={() => setSelectedInfra(null)}
            data={selectedInfra}
          />
        )}
      </AnimatePresence>

      {/* 2. Modal Registrasi Aset Baru */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddInfrastructureModal 
            isOpen={isAddModalOpen} 
            onClose={() => {
              setIsAddModalOpen(false);
              triggerNotification("Aset infrastruktur baru berhasil didaftarkan.");
            }} 
          />
        )}
      </AnimatePresence>

      {/* 3. Modal Edit Infrastruktur */}
      <AnimatePresence>
        {editInfra && (
          <EditInfrastructureModal
            isOpen={!!editInfra}
            onClose={() => setEditInfra(null)}
            infrastructure={editInfra}
            onSave={handleSaveEdit}
          />
        )}
      </AnimatePresence>

      {/* 4. Modal Konfirmasi Hapus */}
      <AnimatePresence>
        {deleteInfra && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteInfra(null)} className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl max-w-md w-full z-10 text-center border border-slate-200 dark:border-slate-800">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-500/30">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Hapus Aset Ini?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                Anda yakin ingin menghapus aset <span className="font-bold text-slate-800 dark:text-slate-200">{deleteInfra.asset}</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDeleteInfra(null)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm transition-colors">
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

      {/* FLOATING TOAST NOTIFICATION */}
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