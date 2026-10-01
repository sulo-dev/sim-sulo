"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createWebsite } from "@/actions/websiteActions";

type ClientDropdown = {
  id: number;
  companyName: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  clients: ClientDropdown[];
};

type FieldKey = "name" | "clientId" | "status" | "techStack" | "productionUrl";

export default function AddWebsiteModal({ isOpen, onClose, onSuccess, clients }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success">("idle");
  
  // State untuk menangani validasi inline 1 per 1
  const [fieldError, setFieldError] = useState<{ field: FieldKey | null; message: string | null }>({
    field: null,
    message: null,
  });

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSubmitStatus("idle");
      setIsLoading(false);
      setFieldError({ field: null, message: null });
    }, 300);
  };

  const clearFieldError = (fieldName: FieldKey) => {
    if (fieldError.field === fieldName) {
      setFieldError({ field: null, message: null });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldError({ field: null, message: null });

    const formData = new FormData(e.currentTarget);

    // Ambil nilai dan bersihkan spasi
    const name = (formData.get("name") as string || "").trim();
    const clientId = (formData.get("clientId") as string || "").trim();
    const status = (formData.get("status") as string || "").trim();
    const techStack = (formData.get("techStack") as string || "").trim();
    const productionUrl = (formData.get("productionUrl") as string || "").trim();

    // ==========================================
    // VALIDASI SEKUANSIAL (1 PER 1)
    // ==========================================
    
    // 1. Validasi Nama Proyek
    if (!name) {
      setFieldError({
        field: "name",
        message: "Nama proyek wajib diisi dan tidak boleh hanya berisi spasi!",
      });
      return;
    }

    // 2. Validasi Klien
    if (!clientId) {
      setFieldError({
        field: "clientId",
        message: "Silakan pilih klien untuk proyek ini!",
      });
      return;
    }

    // 3. Validasi Status
    if (!status) {
      setFieldError({
        field: "status",
        message: "Silakan pilih status proyek!",
      });
      return;
    }

    // 4. Validasi Tech Stack
    if (!techStack) {
      setFieldError({
        field: "techStack",
        message: "Tech stack wajib diisi (Contoh: Next.js, Laravel)!",
      });
      return;
    }

    // 5. Validasi URL Production (Keberadaan)
    if (!productionUrl) {
      setFieldError({
        field: "productionUrl",
        message: "URL Production wajib diisi!",
      });
      return;
    }

    // 6. Validasi Format URL Production
    const urlRegex = /^(https?:\/\/)?([\w\d\-]+\.)+\w{2,}(\/.*)?$/i;
    if (!urlRegex.test(productionUrl)) {
      setFieldError({
        field: "productionUrl",
        message: "Format URL tidak valid! Gunakan format yang benar (contoh: https://namadomain.com).",
      });
      return;
    }

    // Proses pengiriman data jika semua validasi lolos
    setIsLoading(true);

    const cleanFormData = new FormData();
    cleanFormData.append("name", name);
    cleanFormData.append("clientId", clientId);
    cleanFormData.append("status", status);
    cleanFormData.append("techStack", techStack);
    cleanFormData.append("productionUrl", productionUrl);

    const res = await createWebsite(cleanFormData);

    if (res.success) {
      setSubmitStatus("success");
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 1500);
    } else {
      setIsLoading(false);
      setFieldError({
        field: "name",
        message: res.message || "Gagal menyimpan data ke database server.",
      });
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
        onClick={submitStatus === "idle" ? handleClose : undefined}
        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden z-10"
      >
        <AnimatePresence mode="wait">
          {submitStatus === "idle" && (
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
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tambah Proyek Website</h3>
                    <p className="text-xs text-slate-500 font-medium">Sistem Inventarisasi Web & Aplikasi SULO</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-slate-400 hover:text-[#FA4D09] bg-slate-200/50 dark:bg-slate-800 p-2 rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} noValidate>
                <div className="p-6 space-y-5">
                  {/* Field 1: Nama Proyek */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">
                      Nama Proyek / Website <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      onChange={() => clearFieldError("name")}
                      placeholder="Contoh: Portal Desa Digital"
                      className={`w-full bg-slate-50 dark:bg-slate-950/50 border text-sm rounded-xl block p-3 outline-none transition-all ${
                        fieldError.field === "name"
                          ? "border-rose-500 dark:border-rose-500/80 ring-2 ring-rose-500/20"
                          : "border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B]"
                      }`}
                    />
                    <AnimatePresence>
                      {fieldError.field === "name" && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-xs font-semibold text-rose-500 mt-1.5 flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {fieldError.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Field 2 & 3: Klien & Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Klien Dropdown */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">
                        Klien <span className="text-rose-500">*</span>
                      </label>
                      <select
                        name="clientId"
                        onChange={() => clearFieldError("clientId")}
                        className={`w-full bg-slate-50 dark:bg-slate-950/50 border text-sm rounded-xl block p-3 outline-none cursor-pointer transition-all ${
                          fieldError.field === "clientId"
                            ? "border-rose-500 dark:border-rose-500/80 ring-2 ring-rose-500/20"
                            : "border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B]"
                        }`}
                      >
                        <option value="">-- Pilih Klien --</option>
                        {clients &&
                          clients.map((client) => (
                            <option key={client.id} value={client.id}>
                              {client.companyName}
                            </option>
                          ))}
                      </select>
                      <AnimatePresence>
                        {fieldError.field === "clientId" && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-xs font-semibold text-rose-500 mt-1.5 flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {fieldError.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Status Dropdown */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">
                        Status <span className="text-rose-500">*</span>
                      </label>
                      <select
                        name="status"
                        onChange={() => clearFieldError("status")}
                        className={`w-full bg-slate-50 dark:bg-slate-950/50 border text-sm rounded-xl block p-3 outline-none cursor-pointer transition-all ${
                          fieldError.field === "status"
                            ? "border-rose-500 dark:border-rose-500/80 ring-2 ring-rose-500/20"
                            : "border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B]"
                        }`}
                      >
                        <option value="Active">Active</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Warranty">Warranty</option>
                        <option value="Internal">Internal</option>
                      </select>
                      <AnimatePresence>
                        {fieldError.field === "status" && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-xs font-semibold text-rose-500 mt-1.5 flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {fieldError.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Field 4 & 5: Tech Stack & Production URL */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Tech Stack */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">
                        Tech Stack <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="techStack"
                        onChange={() => clearFieldError("techStack")}
                        placeholder="Contoh: Next.js / Tailwind"
                        className={`w-full bg-slate-50 dark:bg-slate-950/50 border text-sm rounded-xl block p-3 outline-none transition-all ${
                          fieldError.field === "techStack"
                            ? "border-rose-500 dark:border-rose-500/80 ring-2 ring-rose-500/20"
                            : "border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B]"
                        }`}
                      />
                      <AnimatePresence>
                        {fieldError.field === "techStack" && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-xs font-semibold text-rose-500 mt-1.5 flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {fieldError.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Production URL */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">
                        URL Production <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="productionUrl"
                        onChange={() => clearFieldError("productionUrl")}
                        placeholder="https://namadomain.com"
                        className={`w-full bg-slate-50 dark:bg-slate-950/50 border text-sm rounded-xl block p-3 outline-none transition-all ${
                          fieldError.field === "productionUrl"
                            ? "border-rose-500 dark:border-rose-500/80 ring-2 ring-rose-500/20"
                            : "border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B]"
                        }`}
                      />
                      <AnimatePresence>
                        {fieldError.field === "productionUrl" && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-xs font-semibold text-rose-500 mt-1.5 flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {fieldError.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-[#011D58] hover:bg-[#022b82] text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-[#011D58]/20 transition-all disabled:opacity-70"
                  >
                    {isLoading ? "Menyimpan..." : "Simpan Website"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Success View State */}
          {submitStatus === "success" && (
            <motion.div
              key="success-view"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
              className="p-10 flex flex-col items-center justify-center text-center min-h-[400px] relative overflow-hidden"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-inner border border-emerald-200 dark:border-emerald-500/20">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="relative z-10 text-2xl font-black text-slate-900 dark:text-white mb-2">Berhasil Disimpan!</h3>
              <p className="relative z-10 text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                Informasi dan detail teknis proyek website berhasil disimpan ke dalam sistem SULO-MIS.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}