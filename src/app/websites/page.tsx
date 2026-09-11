"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { allWebsites } from "@/lib/mockData";
import AddWebsiteModal from "@/components/AddWebsiteModal";

export default function AllWebsitesPage() {
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
  const totalWebsites = allWebsites.length;
  const activeWebsites = allWebsites.filter(w => w.status === "Active").length;
  const warrantyWebsites = allWebsites.filter(w => w.status === "Warranty").length;

  // Logika Pencarian dan Filter
  const filteredWebsites = allWebsites.filter((web) => {
    const matchesSearch = web.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          web.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || web.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Header & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Direktori <span className="text-[#FA4D09]">Website</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pantau seluruh proyek website dan status kontrak lintas klien.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-[#011D58]/20 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Tambah Website Baru
        </button>
      </div>

      {/* Mini Stats & Toolbar Pencarian */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        {/* Ringkasan */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md whitespace-nowrap shrink-0">
            <span className="p-1.5 bg-[#011D58]/10 text-[#011D58] dark:bg-[#FF9F03]/10 dark:text-[#FF9F03] rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Proyek</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{totalWebsites} Website</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md whitespace-nowrap shrink-0">
            <span className="p-1.5 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Kontrak Aktif</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{activeWebsites} Proyek</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md whitespace-nowrap shrink-0">
            <span className="p-1.5 bg-[#FF9F03]/10 text-[#FC7A0B] rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Masa Garansi</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{warrantyWebsites} Proyek</p>
            </div>
          </div>
        </div>

        {/* Toolbar Pencarian & Filter */}
        <div className="flex gap-2 w-full lg:w-auto">
          <div className="relative w-full lg:w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Cari website atau klien..." 
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
            <option value="Warranty">Warranty</option>
            <option value="Internal">Internal</option>
          </select>
        </div>
      </div>

      {/* Tabel Website Induk */}
      <div className="rounded-3xl bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-4 px-6 font-semibold">Nama Proyek</th>
                <th className="py-4 px-6 font-semibold">Pemilik / Klien</th>
                <th className="py-4 px-6 font-semibold">Tech Stack</th>
                <th className="py-4 px-6 font-semibold">Status Kontrak</th>
                <th className="py-4 px-6 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 relative">
              <AnimatePresence>
                {filteredWebsites.length > 0 ? (
                  filteredWebsites.map((web) => (
                    <motion.tr 
                      key={web.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                        <Link href={`/websites/${web.id}`} className="hover:text-[#FA4D09] transition-colors block">
                          {web.name}
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400 font-medium">{web.client}</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                          {web.stack}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${
                          web.status === 'Active' 
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                            : web.status === 'Warranty'
                            ? 'bg-[#FF9F03]/10 text-[#FC7A0B] border-[#FF9F03]/20'
                            : 'bg-[#011D58]/10 dark:bg-[#011D58]/40 text-[#011D58] dark:text-[#FF9F03] border-[#011D58]/20'
                        }`}>
                          {web.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link 
                          href={`/websites/${web.id}`}
                          className="text-xs font-bold text-[#FC7A0B] hover:text-[#FA4D09] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-end gap-1"
                        >
                          Buka Detail
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </Link>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                      Tidak ada website yang cocok dengan pencarian Anda.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH WEBSITE */}
      <AnimatePresence>
        {isModalOpen && (
          <AddWebsiteModal 
            isOpen={isModalOpen} 
            onClose={() => {
              setIsModalOpen(false);
              triggerNotification("Proyek website baru berhasil ditambahkan ke direktori!");
            }} 
          />
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