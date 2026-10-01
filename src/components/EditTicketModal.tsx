"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateTicket, deleteTicket } from "@/actions/ticketActions";

interface EditTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: any;
  onSuccess: () => void;
  showToast: (message: string, type: "success" | "error") => void;
}

type FieldKey = "title" | "description";

export default function EditTicketModal({
  isOpen,
  onClose,
  ticket,
  onSuccess,
  showToast,
}: EditTicketModalProps) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("Open");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");
  const [commentText, setCommentText] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // State Penanganan Validasi Inline 1 per 1
  const [fieldError, setFieldError] = useState<{
    field: FieldKey | null;
    message: string | null;
  }>({
    field: null,
    message: null,
  });

  useEffect(() => {
    if (ticket && isOpen) {
      setTitle(ticket.title || "");
      setStatus(ticket.status || "Open");
      setPriority(ticket.priority || "Medium");
      setDescription(ticket.description || "");
      setCommentText("");
      setConfirmDelete(false);
      setFieldError({ field: null, message: null });
    }
  }, [ticket, isOpen]);

  const clearFieldError = (fieldName: FieldKey) => {
    if (fieldError.field === fieldName) {
      setFieldError({ field: null, message: null });
    }
  };

  const handleSave = async () => {
    setFieldError({ field: null, message: null });

    // 1. Bersihkan semua input dari spasi berlebih
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedComment = commentText.trim();

    // ==========================================
    // VALIDASI SEKUANSIAL (1 PER 1)
    // ==========================================

    // Check 1: Judul Masalah
    if (!trimmedTitle) {
      setFieldError({
        field: "title",
        message: "Judul masalah wajib diisi dan tidak boleh hanya berupa spasi!",
      });
      return;
    }

    // Check 2: Deskripsi Masalah
    if (!trimmedDescription) {
      setFieldError({
        field: "description",
        message: "Deskripsi detail masalah tidak boleh kosong!",
      });
      return;
    }

    setIsSaving(true);

    // 3. Susun deskripsi akhir jika ada tambahan log aktivitas/komentar
    let finalDescription = trimmedDescription;

    if (trimmedComment) {
      const timestamp = new Date().toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      if (!finalDescription) {
        finalDescription = `--- [Update: ${timestamp}] ---\n${trimmedComment}`;
      } else {
        finalDescription = `${finalDescription}\n\n--- [Update: ${timestamp}] ---\n${trimmedComment}`;
      }
    }

    // 4. Kirim data yang sudah dibersihkan ke Server Action
    const res = await updateTicket(ticket.id, {
      ...ticket,
      title: trimmedTitle,
      status: status,
      priority: priority,
      description: finalDescription,
    });

    setIsSaving(false);

    if (res.success) {
      showToast("Tiket berhasil diperbarui!", "success");
      onSuccess();
    } else {
      const errMsg = res.message || "Gagal memperbarui tiket di database server.";
      setFieldError({
        field: "title",
        message: errMsg,
      });
      showToast(errMsg, "error");
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    const res = await deleteTicket(ticket.id);
    setIsDeleting(false);

    if (res.success) {
      showToast("Tiket berhasil dihapus secara permanen.", "success");
      onSuccess();
    } else {
      showToast("Gagal menghapus tiket: " + res.message, "error");
      setConfirmDelete(false);
    }
  };

  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={!isSaving && !isDeleting ? onClose : undefined}
        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer"
      />

      {/* Konten Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-[#011D58]/10 dark:bg-[#FF9F03]/10 text-[#011D58] dark:text-[#FF9F03] rounded-xl shadow-inner font-mono text-xs font-bold uppercase">
              {ticket.id}
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                {title.trim() || "Tiket Tanpa Judul"}
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Dilaporkan pada {ticket.reportedDate || ticket.date || "-"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-[#FA4D09] bg-slate-200/50 dark:bg-slate-800 p-2 rounded-xl transition-colors shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body Konten */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {/* INPUT EDIT JUDUL */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Judul Masalah <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                clearFieldError("title");
              }}
              placeholder="Masukkan judul tiket masalah..."
              className={`w-full bg-white dark:bg-slate-900 border text-slate-900 dark:text-slate-200 text-base font-bold rounded-2xl block p-3.5 outline-none transition-all shadow-sm ${
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

          {/* INFO PROYEK */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
            <div className="col-span-2 sm:col-span-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Proyek Terkait
              </p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {ticket.websiteName || ticket.website || "Tidak Diketahui"}
              </p>
            </div>
          </div>

          {/* INPUT DESKRIPSI DETAIL */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Deskripsi Masalah <span className="text-rose-500">*</span>
            </h4>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                clearFieldError("description");
              }}
              placeholder="Tuliskan detail masalah di sini..."
              className={`w-full bg-white dark:bg-slate-900 border text-slate-900 dark:text-slate-200 text-sm rounded-2xl block p-4 outline-none transition-all shadow-sm resize-y leading-relaxed ${
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

          {/* LOG PENGERJAAN / KOMENTAR */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Aktivitas & Log Pembaruan
            </h4>
            <div className="space-y-4 pl-2 border-l-2 border-slate-100 dark:border-slate-800 ml-2">
              <div className="relative pl-5 mt-3">
                <div className="absolute w-3 h-3 bg-[#011D58] dark:bg-[#FF9F03] rounded-full -left-[22px] top-1.5 border-4 border-white dark:border-slate-900" />
                <textarea
                  rows={2}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Ketik pembaruan status atau log pengerjaan di sini..."
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B] block p-3 outline-none transition-colors shadow-sm resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Status Select */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase rounded-xl focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B] block p-3 outline-none cursor-pointer shadow-sm"
            >
              <option value="Open">Status: Open</option>
              <option value="In Progress">Status: Fixing</option>
              <option value="Closed">Status: Resolved</option>
            </select>

            {/* Priority Select */}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase rounded-xl focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B] block p-3 outline-none cursor-pointer shadow-sm"
            >
              <option value="High">Prioritas: High</option>
              <option value="Medium">Prioritas: Medium</option>
              <option value="Low">Prioritas: Low</option>
            </select>

            {/* Tombol Hapus / Konfirmasi Hapus */}
            {confirmDelete ? (
              <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-4 duration-300">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase rounded-xl transition-colors shadow-lg shadow-rose-600/20 disabled:opacity-50"
                >
                  {isDeleting ? "Proses..." : "Yakin Hapus?"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={isDeleting}
                  className="px-3 py-3 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold uppercase rounded-xl transition-colors"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 text-xs font-bold uppercase rounded-xl transition-colors border border-rose-100 dark:border-rose-500/20"
              >
                Hapus
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving || isDeleting}
              className="px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isDeleting}
              className="px-5 py-3 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-[#011D58]/20 flex items-center gap-2 disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}