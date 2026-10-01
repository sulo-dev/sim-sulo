"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateWebsite } from "@/actions/websiteActions";

type ClientDropdown = {
  id: number;
  companyName: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  website: any;
  clients: ClientDropdown[];
};

type FieldKey = "projectName" | "clientId" | "status" | "techStack" | "url";

export default function EditWebsiteModal({ isOpen, onClose, onSuccess, website, clients }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success">("idle");

  // State nilai input form
  const [projectName, setProjectName] = useState("");
  const [clientId, setClientId] = useState("");
  const [techStack, setTechStack] = useState("");
  const [status, setStatus] = useState("Active");
  const [url, setUrl] = useState("");

  // State penanganan validasi inline 1 per 1
  const [fieldError, setFieldError] = useState<{ field: FieldKey | null; message: string | null }>({
    field: null,
    message: null,
  });

  // Sinkronisasi data awal setiap kali modal dibuka atau data website berubah
  useEffect(() => {
    if (website && isOpen) {
      setProjectName(website?.name || "");
      setClientId(String(website?.clientId || website?.client_id || ""));
      setTechStack(
        website?.stack || (website?.techStack ? website.techStack : website?.tech_stack || "")
      );
      setStatus(website?.status || "Active");
      setUrl(website?.productionUrl || website?.production_url || website?.url || "");
      setFieldError({ field: null, message: null });
    }
  }, [website, isOpen]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError({ field: null, message: null });

    // Bersihkan spasi berlebih
    const trimmedProjectName = projectName.trim();
    const trimmedTechStack = techStack.trim();
    const trimmedUrl = url.trim();

    // ==========================================
    // VALIDASI SEKUANSIAL (1 PER 1)
    // ==========================================

    // 1. Validasi Nama Proyek
    if (!trimmedProjectName) {
      setFieldError({
        field: "projectName",
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
    if (!trimmedTechStack) {
      setFieldError({
        field: "techStack",
        message: "Tech stack wajib diisi (Contoh: Next.js, Laravel)!",
      });
      return;
    }

    // 5. Validasi URL Production (Keberadaan)
    if (!trimmedUrl) {
      setFieldError({
        field: "url",
        message: "URL Production wajib diisi!",
      });
      return;
    }

    // 6. Validasi Format URL Production
    const urlRegex = /^(https?:\/\/)?([\w\d\-]+\.)+\w{2,}(\/.*)?$/i;
    if (!urlRegex.test(trimmedUrl)) {
      setFieldError({
        field: "url",
        message: "Format URL tidak valid! Gunakan format yang benar (contoh: https://namadomain.com).",
      });
      return;
    }

    // Proses pengiriman data jika semua validasi lolos
    setIsLoading(true);

    const res = await updateWebsite(website.id, {
      name: trimmedProjectName,
      clientId: Number(clientId),
      status: status,
      techStack: trimmedTechStack,
      productionUrl: trimmedUrl,
    });

    if (res.success) {
      setSubmitStatus("success");
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 1500);
    } else {
      setIsLoading(false);
      setFieldError({
        field: "projectName",
        message: res.message || "Gagal memperbarui proyek ke database server.",
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Proyek Website</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Perbarui informasi teknis dan status proyek.</p>
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
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Nama Proyek <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => {
                        setProjectName(e.target.value);
                        clearFieldError("projectName");
                      }}
                      placeholder="Contoh: Portal Desa Digital"
                      className={`w-full bg-slate-50 dark:bg-slate-950/50 border text-slate-900 dark:text-slate-200 text-sm rounded-xl block p-3 outline-none transition-all shadow-sm dark:shadow-none ${
                        fieldError.field === "projectName"
                          ? "border-rose-500 dark:border-rose-500/80 ring-2 ring-rose-500/20"
                          : "border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B]"
                      }`}
                    />
                    <AnimatePresence>
                      {fieldError.field === "projectName" && (
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
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Klien <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={clientId}
                        onChange={(e) => {
                          setClientId(e.target.value);
                          clearFieldError("clientId");
                        }}
                        className={`w-full bg-slate-50 dark:bg-slate-950/50 border text-slate-900 dark:text-slate-200 text-sm rounded-xl block p-3 outline-none cursor-pointer transition-all shadow-sm dark:shadow-none ${
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
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Status Proyek <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={status}
                        onChange={(e) => {
                          setStatus(e.target.value);
                          clearFieldError("status");
                        }}
                        className={`w-full bg-slate-50 dark:bg-slate-950/50 border text-slate-900 dark:text-slate-200 text-sm rounded-xl block p-3 outline-none cursor-pointer transition-all shadow-sm dark:shadow-none ${
                          fieldError.field === "status"
                            ? "border-rose-500 dark:border-rose-500/80 ring-2 ring-rose-500/20"
                            : "border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B]"
                        }`}
                      >
                        <option value="Active">Aktif (Active)</option>
                        <option value="Maintenance">Masa Garansi (Maintenance)</option>
                        <option value="Warranty">Warranty</option>
                        <option value="Internal">Internal</option>
                        <option value="Inactive">Tidak Aktif / Selesai</option>
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
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Tech Stack <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={techStack}
                        onChange={(e) => {
                          setTechStack(e.target.value);
                          clearFieldError("techStack");
                        }}
                        placeholder="Next.js, Tailwind..."
                        className={`w-full bg-slate-50 dark:bg-slate-950/50 border text-slate-900 dark:text-slate-200 text-sm rounded-xl block p-3 outline-none transition-all shadow-sm dark:shadow-none ${
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
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        URL Production <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => {
                          setUrl(e.target.value);
                          clearFieldError("url");
                        }}
                        placeholder="https://namaproyek.com"
                        className={`w-full bg-slate-50 dark:bg-slate-950/50 border text-slate-900 dark:text-slate-200 text-sm rounded-xl block p-3 outline-none transition-all shadow-sm dark:shadow-none ${
                          fieldError.field === "url"
                            ? "border-rose-500 dark:border-rose-500/80 ring-2 ring-rose-500/20"
                            : "border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B]"
                        }`}
                      />
                      <AnimatePresence>
                        {fieldError.field === "url" && (
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
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
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
                      "Simpan Perubahan"
                    )}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="relative z-10 text-2xl font-black text-slate-900 dark:text-white mb-2">Perubahan Disimpan!</h3>
              <p className="relative z-10 text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                Informasi dan detail teknis proyek website berhasil diperbarui ke dalam sistem.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}