"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateClient } from "@/actions/clientActions"; 

type Props = {
  isOpen: boolean;
  onClose: (isSuccess?: boolean) => void;
  onSuccess?: () => void; // Opsional: callback ketika update berhasil
  client: any; // Menerima data klien untuk diedit
};

export default function EditClientModal({ isOpen, onClose, onSuccess, client }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success'>('idle');

  // State form diisi dengan data awal klien
  const [companyName, setCompanyName] = useState(client?.companyName || client?.company_name || "");
  const [picName, setPicName] = useState(client?.picName || client?.pic_name || "");
  const [email, setEmail] = useState(client?.email || "");
  const [status, setStatus] = useState(client?.status || "Active"); // <-- State untuk Status

  const handleClose = (isSuccess = false) => {
    onClose(isSuccess);
    setTimeout(() => {
      setSubmitStatus('idle');
      setIsLoading(false);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 1. Bersihkan input dari spasi berlebih di awal/akhir
    const trimmedCompanyName = companyName.trim();
    const trimmedPicName = picName.trim();
    const trimmedEmail = email.trim();

    // 2. VALIDASI KETAT: Cegah input yang hanya berisi spasi kosong
    if (!trimmedCompanyName || !trimmedPicName || !trimmedEmail) {
      alert("Semua kolom wajib diisi dan tidak boleh hanya berisi spasi kosong!");
      setIsLoading(false);
      return;
    }

    // 3. VALIDASI KETAT: Pastikan format email benar-benar valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      alert("Format email tidak valid! Pastikan tidak ada spasi dan formatnya benar (contoh: budi@domain.com).");
      setIsLoading(false);
      return;
    }

    // Pastikan mengirim ID dari object client
    const clientId = client?.id;

    // Panggil fungsi Server Action updateClient dengan data yang sudah bersih
    const result = await updateClient(clientId, {
      companyName: trimmedCompanyName,
      picName: trimmedPicName,
      email: trimmedEmail,
      status
    });

    setIsLoading(false);

    if (result.success) {
      if (onSuccess) {
        onSuccess(); // Panggil notifikasi tanpa jeda
      }
      
      setSubmitStatus('success');
      setTimeout(() => {
        handleClose(true);
      }, 1500);
    } else {
      alert("Error: " + result.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={submitStatus === 'idle' ? () => handleClose(false) : undefined}
        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden z-10"
      >
        <AnimatePresence mode="wait">
          {submitStatus === 'idle' && (
            <motion.div key="form-view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-[#011D58]/10 dark:bg-[#FF9F03]/10 text-[#011D58] dark:text-[#FF9F03] rounded-xl shadow-inner">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Data Klien</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Perbarui informasi perusahaan & PIC.</p>
                  </div>
                </div>
                <button onClick={() => handleClose()} className="text-slate-400 hover:text-[#FA4D09] bg-slate-200/50 dark:bg-slate-800 p-2 rounded-xl transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Nama Perusahaan *</label>
                      <input 
                        type="text" 
                        required 
                        value={companyName} 
                        onChange={(e) => setCompanyName(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl p-3 outline-none focus:ring-[#FC7A0B] focus:border-[#FC7A0B]" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Nama PIC *</label>
                      <input 
                        type="text" 
                        required 
                        value={picName} 
                        onChange={(e) => setPicName(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl p-3 outline-none focus:ring-[#FC7A0B] focus:border-[#FC7A0B]" 
                      />
                    </div>
                    <div>
                      {/* LABEL DIUPDATE: Menambahkan tanda * karena ini wajib */}
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Kontak *</label>
                      <input 
                        type="email" 
                        required // <-- Ditambahkan wajib isi
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl p-3 outline-none focus:ring-[#FC7A0B] focus:border-[#FC7A0B]" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Status *</label>
                      <select 
                        value={status} 
                        onChange={(e) => setStatus(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl p-3 outline-none focus:ring-[#FC7A0B] focus:border-[#FC7A0B] cursor-pointer"
                      >
                        <option value="Active">Aktif</option>
                        <option value="Inactive">Tidak Aktif</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end gap-3">
                  <button type="button" onClick={() => handleClose()} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors hover:bg-slate-200 dark:hover:bg-slate-700">
                    Batal
                  </button>
                  <button type="submit" disabled={isLoading} className="px-5 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-70 shadow-lg shadow-[#011D58]/20">
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {submitStatus === 'success' && (
            <motion.div key="success-view" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-inner border border-emerald-200 dark:border-emerald-500/20">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Perubahan Disimpan!</h3>
              <p className="text-sm text-slate-500 mb-8">Data klien telah berhasil diperbarui di database.</p>
              <button onClick={() => handleClose()} className="px-8 py-3 bg-[#011D58] hover:bg-[#011D58]/90 transition-colors shadow-lg shadow-[#011D58]/20 text-white text-sm font-bold rounded-xl">
                Selesai
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}