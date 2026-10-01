"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/actions/clientActions"; 

type Props = {
  isOpen: boolean;
  onClose: (isSuccess?: boolean) => void;
  onSuccess?: () => void; 
};

// Tipe data untuk menyimpan pesan error masing-masing field
type FormErrors = {
  companyName?: string;
  picName?: string;
  email?: string;
  phone?: string;
  general?: string;
};

export default function AddClientModal({ isOpen, onClose, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success'>('idle');
  
  const [errors, setErrors] = useState<FormErrors>({});

  const handleClose = (isSuccess = false) => {
    onClose(isSuccess);
    setTimeout(() => {
      setSubmitStatus('idle');
      setIsLoading(false);
      setErrors({}); 
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({}); 

    const formData = new FormData(e.currentTarget);
    
    const companyName = (formData.get("companyName") as string || "").trim();
    const picName = (formData.get("picName") as string || "").trim();
    const email = (formData.get("email") as string || "").trim();
    const rawPhone = (formData.get("phone") as string || "").trim();
    const status = (formData.get("status") as string) || "Active";

    let newErrors: FormErrors = {};
    const cleanPhone = rawPhone.replace(/\D/g, ''); // Ambil angkanya saja untuk divalidasi

    // Logika Validasi Sekuensial (Muncul Satu per Satu)
    if (!companyName) {
      newErrors.companyName = "Nama perusahaan wajib diisi.";
    } else if (!picName) {
      newErrors.picName = "Nama PIC wajib diisi.";
    } else if (!email) {
      newErrors.email = "Email kontak wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Format email tidak valid (contoh: nama@domain.com).";
    } else if (!rawPhone) {
      newErrors.phone = "No. WhatsApp wajib diisi.";
    } else if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      newErrors.phone = "Nomor harus berupa angka (10-15 digit).";
    }

    // Jika ada error (1 error saja yang tertangkap), jangan lanjut submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Jika semua lolos, mulai proses submit
    setIsLoading(true);

    const data = {
      companyName,
      picName,
      email,
      phone: cleanPhone,
      status,
    };

    const result = await createClient(data);

    setIsLoading(false);

    if (result.success) {
      onSuccess?.(); 
      setSubmitStatus('success');
      setTimeout(() => {
        handleClose(true);
      }, 1500); 
    } else {
      setErrors({ general: result.message || "Gagal menyimpan klien baru." });
    }
  };

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
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tambah Klien Baru</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Registrasi data perusahaan, PIC, dan nomor WhatsApp.</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => handleClose(false)}
                  className="text-slate-400 hover:text-[#FA4D09] bg-slate-200/50 dark:bg-slate-800 p-2 rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} noValidate>
                <div className="p-6 space-y-5">
                  
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
                        name="companyName" 
                        type="text" 
                        placeholder="Contoh: PT. SULO Teknologi" 
                        onChange={() => clearError('companyName')}
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
                        name="picName" 
                        type="text" 
                        placeholder="Contoh: Budi Santoso" 
                        onChange={() => clearError('picName')}
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
                      <input 
                        name="email" 
                        type="text" 
                        placeholder="budi@perusahaan.com" 
                        onChange={() => clearError('email')}
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
                      <input 
                        name="phone" 
                        type="text" 
                        placeholder="Contoh: 081234567890" 
                        onChange={() => clearError('phone')}
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
                      name="status"
                      defaultValue="Active"
                      className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl p-3 outline-none focus:ring-[#FC7A0B] focus:border-[#FC7A0B] cursor-pointer"
                    >
                      <option value="Active">Active (Klien Aktif)</option>
                      <option value="Prospek">Prospek (Calon Klien)</option>
                      <option value="Internal">Internal</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => handleClose(false)} 
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
                      "Simpan Klien"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {submitStatus === 'success' && (
            <motion.div
              key="success-view"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, type: 'spring', bounce: 0.4 }}
              className="p-10 flex flex-col items-center justify-center text-center min-h-[400px] relative overflow-hidden"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-inner border border-emerald-200 dark:border-emerald-500/20">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="relative z-10 text-2xl font-black text-slate-900 dark:text-white mb-2">Klien Berhasil Disimpan!</h3>
              <p className="relative z-10 text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                Data klien beserta kontak WhatsApp PIC telah berhasil ditambahkan.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}