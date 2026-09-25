"use client";

import { motion, type Variants } from "framer-motion";
import { formatDateIndo } from "@/lib/utils"; 

// Definisi tipe data yang diterima modal
type InfraData = {
  id: number | string;
  type: string;
  provider: string;
  asset: string;
  expiry: string;
  status: string;
  purchaseDate?: string;
  renewalPrice?: string;
  billingCycle?: string; // Menambahkan opsional fallback
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  data: InfraData | null;
};

// Varian Animasi untuk efek bertahap (Stagger)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function InfrastructureDetailModal({ isOpen, onClose, data }: Props) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer"
      />

      {/* Konten Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-[#011D58]/10 dark:bg-[#FF9F03]/10 text-[#011D58] dark:text-[#FF9F03] rounded-xl shadow-inner">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Detail Infrastruktur</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-rose-500 bg-slate-200/50 dark:bg-slate-800 p-2 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body Modal (Bisa di-scroll jika konten panjang) */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            
            {/* HERO SECTION: NAMA ASET & STATUS */}
            <motion.div variants={itemVariants} className="text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Nama Aset / Domain</p>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white break-all">{data.asset}</h4>
              </div>
              <div className="shrink-0">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${
                  data.status === 'Safe' 
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                    : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20 shadow-[0_0_15px_rgba(225,29,72,0.15)] animate-pulse'
                }`}>
                  {data.status === 'Warning' ? (
                    <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> Perlu Diperpanjang</>
                  ) : (
                    <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Status Aman</>
                  )}
                </span>
              </div>
            </motion.div>

            <motion.hr variants={itemVariants} className="border-slate-100 dark:border-slate-800" />

            {/* GRID DETAIL INFORMASI */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
              
              {/* Tipe Aset */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 group hover:border-[#FC7A0B]/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-slate-400 group-hover:text-[#FC7A0B] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                  </span>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tipe Aset</p>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{data.type}</p>
              </div>

              {/* Provider */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 group hover:border-[#FC7A0B]/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-slate-400 group-hover:text-[#FC7A0B] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  </span>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Provider</p>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{data.provider}</p>
              </div>
              
              {/* Tanggal Beli */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 group hover:border-[#FC7A0B]/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-slate-400 group-hover:text-[#FC7A0B] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </span>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tgl Beli</p>
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {data.purchaseDate ? formatDateIndo(data.purchaseDate) : "-"}
                </p>
              </div>

              {/* Tanggal Berakhir (Di-highlight jika Warning) */}
              <div className={`p-4 rounded-2xl border transition-colors group ${
                data.status === 'Warning' 
                  ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50' 
                  : 'bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800/80 hover:border-[#FC7A0B]/30'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={data.status === 'Warning' ? 'text-rose-500' : 'text-slate-400 group-hover:text-[#FC7A0B] transition-colors'}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </span>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${data.status === 'Warning' ? 'text-rose-500' : 'text-slate-500'}`}>Tgl Berakhir</p>
                </div>
                <p className={`text-sm font-black ${data.status === 'Warning' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-200'}`}>
                  {formatDateIndo(data.expiry)}
                </p>
              </div>

            </motion.div>

            {/* ESTIMASI HARGA & CTA PERPANJANG */}
            <motion.div variants={itemVariants} className="p-1.5 bg-gradient-to-br from-[#011D58] to-[#022b82] dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-lg shadow-[#011D58]/20">
              <div className="bg-white dark:bg-slate-950/80 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-5 text-center sm:text-left">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#011D58] dark:text-[#FF9F03] mb-1.5">
                    Estimasi Harga Perpanjangan
                  </p>
                  <p className="text-2xl font-black text-[#011D58] dark:text-white">
                    {data.renewalPrice && data.renewalPrice !== "Rp 0" ? data.renewalPrice : 'Belum Diatur'}
                    {data.renewalPrice && data.renewalPrice !== "Rp 0" && (
                      <span className="text-sm font-medium opacity-60 ml-1"> / {data.billingCycle || 'Tahun'}</span>
                    )}
                  </p>
                </div>
                <button className="w-full sm:w-auto px-6 py-3 bg-[#011D58] hover:bg-[#022b82] text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Perpanjang
                </button>
              </div>
            </motion.div>

          </motion.div>
        </div>
        
        {/* Footer Modal - Khusus untuk tombol tutup */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end shrink-0">
          <button 
            onClick={onClose} 
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-bold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>

      </motion.div>
    </div>
  );
}