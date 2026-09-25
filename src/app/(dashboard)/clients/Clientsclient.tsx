"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AddClientModal from "@/components/AddClientModal";

export type ClientData = {
  id: number;
  companyName: string;
  picName: string;
  email: string;
  status: string;
  websites: string[];
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

export default function Clientsclient({ initialClients }: { initialClients: ClientData[] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  const triggerNotification = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 5000); // Diperlama menjadi 5 detik
  };

  useEffect(() => {
    const pendingMessage = sessionStorage.getItem("sulo-toast-success");
    if (pendingMessage) {
      triggerNotification(pendingMessage);
      sessionStorage.removeItem("sulo-toast-success"); 
    }
  }, []);

  const totalClients = initialClients.length;
  const activeClients = initialClients.filter((c) => c.status === "Active").length;
  const totalWebsites = initialClients.reduce((acc, curr) => acc + (curr.websites?.length || 0), 0);

  const filteredClients = initialClients.filter((client) => {
    const matchesSearch =
      client.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola data klien, kontak PIC, dan aset digital mereka.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-[#011D58] hover:bg-[#022b82] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#011D58]/20 flex items-center justify-center gap-2 active:scale-95 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Tambah Klien Baru
        </button>
      </div>

      {/* Mini Stats & Toolbar Pencarian Terpadu */}
      <div className="flex flex-col xl:flex-row gap-5 justify-between items-start xl:items-center">
        
        {/* Ringkasan (Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 w-full xl:w-auto">
          <div className="flex items-center gap-3 p-4 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm">
            <span className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-xl shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Klien</p>
              <p className="text-base font-black text-slate-900 dark:text-white leading-none mt-1">{totalClients} Terdaftar</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm">
            <span className="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-xl shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Klien Aktif</p>
              <p className="text-base font-black text-slate-900 dark:text-white leading-none mt-1">{activeClients} Kontrak</p>
            </div>
          </div>
          <div className="col-span-2 md:col-span-1 flex items-center gap-3 p-4 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm">
            <span className="p-3 bg-[#FC7A0B]/10 text-[#FC7A0B] rounded-xl shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Proyek</p>
              <p className="text-base font-black text-slate-900 dark:text-white leading-none mt-1">{totalWebsites} Website</p>
            </div>
          </div>
        </div>

        {/* Toolbar Pencarian & Filter Terpadu */}
        <div className="flex flex-col sm:flex-row gap-0 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm w-full xl:w-auto overflow-hidden focus-within:ring-2 focus-within:ring-[#FC7A0B]/50 transition-shadow">
          <div className="relative w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Cari nama klien atau PIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-transparent text-slate-900 dark:text-slate-200 text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 px-4 py-3 bg-transparent text-slate-700 dark:text-slate-300 text-sm outline-none cursor-pointer font-medium appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
          >
            <option value="All">Semua Status</option>
            <option value="Active">Active</option>
            <option value="Internal">Internal</option>
          </select>
        </div>
      </div>

      {/* Grid Klien */}
      {filteredClients.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredClients.map((client) => (
              <motion.div key={client.id} variants={cardVariants} layout>
                <Link href={`/clients/${client.id}`} className="block h-full">
                  <div className="p-6 rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-xl hover:bg-white dark:hover:bg-slate-900 shadow-sm hover:shadow-xl hover:shadow-[#FC7A0B]/5 hover:border-[#FC7A0B]/40 transition-all duration-300 group cursor-pointer h-full flex flex-col justify-between relative overflow-hidden">
                    
                    {/* Aksen Background Halus saat Hover */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FC7A0B]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                    <div>
                      {/* Header Kartu: Avatar & Status */}
                      <div className="flex justify-between items-start mb-5">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#011D58] to-[#022b82] dark:from-slate-800 dark:to-slate-900 shadow-inner flex items-center justify-center text-white text-xl font-black uppercase ring-4 ring-white dark:ring-slate-950">
                          {client.companyName.charAt(0)}
                        </div>
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                          client.status === "Active"
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                        }`}>
                          {client.status === "Active" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                          {client.status}
                        </span>
                      </div>

                      {/* Detail Nama & Kontak */}
                      <div className="mb-5 relative z-10">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-[#FA4D09] transition-colors leading-tight mb-3">
                          {client.companyName}
                        </h3>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                            <span className="p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-md text-slate-400 dark:text-slate-500">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </span>
                            <span className="font-semibold">{client.picName}</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                            <span className="p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-md text-slate-400 dark:text-slate-500">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </span>
                            <span className="truncate">{client.email || "Tidak ada email"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Proyek Website List */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 relative z-10">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                        Proyek Aktif ({client.websites?.length || 0})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {client.websites && client.websites.length > 0 ? (
                          client.websites.map((web, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 group-hover:border-[#FC7A0B]/30 transition-colors flex items-center gap-1.5"
                            >
                              <svg className="w-3 h-3 text-[#FC7A0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                              {web}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">Belum ada website terdaftar.</span>
                        )}
                      </div>
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center p-16 text-center bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed"
        >
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-5 shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            Klien Tidak Ditemukan
          </h3>
          <p className="text-sm text-slate-500 max-w-md">
            Tidak ada klien yang cocok dengan kata kunci <span className="font-semibold">"{searchQuery}"</span> atau filter yang dipilih.
          </p>
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

      {/* Modal Tambah Klien */}
      <AnimatePresence>
        {isModalOpen && (
          <AddClientModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
              triggerNotification("Klien baru berhasil ditambahkan.");
              router.refresh();
            }}
          />
        )}
      </AnimatePresence>

      {/* Toast Notifikasi Kanan Atas (Konsisten dengan modul lain) */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed top-8 right-8 z-[200] flex items-center gap-3 px-5 py-4 bg-emerald-600 dark:bg-emerald-500 text-white font-semibold text-sm rounded-2xl shadow-2xl shadow-emerald-600/30 backdrop-blur-xl"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            <p className="pr-2">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}