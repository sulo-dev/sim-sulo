"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { mockClients } from "@/lib/mockData";
import AddClientModal from "@/components/AddClientModal";

export default function ClientsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // State untuk Modul Notifikasi Toast Sukses
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  const triggerNotification = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 3500); // Otomatis hilang dalam 3.5 detik
  };

  // Kalkulasi Ringkasan (Mini Stats)
  const totalClients = mockClients.length;
  const activeClients = mockClients.filter(c => c.status === "Active").length;
  const totalWebsites = mockClients.reduce((acc, curr) => acc + curr.websites.length, 0);

  // Logika Pencarian dan Filter
  const filteredClients = mockClients.filter((client) => {
    const matchesSearch = client.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          client.picName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Header & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Direktori <span className="text-[#FA4D09]">Klien</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola data klien, kontak PIC, dan aset digital mereka.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="px-5 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 dark:bg-[#011D58] dark:hover:bg-[#011D58]/80 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-[#011D58]/20 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Tambah Klien Baru
        </button>
      </div>

      {/* Mini Stats & Toolbar Pencarian */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        {/* Ringkasan */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md whitespace-nowrap shrink-0">
            <span className="p-1.5 bg-[#011D58]/10 text-[#011D58] dark:bg-[#FF9F03]/10 dark:text-[#FF9F03] rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Klien</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{totalClients} Terdaftar</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md whitespace-nowrap shrink-0">
            <span className="p-1.5 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Klien Aktif</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{activeClients} Kontrak</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md whitespace-nowrap shrink-0">
            <span className="p-1.5 bg-[#FC7A0B]/10 text-[#FC7A0B] rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Proyek</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{totalWebsites} Website</p>
            </div>
          </div>
        </div>

        {/* Toolbar Pencarian & Filter */}
        <div className="flex gap-2 w-full lg:w-auto">
          <div className="relative w-full lg:w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Cari nama klien atau PIC..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] outline-none transition-colors"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-xl outline-none focus:ring-[#FC7A0B] focus:border-[#FC7A0B] cursor-pointer"
          >
            <option value="All">Semua Status</option>
            <option value="Active">Active</option>
            <option value="Internal">Internal</option>
          </select>
        </div>
      </div>

      {/* Grid Klien */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredClients.map((client, index) => (
              <motion.div
                key={client.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Link href={`/clients/${client.id}`}>
                  <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl shadow-xl hover:shadow-[#FC7A0B]/10 hover:border-[#FC7A0B] dark:hover:border-[#FC7A0B]/50 transition-all duration-300 group cursor-pointer h-full flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#FA4D09] transition-colors">{client.companyName}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">PIC: <span className="font-medium text-slate-700 dark:text-slate-300">{client.picName}</span></p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                          client.status === 'Active' 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                          : 'bg-[#011D58]/10 dark:bg-[#FF9F03]/10 text-[#011D58] dark:text-[#FF9F03] border-[#011D58]/20 dark:border-[#FF9F03]/20'
                        }`}>
                          {client.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-4">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <span className="truncate">{client.email || 'Email tidak tersedia'}</span>
                      </div>
                    </div>

                    <div className="pt-4 mt-5 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">Proyek Website ({client.websites.length}):</p>
                      <div className="flex flex-wrap gap-2">
                        {client.websites.map((web, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 group-hover:border-[#FC7A0B]/30 transition-colors">
                            {web}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty State Jika Pencarian Tidak Ditemukan */
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center p-12 text-center bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed"
        >
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Klien Tidak Ditemukan</h3>
          <p className="text-sm text-slate-500 mt-1">Tidak ada klien yang cocok dengan kata kunci "{searchQuery}" atau filter status yang dipilih.</p>
          <button 
            onClick={() => { setSearchQuery(""); setStatusFilter("All"); }}
            className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl transition-colors"
          >
            Reset Pencarian
          </button>
        </motion.div>
      )}

      {/* Modal Tambah Klien */}
      <AnimatePresence>
        {isModalOpen && (
          <AddClientModal 
            isOpen={isModalOpen} 
            onClose={() => {
              setIsModalOpen(false);
              triggerNotification("Data klien baru berhasil ditambahkan ke direktori!");
            }} 
          />
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