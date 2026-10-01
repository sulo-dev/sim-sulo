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

type FieldKey = "title" | "websiteId" | "priority" | "description";

export default function AddTicketModal({ isOpen, onClose, websites, onSuccess, showToast }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success">("idle");

  // State Form Input
  const [title, setTitle] = useState("");
  const [websiteId, setWebsiteId] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");

  // State Penanganan Validasi Inline 1 per 1
  const [fieldError, setFieldError] = useState<{ field: FieldKey | null; message: string | null }>({
    field: null,
    message: null,
  });

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSubmitStatus("idle");
      setIsLoading(false);
      setTitle("");
      setWebsiteId("");
      setPriority("Medium");
      setDescription("");
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

    // 1. Bersihkan input dari spasi berlebih
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    // ==========================================
    // VALIDASI SEKUANSIAL (1 PER 1)
    // ==========================================

    // Check 1: Judul Masalah
    if (!trimmedTitle) {
      setFieldError({
        field: "title",
        message: "Judul masalah wajib diisi dan tidak boleh hanya berisi spasi!",
      });
      return;
    }

    // Check 2: Proyek Terkait
    if (!websiteId) {
      setFieldError({
        field: "websiteId",
        message: "Silakan pilih proyek / website terkait terlebih dahulu!",
      });
      return;
    }

    // Check 3: Prioritas
    if (!priority) {
      setFieldError({
        field: "priority",
        message: "Silakan pilih tingkat prioritas tiket!",
      });
      return;
    }

    // Check 4: Deskripsi Detail
    if (!trimmedDescription) {
      setFieldError({
        field: "description",
        message: "Deskripsi detail masalah wajib diisi!",
      });
      return;
    }

    // Proses Pengiriman
    setIsLoading(true);
    const today = toInputDateFormat(new Date().toISOString());

    const ticketData = {
      title: trimmedTitle,
      websiteId: Number(websiteId),
      priority,
      status: "Open", // Default status tiket baru
      reportedDate: today,
      description: trimmedDescription,
    };

    const res = await createTicket(ticketData);

    if (res.success) {
      setSubmitStatus("success");
      if (showToast) showToast("Tiket baru berhasil dibuat!", "success");
      
      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 1500);
    } else {
      setIsLoading(false);
      const errMsg = res.message || "Gagal membuat tiket baru di database server.";
      setFieldError({
        field: "title",
        message: errMsg,
      });
      if (showToast) showToast(errMsg, "error");
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
        onClick={submitStatus === "idle" && !isLoading ? handleClose : undefined}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Buat Tiket Baru</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Laporkan bug, masalah, atau permintaan fitur.</p>
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
                  {/* Field 1: Judul Masalah */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Judul Masalah <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        clearFieldError("title");
                      }}
                      placeholder="Contoh: Gagal export laporan PDF di halaman Keuangan"
                      className={`w-full bg-slate-50 dark:bg-slate-950/50 border text-slate-900 dark:text-slate-200 text-sm rounded-xl block p-3 outline-none transition-all shadow-sm dark:shadow-none ${
                        fieldError.field === "title"
                          ? "border-rose-500 dark:border-rose-500/80 ring-2 ring-rose-500/20"
                          : "border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B]"
                      }`}
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

                  {/* Field 2 & 3: Proyek & Prioritas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Proyek Terkait */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Proyek Terkait <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={websiteId}
                        onChange={(e) => {
                          setWebsiteId(e.target.value);
                          clearFieldError("websiteId");
                        }}
                        className={`w-full bg-slate-50 dark:bg-slate-950/50 border text-slate-900 dark:text-slate-200 text-sm rounded-xl block p-3 outline-none transition-all shadow-sm dark:shadow-none cursor-pointer ${
                          fieldError.field === "websiteId"
                            ? "border-rose-500 dark:border-rose-500/80 ring-2 ring-rose-500/20"
                            : "border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B]"
                        }`}
                      >
                        <option value="">-- Pilih Website / Proyek --</option>
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
                    </div>

                    {/* Prioritas */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Prioritas <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => {
                          setPriority(e.target.value);
                          clearFieldError("priority");
                        }}
                        className={`w-full bg-slate-50 dark:bg-slate-950/50 border text-slate-900 dark:text-slate-200 text-sm rounded-xl block p-3 outline-none transition-all shadow-sm dark:shadow-none cursor-pointer ${
                          fieldError.field === "priority"
                            ? "border-rose-500 dark:border-rose-500/80 ring-2 ring-rose-500/20"
                            : "border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B]"
                        }`}
                      >
                        <option value="Low">Low (Rendah)</option>
                        <option value="Medium">Medium (Sedang)</option>
                        <option value="High">High (Tinggi / Mendesak)</option>
                      </select>
                      <AnimatePresence>
                        {fieldError.field === "priority" && (
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

                  {/* Field 4: Deskripsi Detail */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Deskripsi Detail <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        clearFieldError("description");
                      }}
                      placeholder="Jelaskan langkah-langkah untuk mereproduksi masalah atau rincian fitur yang diminta..."
                      className={`w-full bg-slate-50 dark:bg-slate-950/50 border text-slate-900 dark:text-slate-200 text-sm rounded-xl block p-3 outline-none transition-all resize-none shadow-sm dark:shadow-none ${
                        fieldError.field === "description"
                          ? "border-rose-500 dark:border-rose-500/80 ring-2 ring-rose-500/20"
                          : "border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B]"
                      }`}
                    />
                    <AnimatePresence>
                      {fieldError.field === "description" && (
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
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Menyimpan...
                      </>
                    ) : (
                      "Kirim Tiket"
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="relative z-10 text-2xl font-black text-slate-900 dark:text-white mb-2">Tiket Dibuat!</h3>
              <p className="relative z-10 text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                Laporan masalah berhasil dicatat dan akan segera diproses oleh tim terkait.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}