"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createInfrastructure } from "@/actions/infrastructureActions";
import { formatDateIndo } from "@/lib/utils"; 

type WebsiteDropdown = { id: number; name: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  websites: WebsiteDropdown[]; 
  onSuccess?: () => void;
};

export default function AddInfrastructureModal({ isOpen, onClose, websites, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // State Form
  const [type, setType] = useState("");
  const [provider, setProvider] = useState("");
  const [assetName, setAssetName] = useState("");
  const [websiteId, setWebsiteId] = useState("");
  const [expiry, setExpiry] = useState("");
  const [renewalPrice, setRenewalPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState("Tahun");

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSubmitStatus('idle');
      setIsLoading(false);
      setType(""); 
      setProvider(""); 
      setAssetName(""); 
      setWebsiteId(""); 
      setExpiry(""); 
      setRenewalPrice("");
      setBillingCycle("Tahun");
    }, 300);
  };

  // FUNGSI: Otomatis memformat angka menjadi Rupiah (Rp 150.000)
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    
    // Jika input dihapus habis
    if (inputVal === "" || inputVal === "Rp" || inputVal === "Rp ") {
      setRenewalPrice("");
      return;
    }
    
    // Hilangkan semua karakter selain angka (hanya sisakan angka 0-9)
    const numericValue = inputVal.replace(/[^0-9]/g, "");
    
    if (numericValue) {
      // Format dengan pemisah ribuan standar Indonesia (titik)
      const formatted = new Intl.NumberFormat("id-ID").format(Number(numericValue));
      setRenewalPrice(`Rp ${formatted}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. Bersihkan input teks dari spasi berlebih
    const trimmedProvider = provider.trim();
    const trimmedAssetName = assetName.trim();
    
    // 2. VALIDASI KETAT: Cegah input yang hanya berisi spasi kosong
    if (!type || !trimmedProvider || !trimmedAssetName || !websiteId || !expiry) {
      alert("Semua kolom wajib diisi dan tidak boleh hanya berisi spasi kosong!");
      setIsLoading(false);
      return;
    }

    // 3. VALIDASI HARGA: Pastikan tidak hanya terisi string "Rp " saja
    if (!renewalPrice || renewalPrice === "Rp " || renewalPrice === "Rp") {
      alert("Biaya Perpanjangan wajib diisi dengan nominal yang benar (minimal Rp 0)!");
      setIsLoading(false);
      return;
    }

    // 4. Data bersih yang siap dikirim
    const newInfraData = {
      websiteId: Number(websiteId),
      type,
      provider: trimmedProvider,
      asset: trimmedAssetName,
      expiry,
      status: "Safe", // Status default
      purchaseDate: new Date().toISOString().split('T')[0],
      renewalPrice: renewalPrice, 
      billingCycle: billingCycle
    };
    
    const res = await createInfrastructure(newInfraData);

    if (res.success) {
      setSubmitStatus('success');
      setTimeout(() => {
        handleClose();
        if (onSuccess) onSuccess();
      }, 1500); // Dipercepat menjadi 1.5 detik
    } else {
      setIsLoading(false);
      alert("Gagal menambahkan aset: " + res.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={submitStatus === 'idle' ? handleClose : undefined} className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer" />

      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }} className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        <AnimatePresence mode="wait">
          {submitStatus === 'idle' && (
            <motion.div key="form-view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-[#011D58]/10 dark:bg-[#FF9F03]/10 text-[#011D58] dark:text-[#FF9F03] rounded-xl shadow-inner">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Registrasi Aset Infrastruktur</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Tambah detail provider dan jadwal perpanjangan.</p>
                  </div>
                </div>
                <button onClick={handleClose} className="text-slate-400 hover:text-[#FA4D09] bg-slate-200/50 dark:bg-slate-800 p-2 rounded-xl transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Tipe Aset *</label>
                      <select required value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3 outline-none transition-colors shadow-sm cursor-pointer">
                        <option value="">-- Pilih Tipe --</option>
                        <option value="Domain">Domain</option>
                        <option value="Hosting">Hosting</option>
                        <option value="Server">Server / VPS</option>
                        <option value="SSL">SSL Certificate</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Nama Provider *</label>
                      <input type="text" required value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Contoh: Niagahoster, Vercel" className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3 outline-none transition-colors shadow-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Nama Aset / Domain *</label>
                    <input type="text" required value={assetName} onChange={(e) => setAssetName(e.target.value)} placeholder="Contoh: desadigital.id atau Droplet 4GB" className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3 outline-none transition-colors shadow-sm" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Proyek Terkait *</label>
                      <select required value={websiteId} onChange={(e) => setWebsiteId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3 outline-none transition-colors shadow-sm cursor-pointer">
                        <option value="">-- Pilih Website --</option>
                        {websites.map(web => (
                          <option key={web.id} value={web.id}>{web.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Tanggal Expired *</label>
                      <input type="date" required value={expiry} onChange={(e) => setExpiry(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3 outline-none transition-colors shadow-sm dark:[color-scheme:dark]" />
                      {expiry && (
                        <p className="text-[10px] text-slate-500 mt-1.5 font-medium">
                          Tampilan: <span className="font-bold text-slate-700 dark:text-slate-300">{formatDateIndo(expiry)}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Biaya Perpanjangan *</label>
                      <input 
                        type="text" 
                        required
                        value={renewalPrice} 
                        onChange={handlePriceChange} 
                        placeholder="Rp 0" 
                        className="w-full font-semibold bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3 outline-none transition-colors shadow-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Siklus Pembayaran *</label>
                      <select 
                        required
                        value={billingCycle} 
                        onChange={(e) => setBillingCycle(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3 outline-none transition-colors shadow-sm cursor-pointer"
                      >
                        <option value="Bulan">Per Bulan</option>
                        <option value="Tahun">Per Tahun</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end gap-3 shrink-0">
                  <button type="button" onClick={handleClose} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors">Batal</button>
                  <button type="submit" disabled={isLoading} className="px-5 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-[#011D58]/20 flex items-center gap-2 disabled:opacity-70">
                    {isLoading ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Menyimpan...</> : "Simpan Aset"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {submitStatus === 'success' && (
            <motion.div key="success-view" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3, type: 'spring', bounce: 0.4 }} className="p-10 flex flex-col items-center justify-center text-center min-h-[400px] relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-inner border border-emerald-200 dark:border-emerald-500/20">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="relative z-10 text-2xl font-black text-slate-900 dark:text-white mb-2">Aset Berhasil Didaftarkan!</h3>
              <p className="relative z-10 text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">Aset infrastruktur telah tersimpan dan jadwal perpanjangan akan dipantau oleh sistem.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}