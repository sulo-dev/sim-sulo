"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createTicket } from "@/actions/ticketActions";
import { toInputDateFormat } from "@/lib/utils";

type Website = { id: number; name: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  websites: Website[];
  onSuccess: () => void;
  showToast?: (message: string, type: "success" | "error") => void;
};

export default function AddTicketModal({ isOpen, onClose, websites, onSuccess, showToast }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  // State Form
  const [title, setTitle] = useState("");
  const [websiteId, setWebsiteId] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setIsLoading(false);
      setTitle("");
      setWebsiteId("");
      setPriority("Medium");
      setDescription("");
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 1. Bersihkan input dari spasi berlebih
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    // 2. VALIDASI KETAT: Pastikan Judul tidak hanya spasi
    if (!trimmedTitle) {
      if (showToast) showToast("Judul masalah tidak boleh kosong!", "error");
      else alert("Judul masalah tidak boleh kosong!");
      setIsLoading(false);
      return;
    }

    // 3. VALIDASI KETAT: Pastikan proyek sudah dipilih
    if (!websiteId) {
      if (showToast) showToast("Pilih proyek terkait terlebih dahulu!", "error");
      else alert("Pilih proyek terkait terlebih dahulu!");
      setIsLoading(false);
      return;
    }

    // 4. VALIDASI KETAT: Pastikan deskripsi bukan hanya spasi kosong
    if (!trimmedDescription) {
      if (showToast) showToast("Deskripsi masalah tidak boleh kosong!", "error");
      else alert("Deskripsi masalah tidak boleh kosong!");
      setIsLoading(false);
      return;
    }
    
    const today = toInputDateFormat(new Date().toISOString());

    // 5. Gunakan data bersih untuk dikirim ke Database
    const ticketData = {
      title: trimmedTitle, 
      websiteId: Number(websiteId),
      priority,
      status: "Open", // Default status saat tiket dibuat
      reportedDate: today,
      description: trimmedDescription, 
    };

    const res = await createTicket(ticketData);

    setIsLoading(false);

    if (res.success) {
      if (showToast) showToast("Tiket baru berhasil dibuat!", "success");
      onSuccess(); 
      handleClose(); 
    } else {
      if (showToast) showToast("Gagal membuat tiket: " + res.message, "error");
      else alert("Gagal membuat tiket: " + res.message);
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
        {/* Header Modal */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-[#011D58]/10 dark:bg-[#FF9F03]/10 text-[#011D58] dark:text-[#FF9F03] rounded-xl shadow-inner">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Buat Tiket Baru</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Laporkan bug, masalah, atau permintaan fitur.</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-[#FA4D09] bg-slate-200/50 dark:bg-slate-800 p-2 rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Judul Masalah *</label>
              <input 
                type="text" 
                required 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Contoh: Gagal export laporan PDF di halaman Keuangan" 
                className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3 outline-none transition-colors shadow-sm dark:shadow-none" 
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Proyek Terkait *</label>
                <select 
                  required 
                  value={websiteId} 
                  onChange={(e) => setWebsiteId(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3 outline-none transition-colors shadow-sm dark:shadow-none cursor-pointer"
                >
                  <option value="">-- Pilih Website / Proyek --</option>
                  {websites.map(web => (
                    <option key={web.id} value={web.id}>{web.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Prioritas *</label>
                <select 
                  required 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3 outline-none transition-colors shadow-sm dark:shadow-none cursor-pointer"
                >
                  <option value="Low">Low (Rendah)</option>
                  <option value="Medium">Medium (Sedang)</option>
                  <option value="High">High (Tinggi / Mendesak)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Deskripsi Detail *</label>
              <textarea 
                required 
                rows={4} 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Jelaskan langkah-langkah untuk mereproduksi masalah atau rincian fitur yang diminta..." 
                className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3 outline-none transition-colors resize-none shadow-sm dark:shadow-none"
              ></textarea>
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
                <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Menyimpan...</>
              ) : (
                "Kirim Tiket"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}