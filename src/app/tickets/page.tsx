"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { allTickets } from "@/lib/mockData";
import AddTicketModal from "@/components/AddTicketModal";
import EditTicketModal from "@/components/EditTicketModal";

export default function TicketsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  
  // State untuk Data Tiket (Bisa dimutasi saat dihapus/diubah)
  const [tickets, setTickets] = useState(allTickets);

  // State untuk Detail/Edit Tiket Terpilih
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  // State untuk Konfirmasi Hapus Tiket
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // State untuk Modul Notifikasi Sukses (Toast)
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  // Fungsi Pemicu Notifikasi Toast
  const triggerNotification = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 3500);
  };

  // Handler Simpan Perubahan Tiket dari Modal Edit
  const handleSaveTicketChanges = (updatedStatus: string, comment: string) => {
    setTickets(tickets.map(t => 
      t.id === selectedTicket.id ? { ...t, status: updatedStatus } : t
    ));
    setSelectedTicket(null);
    triggerNotification(
      comment.trim() 
        ? "Perubahan status & pembaruan komentar berhasil disimpan!" 
        : "Perubahan status tiket berhasil disimpan!"
    );
  };

  // Handler Hapus Tiket
  const handleDeleteTicket = () => {
    if (!selectedTicket) return;
    setIsDeleting(true);
    setTimeout(() => {
      setTickets(tickets.filter(t => t.id !== selectedTicket.id));
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setSelectedTicket(null);
      triggerNotification("Tiket berhasil dihapus dari sistem.");
    }, 1000);
  };

  // Kalkulasi Ringkasan (Mini Stats)
  const totalTickets = tickets.length;
  const activeTickets = tickets.filter(t => t.status === "Open" || t.status === "Fixing").length;
  const highPriority = tickets.filter(t => t.priority === "High" && t.status !== "Resolved").length;

  // Logika Pencarian dan Filter
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ticket.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Header & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Helpdesk & <span className="text-[#FA4D09]">Tiket Global</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Daftar tugas, komplain, atau permintaan fitur baru lintas proyek.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="px-5 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-[#011D58]/20 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Buat Tiket Baru
        </button>
      </div>

      {/* Mini Stats & Toolbar Pencarian */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        {/* Ringkasan */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md whitespace-nowrap shrink-0">
            <span className="p-1.5 bg-[#011D58]/10 text-[#011D58] dark:bg-[#FF9F03]/10 dark:text-[#FF9F03] rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Tiket</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{totalTickets} Laporan</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md whitespace-nowrap shrink-0">
            <span className="p-1.5 bg-[#FC7A0B]/10 text-[#FC7A0B] rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sedang Dikerjakan</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{activeTickets} Tiket Aktif</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-[#FA4D09]/5 dark:bg-[#FA4D09]/10 border border-[#FA4D09]/20 rounded-xl backdrop-blur-md whitespace-nowrap shrink-0 shadow-[0_0_15px_rgba(250,77,9,0.1)]">
            <span className="p-1.5 bg-[#FA4D09]/20 text-[#FA4D09] rounded-lg animate-pulse"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#FA4D09]">Prioritas Tinggi</p>
              <p className="text-sm font-black text-[#FA4D09]">{highPriority} Mendesak</p>
            </div>
          </div>
        </div>

        {/* Toolbar Pencarian & Filter */}
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="relative w-full sm:w-56">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Cari ID, Judul, Proyek..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-[#FC7A0B] focus:border-[#FC7A0B] outline-none transition-colors"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-xl outline-none focus:ring-[#FC7A0B] focus:border-[#FC7A0B] cursor-pointer"
          >
            <option value="All">Semua Status</option>
            <option value="Open">Open</option>
            <option value="Fixing">Fixing</option>
            <option value="Resolved">Resolved</option>
          </select>
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-xl outline-none focus:ring-[#FC7A0B] focus:border-[#FC7A0B] cursor-pointer"
          >
            <option value="All">Semua Prioritas</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Tabel Tiket Global */}
      <div className="rounded-3xl bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-4 px-6 font-semibold w-24">ID Tiket</th>
                <th className="py-4 px-6 font-semibold">Judul Masalah</th>
                <th className="py-4 px-6 font-semibold">Proyek Terkait</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold">Prioritas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 relative">
              <AnimatePresence>
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <motion.tr 
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-[#FC7A0B] transition-colors">{ticket.id}</span>
                        <p className="text-[10px] text-slate-400 mt-1">{ticket.date}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900 dark:text-white group-hover:text-[#FA4D09] transition-colors line-clamp-1">{ticket.title}</p>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400 font-medium">
                        {ticket.website}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
                          ticket.status === 'Open' ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' :
                          ticket.status === 'Fixing' ? 'bg-[#011D58]/10 text-[#011D58] dark:bg-[#011D58]/40 dark:text-[#FF9F03] border-[#011D58]/20' :
                          'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border flex items-center w-fit gap-1 ${
                          ticket.priority === 'High' ? 'bg-[#FA4D09]/10 text-[#FA4D09] border-[#FA4D09]/20' :
                          ticket.priority === 'Medium' ? 'bg-[#FF9F03]/10 text-[#FC7A0B] border-[#FF9F03]/20' :
                          'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                        }`}>
                          {ticket.priority === 'High' && <span className="w-1.5 h-1.5 rounded-full bg-[#FA4D09] animate-pulse"></span>}
                          {ticket.priority}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                      Tidak ada tiket yang cocok dengan pencarian Anda.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* RENDER MODAL TAMBAH TIKET */}
      <AnimatePresence>
        {isModalOpen && (
          <AddTicketModal 
            isOpen={isModalOpen} 
            onClose={() => {
              setIsModalOpen(false);
              triggerNotification("Tiket baru berhasil dibuat!");
            }} 
          />
        )}
      </AnimatePresence>

      {/* RENDER MODAL EDIT & DETAIL TIKET TERPISAH */}
      <AnimatePresence>
        {selectedTicket && (
          <EditTicketModal 
            isOpen={!!selectedTicket}
            onClose={() => setSelectedTicket(null)}
            ticket={selectedTicket}
            onSave={handleSaveTicketChanges}
            onDelete={() => setIsDeleteModalOpen(true)}
          />
        )}
      </AnimatePresence>

      {/* MODAL KONFIRMASI HAPUS TIKET */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl max-w-md w-full z-10 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-500/30">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Hapus Tiket Ini?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Tiket <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedTicket?.id}</span> akan dihapus permanen dari helpdesk.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm transition-colors">Batal</button>
                <button onClick={handleDeleteTicket} disabled={isDeleting} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-colors disabled:opacity-70">
                  {isDeleting ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Menghapus...</> : "Ya, Hapus Tiket"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING TOAST NOTIFICATION (MODUL NOTIFIKASI SUKSES) */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
            className="fixed bottom-8 right-8 z-[200] flex items-center gap-3 px-5 py-4 bg-emerald-600 dark:bg-emerald-500 text-white font-semibold text-sm rounded-2xl shadow-2xl shadow-emerald-600/30 border border-emerald-400/30 backdrop-blur-xl"
          >
            <div className="p-1 bg-white/20 rounded-lg shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="pr-2">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}