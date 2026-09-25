"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import KanbanBoard, { type Ticket } from "@/components/KanbanBoard";
import EditTicketModal from "@/components/EditTicketModal";
import AddTicketModal from "@/components/AddTicketModal";

type Website = { id: number; name: string };
type Props = { initialTickets: Ticket[]; websites: Website[]; };

export default function TicketsClient({ initialTickets, websites }: Props) {
  const router = useRouter();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // --- SISTEM NOTIFIKASI TOAST ---
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ 
    show: false, message: "", type: "success" 
  });
  
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    // Durasinya diseragamkan menjadi 5 detik mengikuti modul lainnya
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 5000); 
  };

  // --- KALKULASI STATISTIK TIKET ---
  const totalTickets = initialTickets.length;
  // Menangkap berbagai kemungkinan penamaan status (Open/To Do/Pending)
  const openTickets = initialTickets.filter(t => ["Open", "To Do", "Pending", "Baru"].includes(t.status || "")).length;
  const inProgressTickets = initialTickets.filter(t => ["In Progress", "Proses", "Working"].includes(t.status || "")).length;
  const resolvedTickets = initialTickets.filter(t => ["Resolved", "Done", "Selesai", "Closed"].includes(t.status || "")).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative pb-10">
      
      {/* Toast Notification Premium */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`fixed top-8 right-8 z-[200] flex items-center gap-3 px-5 py-4 text-white font-semibold text-sm rounded-2xl shadow-2xl backdrop-blur-xl border ${
              toast.type === "success" 
                ? "bg-emerald-600 dark:bg-emerald-500 shadow-emerald-600/30 border-emerald-400/30" 
                : "bg-red-600 dark:bg-red-500 shadow-red-600/30 border-red-400/30"
            }`}
          >
            <div className="p-1 bg-white/20 rounded-lg shrink-0">
              {toast.type === "success" ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
            </div>
            <p className="pr-2">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Helpdesk & <span className="text-[#FA4D09]">Tiket</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manajemen perbaikan bug, maintenance rutin, dan laporan kendala klien.
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)} 
          className="px-5 py-2.5 bg-[#011D58] hover:bg-[#022b82] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#011D58]/20 flex items-center justify-center gap-2 active:scale-95 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Buat Tiket Baru
        </button>
      </div>

      {/* Mini Stats Ringkasan Papan Kanban */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">Total Tiket</p>
            <p className="text-base font-black text-slate-900 dark:text-white truncate mt-0.5">{totalTickets} Item</p>
          </div>
        </div>
        
        <div className="p-4 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm flex items-center gap-3 relative overflow-hidden">
          {openTickets > 0 && <div className="absolute top-0 right-0 w-1.5 h-full bg-rose-500 animate-pulse"></div>}
          <div className={`p-3 rounded-xl shrink-0 ${openTickets > 0 ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">Menunggu (Open)</p>
            <p className={`text-base font-black truncate mt-0.5 ${openTickets > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>{openTickets} Antrean</p>
          </div>
        </div>
        
        <div className="p-4 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">Sedang Dikerjakan</p>
            <p className="text-base font-black text-slate-900 dark:text-white truncate mt-0.5">{inProgressTickets} Proses</p>
          </div>
        </div>
        
        <div className="p-4 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">Selesai (Resolved)</p>
            <p className="text-base font-black text-slate-900 dark:text-white truncate mt-0.5">{resolvedTickets} Tuntas</p>
          </div>
        </div>
      </div>

      {/* Render Kanban Board */}
      <div className="rounded-3xl bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-sm p-2 sm:p-4">
        <KanbanBoard 
          initialData={initialTickets} 
          onTicketClick={(ticket) => setSelectedTicket(ticket)}
          showToast={showToast} 
        />
      </div>
      
      {/* Render Modals */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddTicketModal 
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            websites={websites}
            onSuccess={() => router.refresh()}
            showToast={showToast} 
          />
        )}
        {selectedTicket && (
          <EditTicketModal 
            isOpen={!!selectedTicket} 
            onClose={() => setSelectedTicket(null)} 
            ticket={selectedTicket} 
            onSuccess={() => {
              router.refresh();      
              setSelectedTicket(null); 
            }}
            showToast={showToast} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}