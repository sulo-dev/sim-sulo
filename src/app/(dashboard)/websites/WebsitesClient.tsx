"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import AddWebsiteModal from "@/components/AddWebsiteModal";

type WebsiteData = {
  id: string;
  name: string;
  clientName: string;
  status: string;
};

type ClientDropdown = {
  id: number;
  companyName: string;
};

type Props = {
  initialWebsites: WebsiteData[];
  clients: ClientDropdown[];
};

// Varian Animasi untuk Grid Stagger
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function WebsitesClient({ initialWebsites, clients }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // State untuk Modal & Notifikasi
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });

  const triggerNotification = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 5000); // Diperlama menjadi 5 detik
  };

  // Penangkap Notifikasi (Berguna jika nanti ada fitur Hapus Website)
  useEffect(() => {
    const pendingMessage = sessionStorage.getItem("sulo-toast-success");
    if (pendingMessage) {
      triggerNotification(pendingMessage);
      sessionStorage.removeItem("sulo-toast-success"); 
    }
  }, []);

  // Kalkulasi Mini Stats
  const totalWebsites = initialWebsites.length;
  const activeWebsites = initialWebsites.filter(w => w.status === "Active").length;
  const maintenanceWebsites = totalWebsites - activeWebsites;

  // Logika Filter & Pencarian
  const filteredWebsites = initialWebsites.filter((web) => {
    const matchesSearch = web.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          web.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || web.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative pb-10">
      
      {/* Header & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Manajemen <span className="text-[#FA4D09]">Proyek Website</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola seluruh portal, aplikasi web, dan landing page klien.</p>
        </div>
        
        {/* Tombol Tambah Website */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-[#011D58] hover:bg-[#022b82] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#011D58]/20 flex items-center justify-center gap-2 active:scale-95 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Website Baru
        </button>
      </div>

      {/* Mini Stats & Toolbar Pencarian Terpadu */}
      <div className="flex flex-col xl:flex-row gap-5 justify-between items-start xl:items-center">
        
        {/* Ringkasan (Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 w-full xl:w-auto">
          <div className="flex items-center gap-3 p-4 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm">
            <span className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-xl shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Proyek</p>
              <p className="text-base font-black text-slate-900 dark:text-white leading-none mt-1">{totalWebsites} Website</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm">
            <span className="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-xl shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status Aktif</p>
              <p className="text-base font-black text-slate-900 dark:text-white leading-none mt-1">{activeWebsites} Proyek</p>
            </div>
          </div>
          <div className="col-span-2 md:col-span-1 flex items-center gap-3 p-4 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm">
            <span className="p-3 bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 rounded-xl shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Maintenance</p>
              <p className="text-base font-black text-slate-900 dark:text-white leading-none mt-1">{maintenanceWebsites} Proyek</p>
            </div>
          </div>
        </div>

        {/* Toolbar Pencarian & Filter Terpadu */}
        <div className="flex flex-col sm:flex-row gap-0 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm w-full xl:w-auto overflow-hidden focus-within:ring-2 focus-within:ring-[#FC7A0B]/50 transition-shadow">
          <div className="relative w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Cari website atau klien..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-transparent text-slate-900 dark:text-slate-200 text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 px-4 py-3 bg-transparent text-slate-700 dark:text-slate-300 text-sm outline-none cursor-pointer font-medium appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
          >
            <option value="All">Semua Status</option>
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance / Warranty</option>
          </select>
        </div>
      </div>

      {/* Grid Website */}
      {filteredWebsites.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredWebsites.map((web) => (
              <motion.div key={web.id} variants={cardVariants} layout>
                <Link href={`/websites/${web.id}`} className="block h-full">
                  <div className="p-6 rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-xl hover:bg-white dark:hover:bg-slate-900 shadow-sm hover:shadow-xl hover:shadow-[#FC7A0B]/5 hover:border-[#FC7A0B]/40 transition-all duration-300 group cursor-pointer h-full flex flex-col justify-between relative overflow-hidden">
                    
                    {/* Aksen Background Halus saat Hover */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FC7A0B]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                    <div>
                      {/* Header Kartu: Avatar & Status */}
                      <div className="flex justify-between items-start mb-5 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#011D58] to-[#022b82] dark:from-slate-800 dark:to-slate-900 shadow-inner flex items-center justify-center text-white text-2xl font-black uppercase ring-4 ring-white dark:ring-slate-950">
                          {web.name.charAt(0)}
                        </div>
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                          web.status === 'Active' 
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                            : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                        }`}>
                          {web.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                          {web.status}
                        </span>
                      </div>

                      {/* Detail Nama Proyek & Klien */}
                      <div className="mb-6 relative z-10">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-[#FA4D09] transition-colors line-clamp-1 mb-2">
                          {web.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                          <span className="font-semibold line-clamp-1">{web.clientName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Kartu */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center text-sm font-bold text-[#011D58] dark:text-[#FF9F03] group-hover:text-[#FA4D09] dark:group-hover:text-[#FF9F03] transition-colors relative z-10">
                      Lihat Rincian Sistem
                      <svg className="w-5 h-5 transform group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </div>

                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Empty State */
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center p-16 text-center bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed"
        >
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-5 shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Website Tidak Ditemukan</h3>
          <p className="text-sm text-slate-500 max-w-md">Tidak ada data proyek website yang cocok dengan pencarian <span className="font-semibold">"{searchQuery}"</span>.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("All");
            }}
            className="mt-6 px-6 py-2.5 bg-[#011D58] hover:bg-[#022b82] text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-[#011D58]/20"
          >
            Reset Pencarian
          </button>
        </motion.div>
      )}

      {/* Modal Tambah Website */}
      <AnimatePresence>
        {isModalOpen && (
          <AddWebsiteModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
              triggerNotification("Proyek website baru berhasil ditambahkan.");
              router.refresh(); // Memperbarui tabel tanpa reload manual
            }} 
            clients={clients}
          />
        )}
      </AnimatePresence>

      {/* Toast Notification (Kanan Atas) */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed top-8 right-8 z-[200] flex items-center gap-3 px-5 py-4 bg-emerald-600 dark:bg-emerald-500 text-white font-semibold text-sm rounded-2xl shadow-2xl shadow-emerald-600/30 border border-emerald-400/30 backdrop-blur-xl"
          >
            <div className="p-1 bg-white/20 rounded-lg shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="pr-2">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}