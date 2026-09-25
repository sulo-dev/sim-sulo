"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { deleteInfrastructure } from "@/actions/infrastructureActions";
import AddInfrastructureModal from "@/components/AddInfrastructureModal";
import EditInfrastructureModal from "@/components/EditInfrastructureModal";
import InfrastructureModal from "@/components/InfrastructureDetailModal";
import { formatDateIndo } from "@/lib/utils"; 

type Infrastructure = {
  id: number;
  websiteId: number;
  websiteName: string;
  type: string;
  provider: string;
  asset: string;
  expiry: string;
  status: string;
  purchaseDate: string;
  renewalPrice: string;
  billingCycle?: string;
};

type WebsiteDropdown = { id: number; name: string };

type Props = {
  initialData: Infrastructure[];
  websites: WebsiteDropdown[];
};

// Varian Animasi Grid
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

export default function InfrastructuresClient({ initialData, websites }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  
  // State Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedInfra, setSelectedInfra] = useState<Infrastructure | null>(null);

  // State Delete Modal Kustom
  const [infraToDelete, setInfraToDelete] = useState<Infrastructure | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State Notifikasi Toast
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });
  const triggerNotification = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 5000); // Disamakan 5 detik
  };

  // EKSEKUSI HAPUS DATA
  const executeDelete = async () => {
    if (!infraToDelete) return;

    setIsDeleting(true);
    const res = await deleteInfrastructure(infraToDelete.id, infraToDelete.websiteId);

    if (res.success) {
      triggerNotification(`Aset ${infraToDelete.asset} berhasil dihapus.`);
      setInfraToDelete(null);
      router.refresh(); // Update UI otomatis
    } else {
      alert("Gagal menghapus: " + res.message);
    }
    setIsDeleting(false);
  };

  // LOGIKA FILTER PENCARIAN & TIPE ASET
  const filteredData = initialData.filter((item) => {
    const matchesSearch =
      item.asset.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.websiteName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "All" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // KALKULASI MINI STATS
  const totalAssets = initialData.length;
  const warningAssets = initialData.filter(i => i.status === "Warning").length;
  const activeAssets = totalAssets - warningAssets;

  // HELPER IKON TIPE ASET
  const getIconForType = (type: string) => {
    switch (type) {
      case "Domain":
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;
      case "Hosting":
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>;
      case "Server":
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>;
      case "SSL":
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
      default:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
    }
  };

  const getColorClassForType = (type: string) => {
    switch (type) {
      case "Domain": return "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400";
      case "Hosting": return "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400";
      case "Server": return "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400";
      case "SSL": return "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";
      default: return "bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400";
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Aset & <span className="text-[#FA4D09]">Infrastruktur</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola dan pantau masa aktif Domain, Hosting, Server, dan SSL.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 bg-[#011D58] hover:bg-[#022b82] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#011D58]/20 flex items-center justify-center gap-2 active:scale-95 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Aset
        </button>
      </div>

      {/* MINI STATS & FILTER */}
      <div className="flex flex-col xl:flex-row gap-5 justify-between items-start xl:items-center">
        
        {/* Ringkasan */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 w-full xl:w-auto">
          <div className="flex items-center gap-3 p-4 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm">
            <span className="p-3 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-xl shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Aset</p>
              <p className="text-base font-black text-slate-900 dark:text-white leading-none mt-1">{totalAssets} Item</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm">
            <span className="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-xl shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status Aman</p>
              <p className="text-base font-black text-slate-900 dark:text-white leading-none mt-1">{activeAssets} Item</p>
            </div>
          </div>
          <div className="col-span-2 md:col-span-1 flex items-center gap-3 p-4 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm">
            <span className="p-3 bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 rounded-xl shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Segera Expired</p>
              <p className="text-base font-black text-slate-900 dark:text-white leading-none mt-1">{warningAssets} Item</p>
            </div>
          </div>
        </div>

        {/* Toolbar Pencarian & Filter Kategori Terpadu */}
        <div className="flex flex-col md:flex-row gap-0 bg-white/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm w-full xl:w-auto overflow-hidden focus-within:ring-2 focus-within:ring-[#FC7A0B]/50 transition-shadow">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
            {["All", "Domain", "Hosting", "Server", "SSL"].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
                  typeFilter === type
                    ? "bg-white dark:bg-slate-800 text-[#011D58] dark:text-[#FF9F03] shadow-sm border border-slate-200/50 dark:border-slate-700"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-transparent"
                }`}
              >
                {type === "All" ? "Semua" : type}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64 shrink-0">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari aset atau provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-transparent text-slate-900 dark:text-slate-200 text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* GRID KARTU INFRASTRUKTUR */}
      {filteredData.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filteredData.map((item) => (
              <motion.div
                key={item.id}
                variants={cardVariants}
                layout
                className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-xl rounded-3xl p-5 shadow-sm hover:shadow-xl hover:shadow-[#FC7A0B]/5 hover:border-[#FC7A0B]/40 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden h-full"
              >
                {/* Efek Glow Latar saat Hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#011D58]/5 to-transparent dark:from-[#011D58]/20 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 ${getColorClassForType(item.type)}`}>
                      {getIconForType(item.type)}
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                      item.status === "Warning" 
                        ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20" 
                        : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                    }`}>
                      {item.status === "Warning" && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
                      {item.status}
                    </span>
                  </div>

                  <h3
                    onClick={() => {
                      setSelectedInfra(item);
                      setIsDetailModalOpen(true);
                    }}
                    className="font-black text-xl text-slate-900 dark:text-white truncate cursor-pointer hover:text-[#FA4D09] dark:hover:text-[#FF9F03] transition-colors mb-1"
                    title={item.asset}
                  >
                    {item.asset}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    <span className="truncate">{item.provider}</span>
                    <span className="opacity-50">•</span>
                    <span className="text-xs uppercase tracking-widest">{item.type}</span>
                  </div>

                  <div className="mt-5 p-4 bg-white/50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-md">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold leading-none mb-1">Proyek / Klien</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{item.websiteName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md ${item.status === "Warning" ? "bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400" : "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400"}`}>
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold leading-none mb-1">Tgl. Kedaluwarsa</p>
                        <p className={`text-sm font-bold truncate ${item.status === "Warning" ? "text-amber-600 dark:text-amber-500" : "text-slate-700 dark:text-slate-300"}`}>
                          {formatDateIndo(item.expiry)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center relative z-10">
                  <button
                    onClick={() => {
                      setSelectedInfra(item);
                      setIsEditModalOpen(true);
                    }}
                    className="text-sm font-bold text-[#011D58] dark:text-[#FF9F03] group-hover:text-[#FA4D09] transition-colors flex items-center gap-1.5"
                  >
                    Perbarui Aset
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                  <button
                    onClick={() => setInfraToDelete(item)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                    title="Hapus Aset"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
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
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Aset Tidak Ditemukan</h3>
          <p className="text-sm text-slate-500 max-w-md">Tidak ada data infrastruktur yang cocok dengan filter atau pencarian Anda.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setTypeFilter("All");
            }}
            className="mt-6 px-6 py-2.5 bg-[#011D58] hover:bg-[#022b82] text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-[#011D58]/20"
          >
            Reset Filter
          </button>
        </motion.div>
      )}

      {/* MODAL TAMBAH ASET */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddInfrastructureModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            websites={websites}
            onSuccess={() => {
              triggerNotification("Aset infrastruktur baru berhasil ditambahkan!");
              router.refresh();
            }}
          />
        )}
      </AnimatePresence>

      {/* MODAL EDIT ASET */}
      <AnimatePresence>
        {isEditModalOpen && selectedInfra && (
          <EditInfrastructureModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            infrastructure={selectedInfra}
            websites={websites}
            onSuccess={() => {
              triggerNotification("Infrastruktur berhasil diperbarui!");
              router.refresh(); 
            }}
          />
        )}
      </AnimatePresence>

      {/* MODAL DETAIL ASET */}
      <AnimatePresence>
        {isDetailModalOpen && selectedInfra && (
          <InfrastructureModal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedInfra(null);
            }}
            data={{
              ...selectedInfra,
              id: selectedInfra.id,
              billingCycle: selectedInfra.billingCycle ?? "Tahun",
            }}
          />
        )}
      </AnimatePresence>

      {/* MODAL HAPUS ASET */}
      <AnimatePresence>
        {infraToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setInfraToDelete(null)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 z-10 text-center"
            >
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner border border-rose-100 dark:border-rose-500/20">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Hapus Aset Infrastruktur?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                Anda yakin ingin menghapus aset <span className="font-bold text-slate-800 dark:text-slate-200">"{infraToDelete.asset}"</span>? Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setInfraToDelete(null)}
                  disabled={isDeleting}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={executeDelete}
                  disabled={isDeleting}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-70"
                >
                  {isDeleting ? (
                    <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Menghapus...</>
                  ) : "Ya, Hapus"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST NOTIFIKASI KANAN ATAS */}
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
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="pr-2">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}