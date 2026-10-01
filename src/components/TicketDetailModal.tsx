"use client";

import { motion, type Variants } from "framer-motion";
import type { Ticket } from "@/components/KanbanBoard";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
};

// Varian Animasi Staggered untuk Elemen Modal Detail
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export default function TicketDetailModal({ isOpen, onClose, ticket }: Props) {
  if (!isOpen || !ticket) return null;

  // Konfigurasi Warna Prioritas SULO-MIS
  const priorityColors: Record<string, string> = {
    High: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
    Medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    Low: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  };

  // Konfigurasi Warna Status SULO-MIS
  const statusColors: Record<string, string> = {
    Open: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    "In Progress": "bg-[#011D58]/10 text-[#011D58] border-[#011D58]/20 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    Closed: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  };

  const priorityStyle = priorityColors[ticket.priority] || priorityColors.Medium;
  const statusStyle = statusColors[ticket.status] || statusColors.Open;

  const displayStatus =
    ticket.status === "In Progress"
      ? "Fixing"
      : ticket.status === "Closed"
      ? "Resolved"
      : "Open";

  const displayDate = ticket.reportedDate || ticket.date || "Tidak ada tanggal";

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
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
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-[#011D58]/10 dark:bg-[#FF9F03]/10 text-[#011D58] dark:text-[#FF9F03] rounded-xl shadow-inner font-black text-xs tracking-widest flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              #{ticket.id.toString().substring(0, 8)}
            </span>
            <span className="text-xs font-semibold text-slate-400">Rincian Tiket Laporan</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-rose-500 bg-slate-200/50 dark:bg-slate-800 p-2 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body Modal Scrollable */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Judul & Status Badges */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 leading-snug">
                {ticket.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg border flex items-center gap-1.5 ${priorityStyle}`}
                >
                  {ticket.priority === "High" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  )}
                  Prioritas {ticket.priority}
                </span>

                <span
                  className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg border ${statusStyle}`}
                >
                  Status: {displayStatus}
                </span>
              </div>
            </motion.div>

            <motion.hr variants={itemVariants} className="border-slate-100 dark:border-slate-800" />

            {/* Grid Meta Informasi */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Klien */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2 mb-1.5">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Klien
                  </p>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-200">
                  {ticket.clientName || "Proyek Internal"}
                </p>
              </div>

              {/* Proyek / Website */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2 mb-1.5">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Proyek / Sistem
                  </p>
                </div>
                <p
                  className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate"
                  title={ticket.websiteName || "Sistem Umum"}
                >
                  {ticket.websiteName || "Sistem Umum"}
                </p>
              </div>

              {/* Tanggal Laporan */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2 mb-1.5">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Tgl Laporan
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {displayDate}
                </p>
              </div>
            </motion.div>

            {/* Deskripsi Rincian Kendala */}
            <motion.div variants={itemVariants}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Rincian Kendala (Issue)
              </h4>
              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-950/50 p-5 sm:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 font-medium">
                {ticket.description || (
                  <span className="italic text-slate-400">
                    Tidak ada detail deskripsi yang dilampirkan untuk tiket ini.
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </div>
  );
}