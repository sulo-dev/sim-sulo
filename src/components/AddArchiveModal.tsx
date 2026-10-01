"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createArchive } from "@/actions/archiveActions";

type WebsiteDropdown = { id: number; name: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  websites: WebsiteDropdown[];
  onSuccess: () => void;
  showToast?: (message: string, type: "success" | "error") => void;
};

type FieldKey = "title" | "category" | "websiteId" | "file";

export default function AddArchiveModal({
  isOpen,
  onClose,
  websites,
  onSuccess,
  showToast,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success">("idle");

  // State Form Input
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Legalitas PT");
  const [websiteId, setWebsiteId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Penanganan Validasi Inline 1 per 1
  const [fieldError, setFieldError] = useState<{
    field: FieldKey | null;
    message: string | null;
  }>({
    field: null,
    message: null,
  });

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSubmitStatus("idle");
      setIsLoading(false);
      setTitle("");
      setCategory("Legalitas PT");
      setWebsiteId("");
      setFile(null);
      setFieldError({ field: null, message: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
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

    const trimmedTitle = title.trim();

    // ==========================================
    // VALIDASI SEKUANSIAL (1 PER 1)
    // ==========================================

    // 1. Validasi Judul Dokumen
    if (!trimmedTitle) {
      setFieldError({
        field: "title",
        message: "Judul dokumen wajib diisi!",
      });
      return;
    }

    // 2. Validasi Kategori Folder
    if (!category) {
      setFieldError({
        field: "category",
        message: "Silakan pilih kategori folder arsip!",
      });
      return;
    }

    // 3. Validasi Proyek Terkait (Kondisional)
    if (category === "Dokumen Proyek" && !websiteId) {
      setFieldError({
        field: "websiteId",
        message: "Silakan pilih proyek / klien terkait!",
      });
      return;
    }

    // 4. Validasi File Dokumen
    if (!file) {
      setFieldError({
        field: "file",
        message: "File dokumen wajib diunggah!",
      });
      return;
    }

    // Proses Pengiriman Data
    setIsLoading(true);

    const formData = new FormData();
    formData.append("title", trimmedTitle);
    formData.append("category", category);
    formData.append("uploadedBy", "Admin SULO");
    if (category === "Dokumen Proyek" && websiteId) {
      formData.append("websiteId", websiteId);
    }
    formData.append("file", file);

    const res = await createArchive(formData);

    if (res.success) {
      setSubmitStatus("success");
      if (showToast) showToast("Dokumen arsip berhasil diunggah!", "success");

      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 1500);
    } else {
      setIsLoading(false);
      const errMsg = res.message || "Gagal mengunggah dokumen ke database server.";
      setFieldError({
        field: "title",
        message: errMsg,
      });
      if (showToast) showToast(errMsg, "error");
    }
  };

  // Helper kelas CSS untuk input/select (normal vs error)
  const getInputClasses = (fieldName: FieldKey) => {
    const base =
      "w-full text-sm rounded-xl block p-3 outline-none transition-all shadow-sm dark:shadow-none ";
    if (fieldError.field === fieldName) {
      return (
        base +
        "bg-slate-50 dark:bg-slate-950/50 border border-rose-500 dark:border-rose-500/80 ring-2 ring-rose-500/20"
      );
    }
    return (
      base +
      "bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B]"
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={submitStatus === "idle" && !isLoading ? handleClose : undefined}
        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer"
      />

      {/* Konten Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
      >
        <AnimatePresence mode="wait">
          {submitStatus === "idle" && (
            <motion.div
              key="form-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full overflow-hidden"
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#011D58]/10 dark:bg-[#FF9F03]/10 text-[#011D58] dark:text-[#FF9F03] rounded-xl shadow-inner">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Unggah Dokumen Baru</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Tambah arsip legalitas, SOP, atau dokumen proyek.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="text-slate-400 hover:text-rose-500 bg-slate-200/50 dark:bg-slate-800 p-2 rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} noValidate className="flex-1 flex flex-col overflow-hidden">
                <div className="p-6 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
                  
                  {/* Field 1: Judul Dokumen */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Judul Dokumen <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        clearFieldError("title");
                      }}
                      placeholder="Contoh: NPWP Perusahaan 2026"
                      className={getInputClasses("title")}
                    />
                    <AnimatePresence>
                      {fieldError.field === "title" && (
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

                  {/* Field 2: Kategori Folder */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Kategori Folder <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCategory(val);
                        if (val !== "Dokumen Proyek") setWebsiteId("");
                        clearFieldError("category");
                      }}
                      className={`${getInputClasses("category")} cursor-pointer`}
                    >
                      <option value="Legalitas PT">Legalitas PT</option>
                      <option value="SOP Perusahaan">SOP Perusahaan</option>
                      <option value="Dokumen Proyek">Dokumen Proyek</option>
                      <option value="Tender & Penawaran">Tender & Penawaran</option>
                    </select>
                    <AnimatePresence>
                      {fieldError.field === "category" && (
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

                  {/* Field 3: Proyek Terkait (Kondisional) */}
                  <AnimatePresence>
                    {category === "Dokumen Proyek" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 mt-1">
                          Pilih Proyek / Klien <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={websiteId}
                          onChange={(e) => {
                            setWebsiteId(e.target.value);
                            clearFieldError("websiteId");
                          }}
                          className={`${getInputClasses("websiteId")} cursor-pointer`}
                        >
                          <option value="">-- Hubungkan dengan Proyek --</option>
                          {websites.map((web) => (
                            <option key={web.id} value={web.id}>
                              {web.name}
                            </option>
                          ))}
                        </select>
                        <AnimatePresence>
                          {fieldError.field === "websiteId" && (
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
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Field 4: Custom File Upload Box */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      File Dokumen <span className="text-rose-500">*</span>
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                        fieldError.field === "file"
                          ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 ring-2 ring-rose-500/20"
                          : file
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10"
                          : "border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-900"
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => {
                          setFile(e.target.files?.[0] || null);
                          clearFieldError("file");
                        }}
                        className="hidden"
                      />

                      {file ? (
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-2 shadow-inner border border-emerald-200 dark:border-emerald-500/20">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate w-full px-4">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="text-xs font-semibold text-rose-500 hover:text-rose-600 mt-2 hover:underline"
                          >
                            Ganti File
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-slate-400">
                          <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            Klik untuk memilih file dokumen
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            PDF, DOCX, XLSX, PNG, atau JPG (Maks. 10MB)
                          </p>
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {fieldError.field === "file" && (
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

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors"
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
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Mengunggah...
                      </>
                    ) : (
                      "Simpan Dokumen"
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
              className="p-10 flex flex-col items-center justify-center text-center min-h-[380px] relative overflow-hidden"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-inner border border-emerald-200 dark:border-emerald-500/20">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="relative z-10 text-2xl font-black text-slate-900 dark:text-white mb-2">
                Dokumen Berhasil Disimpan!
              </h3>
              <p className="relative z-10 text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                Arsip dokumen baru telah tersimpan dengan aman di dalam database SULO-MIS.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}