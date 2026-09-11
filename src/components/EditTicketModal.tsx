"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface EditTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: any;
  onSave: (updatedStatus: string, comment: string) => void;
  onDelete: () => void;
}

export default function EditTicketModal({ isOpen, onClose, ticket, onSave, onDelete }: EditTicketModalProps) {
  if (!isOpen || !ticket) return null;

  const [status, setStatus] = useState(ticket.status);
  const [commentText, setCommentText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onSave(status, commentText);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer"
      />

      {/* Konten Modal Detail / Edit */}
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{ticket.title}</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Dilaporkan pada {ticket.date}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-[#FA4D09] bg-slate-200/50 dark:bg-slate-800 p-2 rounded-xl transition-colors shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body Konten (Scrollable) */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          {/* Meta Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Status</p>
              <span className={`px-2.5 py-1 inline-block rounded-md text-[10px] font-bold tracking-wider uppercase border ${
                status === 'Open' ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' :
                status === 'Fixing' ? 'bg-[#011D58]/10 text-[#011D58] dark:bg-[#011D58]/40 dark:text-[#FF9F03] border-[#011D58]/20' :
                'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
              }`}>
                {status}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Prioritas</p>
              <span className={`px-2.5 py-1 inline-flex items-center gap-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                ticket.priority === 'High' ? 'bg-[#FA4D09]/10 text-[#FA4D09] border-[#FA4D09]/20' :
                ticket.priority === 'Medium' ? 'bg-[#FF9F03]/10 text-[#FC7A0B] border-[#FF9F03]/20' :
                'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
              }`}>
                {ticket.priority === 'High' && <span className="w-1.5 h-1.5 rounded-full bg-[#FA4D09] animate-pulse"></span>}
                {ticket.priority}
              </span>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Proyek Terkait</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{ticket.website}</p>
            </div>
          </div>

          {/* Deskripsi Masalah */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">Deskripsi Masalah</h4>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>

          {/* Riwayat Pembaruan / Komentar */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">Aktivitas & Pembaruan</h4>
            <div className="space-y-4 pl-2 border-l-2 border-slate-100 dark:border-slate-800 ml-2">
              
              <div className="relative pl-5">
                <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-[22px] top-1 border-4 border-white dark:border-slate-900"></div>
                <p className="text-xs text-slate-400 mb-0.5">Hari ini, 09:30 AM • Oleh Admin</p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                  Tiket diterima dan sedang diinvestigasi oleh tim teknis.
                </div>
              </div>
              
              <div className="relative pl-5 mt-4">
                <div className="absolute w-3 h-3 bg-[#011D58] dark:bg-[#FF9F03] rounded-full -left-[22px] top-1.5 border-4 border-white dark:border-slate-900"></div>
                <textarea 
                  rows={2}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Ketik pembaruan status atau balasan di sini..." 
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-3 outline-none transition-colors shadow-sm resize-none"
                ></textarea>
              </div>

            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] block p-2.5 outline-none transition-colors cursor-pointer shadow-sm"
            >
              <option value="Open">Status: Open</option>
              <option value="Fixing">Status: Fixing</option>
              <option value="Resolved">Status: Resolved</option>
            </select>

            <button 
              onClick={onDelete}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 text-sm font-bold rounded-xl transition-colors border border-red-100 dark:border-red-500/20"
            >
              Hapus
            </button>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={onClose} 
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors"
            >
              Tutup
            </button>
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="px-5 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-[#011D58]/20 flex items-center gap-2 disabled:opacity-70"
            >
              {isSaving ? (
                <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Menyimpan...</>
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}