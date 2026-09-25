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

export default function EditTicketModal({ isOpen, onClose, ticket, onSuccess, showToast }: EditTicketModalProps) {
  const [title, setTitle] = useState(""); 
  const [status, setStatus] = useState("Open");
  const [priority, setPriority] = useState("Medium"); 
  const [description, setDescription] = useState(""); 
  const [commentText, setCommentText] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false); 

  useEffect(() => {
    if (ticket && isOpen) {
      setTitle(ticket.title || ""); 
      setStatus(ticket.status);
      setPriority(ticket.priority);
      setDescription(ticket.description || ""); 
      setCommentText("");
      setConfirmDelete(false); 
    }
  }, [ticket, isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    
    // 1. Bersihkan semua input dari spasi berlebih
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedComment = commentText.trim();

    // 2. VALIDASI KETAT: Judul tidak boleh kosong/hanya spasi
    if (!trimmedTitle) {
      showToast("Judul masalah wajib diisi dan tidak boleh hanya spasi kosong!", "error");
      setIsSaving(false);
      return;
    }

    // 3. VALIDASI KETAT: Deskripsi utama atau Komentar tidak boleh benar-benar kosong
    if (!trimmedDescription && !trimmedComment) {
      showToast("Deskripsi masalah tidak boleh kosong!", "error");
      setIsSaving(false);
      return;
    }

    // 4. Susun deskripsi akhir
    let finalDescription = trimmedDescription;

    if (trimmedComment) {
      const timestamp = new Date().toLocaleString("id-ID", { 
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
      });
      
      if (!finalDescription) {
        finalDescription = `--- [Update: ${timestamp}] ---\n${trimmedComment}`;
      } else {
        finalDescription = `${finalDescription}\n\n--- [Update: ${timestamp}] ---\n${trimmedComment}`;
      }
    }

    // 5. Kirim data yang sudah dibersihkan ke Server Action
    const res = await updateTicket(ticket.id, {
      ...ticket,
      title: trimmedTitle,
      status: status,
      priority: priority, 
      description: finalDescription
    });

    setIsSaving(false);
    if (res.success) {
      showToast("Tiket berhasil diperbarui!", "success"); 
      onSuccess();
    } else {
      showToast("Gagal memperbarui tiket: " + res.message, "error"); 
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer" />

      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }} className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-[#011D58]/10 dark:bg-[#FF9F03]/10 text-[#011D58] dark:text-[#FF9F03] rounded-xl shadow-inner font-mono text-xs font-bold uppercase">{ticket.id}</span>
            <div>
              {/* Judul di header mengikuti input judul dengan fallback aman */}
              <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{title.trim() || "Tiket Tanpa Judul"}</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Dilaporkan pada {ticket.reportedDate || ticket.date}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-[#FA4D09] bg-slate-200/50 dark:bg-slate-800 p-2 rounded-xl transition-colors shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body Konten */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          {/* INPUT EDIT JUDUL */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Judul Masalah *</label>
            <input 
              type="text" 
              required
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Masukkan judul tiket masalah..." 
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-base font-bold rounded-2xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3.5 outline-none transition-colors shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
             <div className="col-span-2 sm:col-span-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Proyek Terkait</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{ticket.websiteName || ticket.website}</p>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Deskripsi Masalah *</h4>
            <textarea 
              rows={5} 
              required
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Tuliskan detail masalah di sini..." 
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-2xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-4 outline-none transition-colors shadow-sm resize-y leading-relaxed"
            ></textarea>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Aktivitas & Pembaruan</h4>
            <div className="space-y-4 pl-2 border-l-2 border-slate-100 dark:border-slate-800 ml-2">
              <div className="relative pl-5 mt-3">
                <div className="absolute w-3 h-3 bg-[#011D58] dark:bg-[#FF9F03] rounded-full -left-[22px] top-1.5 border-4 border-white dark:border-slate-900"></div>
                <textarea 
                  rows={2} 
                  value={commentText} 
                  onChange={(e) => setCommentText(e.target.value)} 
                  placeholder="Ketik pembaruan status atau log pengerjaan di sini..." 
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3 outline-none transition-colors shadow-sm resize-none"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3 outline-none cursor-pointer shadow-sm">
              <option value="Open">Status: Open</option>
              <option value="In Progress">Status: Fixing</option>
              <option value="Closed">Status: Resolved</option>
            </select>
            
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3 outline-none cursor-pointer shadow-sm">
              <option value="High">Prioritas: High</option>
              <option value="Medium">Prioritas: Medium</option>
              <option value="Low">Prioritas: Low</option>
            </select>

            {confirmDelete ? (
              <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-4 duration-300">
                <button type="button" onClick={handleDelete} disabled={isDeleting} className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase rounded-xl transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50">
                  {isDeleting ? "Proses..." : "Yakin Hapus?"}
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} disabled={isDeleting} className="px-3 py-3 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold uppercase rounded-xl transition-colors">
                  Batal
                </button>
              </div>
            ) : (
              <button type="button" onClick={handleDelete} className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 text-xs font-bold uppercase rounded-xl transition-colors border border-red-100 dark:border-red-500/20">
                Hapus
              </button>
            )}
          </div>

          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button onClick={onClose} className="px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors">Tutup</button>
            <button onClick={handleSave} disabled={isSaving} className="px-5 py-3 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-[#011D58]/20 flex items-center gap-2 disabled:opacity-70">
              {isSaving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
        
      </motion.div>
    </div>
  );
}