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
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer"
      />

      {/* Konten Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </span>
            <h3 className="text-lg font-bold text-white">Detail Infrastruktur</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-2xl font-bold text-white mb-1">{data.asset}</h4>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
              data.status === 'Safe' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {data.status === 'Warning' ? 'Perlu Diperpanjang' : 'Status Aman'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
              <p className="text-xs text-slate-500 mb-1">Tipe Aset</p>
              <p className="text-sm font-medium text-slate-200">{data.type}</p>
            </div>
            <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
              <p className="text-xs text-slate-500 mb-1">Provider Penyedia</p>
              <p className="text-sm font-medium text-slate-200">{data.provider}</p>
            </div>
            <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
              <p className="text-xs text-slate-500 mb-1">Tanggal Pembelian</p>
              <p className="text-sm font-medium text-slate-200">{data.purchaseDate || '-'}</p>
            </div>
            <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
              <p className="text-xs text-slate-500 mb-1">Tanggal Berakhir</p>
              <p className={`text-sm font-bold ${data.status === 'Warning' ? 'text-amber-400' : 'text-slate-200'}`}>
                {data.expiry}
              </p>
            </div>
          </div>

          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex justify-between items-center">
            <div>
              <p className="text-xs text-indigo-300 mb-1">Estimasi Harga Perpanjangan</p>
              <p className="text-lg font-bold text-indigo-400">{data.renewalPrice || 'Rp 0'}</p>
            </div>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20">
              Perpanjang
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}