"use client";

import { motion } from "framer-motion";

// Definisi tipe data yang diterima modal
type InfraData = {
  id: number;
  type: string;
  provider: string;
  asset: string;
  expiry: string;
  status: string;
  purchaseDate?: string;
  renewalPrice?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  data: InfraData | null;
};

export default function InfrastructureModal({ isOpen, onClose, data }: Props) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop (Latar Belakang Gelap/Blur) */}
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
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden z-10"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-[#011D58]/10 dark:bg-[#FF9F03]/10 text-[#011D58] dark:text-[#FF9F03] rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Detail Infrastruktur</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-[#FA4D09] bg-slate-200/50 dark:bg-slate-800 p-2 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{data.asset}</h4>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
              data.status === 'Safe' 
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                : 'bg-[#FA4D09]/10 text-[#FA4D09] border-[#FA4D09]/20 shadow-[0_0_10px_rgba(250,77,9,0.2)]'
            }`}>
              {data.status === 'Warning' ? 'Perlu Diperpanjang' : 'Status Aman'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/80">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tipe Aset</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{data.type}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/80">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Provider Penyedia</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{data.provider}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/80">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tanggal Pembelian</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{data.purchaseDate || '-'}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/80">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tanggal Berakhir</p>
              <p className={`text-sm font-black ${data.status === 'Warning' ? 'text-[#FA4D09]' : 'text-slate-900 dark:text-slate-200'}`}>
                {data.expiry}
              </p>
            </div>
          </div>

          <div className="p-5 bg-[#011D58]/5 dark:bg-[#011D58]/20 border border-[#011D58]/20 rounded-2xl flex justify-between items-center shadow-inner">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#011D58] dark:text-[#FF9F03] mb-1">Estimasi Harga Perpanjangan</p>
              <p className="text-xl font-black text-[#011D58] dark:text-[#FF9F03]">{data.renewalPrice || 'Rp 0'}</p>
            </div>
            <button className="px-5 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-[#011D58]/20">
              Perpanjang
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}