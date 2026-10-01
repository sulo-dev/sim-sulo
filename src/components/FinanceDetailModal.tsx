"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { deleteFinance } from "@/actions/financeActions";

type BreakdownItem = {
  item?: string;
  keterangan?: string;
  amount?: number;
  nominal?: number;
};

type FinanceData = {
  id: number;
  websiteId?: number;
  websiteName: string;
  clientName: string;
  billingCycle: string;
  revenue: number;
  cost: number;
  profit: number;
  costBreakdown: BreakdownItem[];
  nextBilling: string;
  status: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  data: FinanceData | null;
  onSuccess: () => void;
  showToast: (message: string, type: "success" | "error") => void;
  onEditClick: () => void;
};

const formatIDR = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

// Varian Animasi Staggered untuk Elemen Modal
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function FinanceDetailModal({
  isOpen,
  onClose,
  data,
  onSuccess,
  showToast,
  onEditClick,
}: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (!data) return;

    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    const res = await deleteFinance(data.id);
    setIsDeleting(false);

    if (res.success) {
      showToast("Data keuangan berhasil dihapus.", "success");
      onSuccess();
      handleClose();
    } else {
      showToast(res.message || "Gagal menghapus data keuangan.", "error");
      setConfirmDelete(false);
    }
  };

  const handleClose = () => {
    setConfirmDelete(false);
    setIsDeleting(false);
    onClose();
  };

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop Modal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={!isDeleting ? handleClose : undefined}
        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer"
      />

      {/* Konten Modal Detail */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-[#011D58]/10 dark:bg-[#FF9F03]/10 text-[#011D58] dark:text-[#FF9F03] rounded-xl shadow-inner font-black text-xs tracking-widest flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              INV-{data.id.toString().padStart(3, "0")}
            </span>
            <span className="text-xs font-semibold text-slate-400">Rincian Tagihan Keuangan</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            className="text-slate-400 hover:text-rose-500 bg-slate-200/50 dark:bg-slate-800 p-2 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body Modal Scrollable */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            
            {/* Informasi Proyek & Klien */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                  {data.websiteName}
                </h2>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {data.clientName}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Siklus: {data.billingCycle}
                  </span>

                  <span
                    className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg border flex items-center gap-1.5 ${
                      data.status === "Paid"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                        : data.status === "Unpaid"
                        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                    }`}
                  >
                    {data.status === "Paid" && (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {data.status === "Unpaid" && (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    Status: {data.status}
                  </span>
                </div>
              </div>

              {/* Kotak Jatuh Tempo */}
              <div className="flex-shrink-0 min-w-[190px] p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 shadow-sm">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="p-1.5 bg-[#FF9F03]/10 text-[#FC7A0B] rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                    Jatuh Tempo
                  </p>
                </div>
                <p className="text-lg font-black text-amber-950 dark:text-amber-300">
                  {data.nextBilling || "-"}
                </p>
              </div>
            </motion.div>

            <motion.hr variants={itemVariants} className="border-slate-100 dark:border-slate-800" />

            {/* Ringkasan Angka Keuangan */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Pendapatan */}
              <div className="p-4 bg-blue-50/70 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Pendapatan
                </p>
                <p className="text-base font-black text-blue-900 dark:text-blue-100">
                  {formatIDR(data.revenue || 0)}
                </p>
              </div>

              {/* Beban (HPP) */}
              <div className="p-4 bg-rose-50/70 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                  Beban (HPP)
                </p>
                <p className="text-base font-black text-rose-900 dark:text-rose-100">
                  - {formatIDR(data.cost || 0)}
                </p>
              </div>

              {/* Laba Bersih */}
              <div
                className={`p-4 rounded-2xl border ${
                  data.profit > 0
                    ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                }`}
              >
                <p
                  className={`text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 ${
                    data.profit > 0
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Margin Laba
                </p>
                <p
                  className={`text-base font-black ${
                    data.profit > 0
                      ? "text-emerald-900 dark:text-emerald-100"
                      : "text-slate-900 dark:text-white"
                  }`}
                >
                  {formatIDR(data.profit || 0)}
                </p>
              </div>
            </motion.div>

            {/* List Rincian Beban Infrastruktur */}
            <motion.div variants={itemVariants}>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Rincian Beban Infrastruktur
              </h4>

              <div className="space-y-2">
                {data.costBreakdown && data.costBreakdown.length > 0 ? (
                  <>
                    {data.costBreakdown.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {item.item || item.keterangan || "Layanan Tidak Diketahui"}
                        </span>
                        <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                          {formatIDR(item.amount ?? item.nominal ?? 0)}
                        </span>
                      </div>
                    ))}

                    <div className="flex justify-between items-center p-4 mt-3 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Total Beban
                      </span>
                      <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                        {formatIDR(data.cost || 0)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center bg-slate-50 dark:bg-slate-950/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <p className="text-slate-400 text-xs font-medium">
                      Tidak ada rincian beban infrastruktur terlampir untuk proyek ini.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer Modal Action */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Tombol Hapus dengan Konfirmasi Inline */}
            <AnimatePresence mode="wait">
              {confirmDelete ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-md shadow-rose-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : null}
                    {isDeleting ? "Menghapus..." : "Yakin Hapus?"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    disabled={isDeleting}
                    className="px-3.5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="delete"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors border border-rose-200/80 dark:border-rose-500/20"
                >
                  Hapus Data
                </motion.button>
              )}
            </AnimatePresence>

            {/* Tombol Edit Tagihan */}
            {!confirmDelete && (
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onEditClick();
                }}
                className="px-4 py-2.5 bg-[#011D58]/10 hover:bg-[#011D58]/20 dark:bg-[#FF9F03]/10 dark:hover:bg-[#FF9F03]/20 text-[#011D58] dark:text-[#FF9F03] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
              >
                Edit Tagihan
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md w-full sm:w-auto"
          >
            Tutup Rincian
          </button>
        </div>
      </motion.div>
    </div>
  );
}