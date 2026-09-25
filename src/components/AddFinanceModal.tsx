"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createFinance } from "@/actions/financeActions"; // <-- Import Server Action

type WebsiteDropdown = { id: number; name: string; clientName: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  websites: WebsiteDropdown[]; // Untuk mengisi opsi dropdown Proyek/Klien
  onSuccess?: () => void;
  showToast?: (message: string, type: "success" | "error") => void; 
};

export default function AddFinanceModal({ isOpen, onClose, websites, onSuccess, showToast }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  // State Form 
  const [websiteId, setWebsiteId] = useState("");
  const [billingCycle, setBillingCycle] = useState("Bulanan");
  const [revenue, setRevenue] = useState("");
  const [cost, setCost] = useState("");
  const [nextBilling, setNextBilling] = useState("");
  const [status, setStatus] = useState("Unpaid");

  // FUNGSI DI-UPGRADE: Otomatis memformat input dengan pemisah ribuan (1.500.000)
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const inputVal = e.target.value;
    
    // Hilangkan semua karakter selain angka
    const numericValue = inputVal.replace(/[^0-9]/g, "");
    
    if (!numericValue) {
      setter("");
      return;
    }
    
    // Format dengan titik ala Indonesia
    const formatted = new Intl.NumberFormat("id-ID").format(Number(numericValue));
    setter(formatted);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setIsLoading(false);
      // Reset Form saat ditutup
      setWebsiteId("");
      setBillingCycle("Bulanan");
      setRevenue("");
      setCost("");
      setNextBilling("");
      setStatus("Unpaid");
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. VALIDASI KETAT: Pastikan Proyek dipilih
    if (!websiteId) {
      if (showToast) showToast("Pilih proyek terlebih dahulu!", "error");
      else alert("Pilih proyek terlebih dahulu!");
      setIsLoading(false);
      return;
    }

    // 2. VALIDASI KETAT: Pastikan Tanggal terisi
    if (!nextBilling) {
      if (showToast) showToast("Tanggal penagihan berikutnya wajib diisi!", "error");
      else alert("Tanggal penagihan berikutnya wajib diisi!");
      setIsLoading(false);
      return;
    }

    // 3. Konversi nilai mata uang kembali ke angka murni untuk Database
    const cleanRevenue = Number(revenue.replace(/[^0-9]/g, "")) || 0;
    const cleanCost = Number(cost.replace(/[^0-9]/g, "")) || 0;

    // Siapkan struktur JSON untuk costBreakdown dasar
    const breakdownData = [
      {
        keterangan: "Beban Internal Default",
        nominal: cleanCost
      }
    ];

    const financeData = {
      websiteId: Number(websiteId),
      billingCycle: billingCycle,
      revenue: cleanRevenue,
      infrastructureCost: cleanCost,
      costBreakdown: breakdownData, // Menyimpan dalam bentuk JSON array
      nextBilling: nextBilling,
      status: status
    };

    const res = await createFinance(financeData);
    setIsLoading(false);

    if (res.success) {
      if (showToast) showToast("Data tagihan / keuangan berhasil ditambahkan!", "success");
      if (onSuccess) onSuccess();
      handleClose(); // Langsung tutup modal, ux lebih cepat
    } else {
      if (showToast) showToast("Gagal menyimpan tagihan: " + res.message, "error");
      else alert("Gagal menyimpan tagihan: " + res.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={!isLoading ? handleClose : undefined}
        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer"
      />

      {/* Konten Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden z-10"
      >
        <AnimatePresence mode="wait">
            <motion.div
              key="form-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-[#011D58]/10 dark:bg-[#FF9F03]/10 text-[#011D58] dark:text-[#FF9F03] rounded-xl shadow-inner">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Buat Invoice Baru</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Catat tagihan klien dan rincian beban proyek.</p>
                  </div>
                </div>
                <button 
                  onClick={handleClose}
                  className="text-slate-400 hover:text-[#FA4D09] bg-slate-200/50 dark:bg-slate-800 p-2 rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Proyek & Klien *</label>
                      <select 
                        required
                        value={websiteId}
                        onChange={(e) => setWebsiteId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3 outline-none transition-colors shadow-sm dark:shadow-none cursor-pointer"
                      >
                        <option value="">-- Pilih Proyek --</option>
                        {websites.map(web => (
                          <option key={web.id} value={web.id}>{web.name} ({web.clientName})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Siklus Penagihan *</label>
                      <select 
                        required
                        value={billingCycle}
                        onChange={(e) => setBillingCycle(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3 outline-none transition-colors shadow-sm dark:shadow-none cursor-pointer"
                      >
                        <option value="Bulanan">Bulanan (Monthly)</option>
                        <option value="Tahunan">Tahunan (Annually)</option>
                        <option value="Sekali">Sekali Bayar (One-time)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Nilai Tagihan (Pendapatan) *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
                        <input 
                          type="text" 
                          inputMode="numeric"
                          required
                          value={revenue}
                          onChange={(e) => handleCurrencyChange(e, setRevenue)}
                          placeholder="0" 
                          className="w-full pl-9 pr-3 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm font-bold rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block outline-none transition-colors shadow-sm dark:shadow-none" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Beban Internal (HPP) *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
                        <input 
                          type="text" 
                          inputMode="numeric"
                          required
                          value={cost}
                          onChange={(e) => handleCurrencyChange(e, setCost)}
                          placeholder="0" 
                          className="w-full pl-9 pr-3 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm font-bold rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block outline-none transition-colors shadow-sm dark:shadow-none" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Tgl. Penagihan Berikutnya *</label>
                      <input 
                        type="date" 
                        required 
                        value={nextBilling}
                        onChange={(e) => setNextBilling(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3 outline-none transition-colors shadow-sm dark:shadow-none dark:[color-scheme:dark]" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Status Awal *</label>
                      <select 
                        required
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3 outline-none transition-colors shadow-sm dark:shadow-none cursor-pointer"
                      >
                        <option value="Unpaid">Belum Lunas (Unpaid)</option>
                        <option value="Paid">Lunas (Paid)</option>
                        <option value="Internal">Internal (Tanpa Tagihan)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={handleClose} 
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="px-5 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-[#011D58]/20 flex items-center gap-2 disabled:opacity-70"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Tagihan"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}