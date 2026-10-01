"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateClient } from "@/actions/clientActions"; 

type Props = {
  isOpen: boolean;
  onClose: (isSuccess?: boolean) => void;
  onSuccess?: () => void; 
  client: any; 
};

// Tipe data untuk menyimpan pesan error masing-masing field
type FormErrors = {
  companyName?: string;
  picName?: string;
  email?: string;
  phone?: string;
  general?: string;
};

export default function EditClientModal({ isOpen, onClose, onSuccess, client }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success'>('idle');

  // State nilai input form
  const [companyName, setCompanyName] = useState(client?.companyName || client?.company_name || "");
  const [picName, setPicName] = useState(client?.picName || client?.pic_name || "");
  const [email, setEmail] = useState(client?.email || "");
  const [phone, setPhone] = useState(client?.phone || ""); 
  const [status, setStatus] = useState(client?.status || "Active"); 

  // State untuk menyimpan pesan error inline
  const [errors, setErrors] = useState<FormErrors>({});

  const handleClose = (isSuccess = false) => {
    onClose(isSuccess);
    setTimeout(() => {
      setSubmitStatus('idle');
      setIsLoading(false);
      setErrors({}); // Reset error saat modal ditutup
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Reset error sebelum divalidasi ulang
    
    // 1. Bersihkan input dari spasi berlebih
    const trimmedCompanyName = companyName.trim();
    const trimmedPicName = picName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    let newErrors: FormErrors = {};
    let cleanPhone = trimmedPhone.replace(/\D/g, ''); // Ambil angkanya saja

    // Logika Validasi Sekuensial (Muncul Satu per Satu)
    if (!trimmedCompanyName) {
      newErrors.companyName = "Nama perusahaan wajib diisi.";
    } else if (!trimmedPicName) {
      newErrors.picName = "Nama PIC wajib diisi.";
    } else if (!trimmedEmail) {
      newErrors.email = "Email kontak wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = "Format email tidak valid (contoh: nama@domain.com).";
    } else if (!trimmedPhone) {
      newErrors.phone = "No. WhatsApp wajib diisi.";
    } else if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      newErrors.phone = "Nomor harus berupa angka (10-15 digit).";
    }

    // Jika ada error (1 error tertangkap), hentikan proses
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Jika lolos validasi, mulai loading
    setIsLoading(true);
    const clientId = client?.id;

    const result = await updateClient(clientId, {
      companyName: trimmedCompanyName,
      picName: trimmedPicName,
      email: trimmedEmail,
      phone: cleanPhone,
      status
    });

    setIsLoading(false);

    if (result.success) {
      if (onSuccess) onSuccess(); 
      setSubmitStatus('success');
      setTimeout(() => {
        handleClose(true);
      }, 1500);
    } else {
      setErrors({ general: result.message || "Gagal memperbarui data klien." });
    }
  };

  // Fungsi untuk menghapus error saat user mulai mengetik ulang di field tersebut
  const clearError = (fieldName: keyof FormErrors) => {
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
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
        onClick={submitStatus === 'idle' ? () => handleClose(false) : undefined}
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
          {submitStatus === 'idle' && (
            <motion.div key="form-view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-[#011D58]/10 dark:bg-[#FF9F03]/10 text-[#011D58] dark:text-[#FF9F03] rounded-xl shadow-inner">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2-2H7a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Data Klien</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Perbarui informasi perusahaan, PIC, dan nomor WhatsApp.</p>
                  </div>
                </div>
                <button type="button" onClick={() => handleClose(false)} className="text-slate-400 hover:text-[#FA4D09] bg-slate-200/50 dark:bg-slate-800 p-2 rounded-xl transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Form dengan noValidate untuk matikan peringatan browser bawaan */}
              <form onSubmit={handleSubmit} noValidate>
                <div className="p-6 space-y-5">
                  
                  {/* General Error Banner (Jika gagal dari API) */}
                  {errors.general && (
                    <div className="p-3 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 rounded-xl text-sm font-bold border border-rose-200 dark:border-rose-500/20 flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      {errors.general}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Nama Perusahaan *</label>
                      <input 
                        type="text" 
                        value={companyName} 
                        onChange={(e) => {
                          setCompanyName(e.target.value);
                          clearError('companyName');
                        }} 
                        className={`w-full bg-slate-50 dark:bg-slate-950/50 border text-sm rounded-xl p-3 outline-none transition-colors shadow-sm dark:shadow-none ${
                          errors.companyName 
                            ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-rose-900' 
                            : 'border-slate-200 dark:border-slate-800 focus:border-[#FC7A0B] focus:ring-1 focus:ring-[#FC7A0B] text-slate-900 dark:text-slate-200'
                        }`} 
                      />
                      {errors.companyName && (
                        <p className="text-rose-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {errors.companyName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Nama PIC *</label>
                      <input 
                        type="text" 
                        value={picName} 
                        onChange={(e) => {
                          setPicName(e.target.value);
                          clearError('picName');
                        }} 
                        className={`w-full bg-slate-50 dark:bg-slate-950/50 border text-sm rounded-xl p-3 outline-none transition-colors shadow-sm dark:shadow-none ${
                          errors.picName 
                            ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-rose-900' 
                            : 'border-slate-200 dark:border-slate-800 focus:border-[#FC7A0B] focus:ring-1 focus:ring-[#FC7A0B] text-slate-900 dark:text-slate-200'
                        }`} 
                      />
                      {errors.picName && (
                        <p className="text-rose-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {errors.picName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Email Kontak *</label>
                      {/* Diubah jadi type="text" agar tidak memicu tooltip HTML5 */}
                      <input 
                        type="text" 
                        value={email} 
                        onChange={(e) => {
                          setEmail(e.target.value);
                          clearError('email');
                        }} 
                        className={`w-full bg-slate-50 dark:bg-slate-950/50 border text-sm rounded-xl p-3 outline-none transition-colors shadow-sm dark:shadow-none ${
                          errors.email 
                            ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-rose-900' 
                            : 'border-slate-200 dark:border-slate-800 focus:border-[#FC7A0B] focus:ring-1 focus:ring-[#FC7A0B] text-slate-900 dark:text-slate-200'
                        }`} 
                      />
                      {errors.email && (
                        <p className="text-rose-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">No. WhatsApp PIC *</label>
                      {/* Diubah jadi type="text" */}
                      <input 
                        type="text" 
                        value={phone} 
                        onChange={(e) => {
                          setPhone(e.target.value);
                          clearError('phone');
                        }} 
                        placeholder="081234567890"
                        className={`w-full bg-slate-50 dark:bg-slate-950/50 border text-sm rounded-xl p-3 outline-none transition-colors shadow-sm dark:shadow-none font-mono ${
                          errors.phone 
                            ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-rose-900' 
                            : 'border-slate-200 dark:border-slate-800 focus:border-[#FC7A0B] focus:ring-1 focus:ring-[#FC7A0B] text-slate-900 dark:text-slate-200'
                        }`} 
                      />
                      {errors.phone && (
                        <p className="text-rose-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Status Klien *</label>
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)} 
                      className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl p-3 outline-none focus:ring-[#FC7A0B] focus:border-[#FC7A0B] cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Prospek">Prospek</option>
                      <option value="Internal">Internal</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end gap-3">
                  <button type="button" onClick={() => handleClose(false)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors hover:bg-slate-200 dark:hover:bg-slate-700">
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

          {/* Animasi View Sukses */}
          {submitStatus === 'success' && (
            <motion.div key="success-view" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-inner border border-emerald-200 dark:border-emerald-500/20">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Perubahan Disimpan!</h3>
              <p className="text-sm text-slate-500 mb-8">Data klien telah berhasil diperbarui di database.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}