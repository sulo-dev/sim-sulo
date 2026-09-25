"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateWebsite } from "@/actions/websiteActions"; 

// 1. TAMBAHKAN TIPE DATA UNTUK CLIENTS
type ClientDropdown = {
  id: number;
  companyName: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; 
  website: any;
  clients: ClientDropdown[]; // 2. TERIMA PROPS INI DARI INDUK
};

export default function EditWebsiteModal({ isOpen, onClose, onSuccess, website, clients }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success'>('idle');

  // Gunakan data website untuk mengisi nilai awal
  const [projectName, setProjectName] = useState(website?.name || "");
  const [clientId, setClientId] = useState(website?.clientId || website?.client_id || "");
  const [techStack, setTechStack] = useState(
    website?.stack || (website?.techStack ? website.techStack : website?.tech_stack || "")
  );
  const [status, setStatus] = useState(website?.status || "Active");
  const [url, setUrl] = useState(website?.productionUrl || website?.production_url || website?.url || "");

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSubmitStatus('idle');
      setIsLoading(false);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 1. Bersihkan input dari spasi berlebih di awal/akhir
    const trimmedProjectName = projectName.trim();
    const trimmedTechStack = techStack.trim();
    const trimmedUrl = url.trim();

    // 2. VALIDASI KETAT: Cegah input yang hanya berisi spasi kosong
    if (!trimmedProjectName || !clientId || !status || !trimmedTechStack || !trimmedUrl) {
      alert("Semua kolom wajib diisi dan tidak boleh hanya berisi spasi kosong!");
      setIsLoading(false);
      return;
    }

    // 3. VALIDASI KETAT: Pastikan format URL valid
    const urlRegex = /^(https?:\/\/)?([\w\d\-]+\.)+\w{2,}(\/.*)?$/i;
    if (!urlRegex.test(trimmedUrl)) {
      alert("Format URL tidak valid! Pastikan formatnya benar (contoh: https://namadomain.com).");
      setIsLoading(false);
      return;
    }

    // 4. Panggil fungsi Update ke Database menggunakan data yang sudah bersih
    const res = await updateWebsite(website.id, {
      name: trimmedProjectName,
      clientId: Number(clientId), // Pastikan ini dikirim sebagai Number
      status: status,
      techStack: trimmedTechStack,
      productionUrl: trimmedUrl
    });

    if (res.success) {
      setSubmitStatus('success');
      setTimeout(() => {
        handleClose();
        onSuccess?.(); // Panggil notifikasi dari komponen induk
      }, 1500);
    } else {
      setIsLoading(false);
      alert("Gagal memperbarui proyek: " + res.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={submitStatus === 'idle' ? handleClose : undefined} className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer" />

      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }} className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden z-10">
        <AnimatePresence mode="wait">
          {submitStatus === 'idle' && (
            <motion.div key="form-view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-[#011D58]/10 dark:bg-[#FF9F03]/10 text-[#011D58] dark:text-[#FF9F03] rounded-xl shadow-inner">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Proyek Website</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Perbarui informasi teknis dan status proyek.</p>
                  </div>
                </div>
                <button type="button" onClick={handleClose} className="text-slate-400 hover:text-[#FA4D09] bg-slate-200/50 dark:bg-slate-800 p-2 rounded-xl transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Nama Proyek *</label>
                    <input type="text" required value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Contoh: Portal Desa Digital" className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3 outline-none transition-colors shadow-sm dark:shadow-none" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      {/* 3. LOOPING DATA KLIEN UNTUK DROPDOWN */}
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Klien *</label>
                      <select required value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3 outline-none transition-colors shadow-sm dark:shadow-none cursor-pointer">
                        <option value="">-- Pilih Klien --</option>
                        {clients && clients.map((client) => (
                          <option key={client.id} value={client.id}>{client.companyName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Status Proyek *</label>
                      <select required value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3 outline-none transition-colors shadow-sm dark:shadow-none cursor-pointer">
                        <option value="Active">Aktif (Active)</option>
                        <option value="Maintenance">Masa Garansi (Maintenance)</option>
                        <option value="Inactive">Tidak Aktif / Selesai</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Tech Stack *</label>
                      <input type="text" required value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="Next.js, Tailwind..." className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3 outline-none transition-colors shadow-sm dark:shadow-none" />
                    </div>
                    <div>
                      {/* DITAMBAHKAN * DAN REQUIRED */}
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">URL Production *</label>
                      <input type="url" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://namaproyek.com" className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3 outline-none transition-colors shadow-sm dark:shadow-none" />
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end gap-3">
                  <button type="button" onClick={handleClose} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors">Batal</button>
                  <button type="submit" disabled={isLoading} className="px-5 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-[#011D58]/20 flex items-center gap-2 disabled:opacity-70">
                    {isLoading ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Menyimpan...</> : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {submitStatus === 'success' && (
            <motion.div key="success-view" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3, type: 'spring', bounce: 0.4 }} className="p-10 flex flex-col items-center justify-center text-center min-h-[400px] relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-inner border border-emerald-200 dark:border-emerald-500/20">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              </div>
              <h3 className="relative z-10 text-2xl font-black text-slate-900 dark:text-white mb-2">Perubahan Disimpan!</h3>
              <p className="relative z-10 text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">Informasi dan detail teknis proyek website berhasil diperbarui ke dalam sistem.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}