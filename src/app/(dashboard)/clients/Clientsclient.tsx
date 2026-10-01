"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AddClientModal from "@/components/AddClientModal";

export type ClientData = {
  id: number;
  companyName: string;
  picName: string;
  email: string;
  phone: string;
  status: string;
  websites: string[];
};

// Varian Animasi Staggered untuk Grid Klien
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export default function Clientsclient({
  initialClients,
}: {
  initialClients: ClientData[];
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  const triggerNotification = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 4000);
  };

  useEffect(() => {
    const pendingMessage = sessionStorage.getItem("sulo-toast-success");
    if (pendingMessage) {
      triggerNotification(pendingMessage);
      sessionStorage.removeItem("sulo-toast-success");
    }
  }, []);

  const totalClients = initialClients.length;
  const activeClients = initialClients.filter((c) => c.status === "Active").length;
  const totalWebsites = initialClients.reduce(
    (acc, curr) => acc + (curr.websites?.length || 0),
    0
  );

  const filteredClients = initialClients.filter((client) => {
    const matchesSearch =
      client.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.picName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative pb-12">
      {/* Header & Tombol Aksi Utama */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Direktori <span className="text-[#FA4D09]">Klien</span>
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            Kelola profil perusahaan klien, penanggung jawab (PIC), dan portofolio aset digital.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#011D58]/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Tambah Klien Baru
        </motion.button>
      </div>

      {/* Ringkasan Ringkas & Filter Toolbar */}
      <div className="flex flex-col xl:flex-row gap-5 justify-between items-start xl:items-center">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 w-full xl:w-auto">
          <div className="flex items-center gap-3 p-4 bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm">
            <span className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-xl shrink-0">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Total Klien
              </p>
              <p className="text-base font-black text-slate-900 dark:text-white leading-none mt-1">
                {totalClients} Perusahaan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm">
            <span className="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-xl shrink-0">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Klien Aktif
              </p>
              <p className="text-base font-black text-slate-900 dark:text-white leading-none mt-1">
                {activeClients} Kontrak
              </p>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 flex items-center gap-3 p-4 bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm">
            <span className="p-3 bg-[#FC7A0B]/10 text-[#FC7A0B] rounded-xl shrink-0">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Total Proyek
              </p>
              <p className="text-base font-black text-slate-900 dark:text-white leading-none mt-1">
                {totalWebsites} Website
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar Pencarian & Filter Terpadu */}
        <div className="flex flex-col sm:flex-row gap-0 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm w-full xl:w-auto overflow-hidden focus-within:ring-2 focus-within:ring-[#FC7A0B]/40 transition-shadow">
          <div className="relative w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Cari nama klien atau PIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-transparent text-slate-900 dark:text-slate-200 text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 px-4 py-3 bg-transparent text-slate-700 dark:text-slate-300 text-sm outline-none cursor-pointer font-medium appearance-none"
            style={{
              backgroundImage:
                'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
              backgroundSize: "1em",
            }}
          >
            <option value="All">Semua Status</option>
            <option value="Active">Active</option>
            <option value="Internal">Internal</option>
          </select>
        </div>
      </div>

      {/* Grid Klien */}
      {filteredClients.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredClients.map((client) => {
              // Format nomor telepon untuk WhatsApp link
              const cleanPhone = client.phone ? client.phone.replace(/\D/g, "") : "";
              const waLink = cleanPhone
                ? `https://wa.me/${
                    cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone
                  }`
                : null;

              return (
                <motion.div key={client.id} variants={cardVariants} layout>
                  <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl hover:bg-white dark:hover:bg-slate-900 shadow-sm hover:shadow-xl hover:shadow-[#FC7A0B]/5 hover:border-[#FC7A0B]/40 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden h-full">
                    {/* Glow Aksen Background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FC7A0B]/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div>
                      {/* Header Kartu: Avatar Logo & Status Badge */}
                      <div className="flex justify-between items-start mb-5 relative z-10">
                        <Link
                          href={`/clients/${client.id}`}
                          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#011D58] to-[#022b82] dark:from-slate-800 dark:to-slate-900 shadow-inner flex items-center justify-center text-white text-xl font-black uppercase ring-4 ring-white dark:ring-slate-900 group-hover:scale-105 transition-transform"
                        >
                          {client.companyName.charAt(0)}
                        </Link>
                        <span
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                            client.status === "Active"
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {client.status === "Active" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          )}
                          {client.status}
                        </span>
                      </div>

                      {/* Detail Nama Perusahaan & Kontak PIC */}
                      <div className="mb-5 relative z-10">
                        <Link href={`/clients/${client.id}`}>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-[#FA4D09] transition-colors leading-tight mb-3">
                            {client.companyName}
                          </h3>
                        </Link>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                            <span className="p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-slate-400 dark:text-slate-500 shrink-0">
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {client.picName}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                            <span className="p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-slate-400 dark:text-slate-500 shrink-0">
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                            </span>
                            <span className="truncate">{client.email || "Tidak ada email"}</span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-slate-400 dark:text-slate-500 shrink-0">
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                  />
                                </svg>
                              </span>
                              <span className="font-mono text-xs">
                                {client.phone || "Belum ada no. HP"}
                              </span>
                            </div>

                            {/* Tombol Kontak WhatsApp Langsung */}
                            {waLink && (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm shrink-0"
                                title="Chat WhatsApp PIC"
                              >
                                💬 WhatsApp
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Proyek Website Terkait */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 relative z-10">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-2">
                        Proyek Aktif ({client.websites?.length || 0})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {client.websites && client.websites.length > 0 ? (
                          client.websites.map((web, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 group-hover:border-[#FC7A0B]/30 transition-colors flex items-center gap-1.5"
                            >
                              <svg
                                className="w-3 h-3 text-[#FC7A0B]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                />
                              </svg>
                              {web}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic font-medium">
                            Belum ada proyek terdaftar.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center p-16 text-center bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed"
        >
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 mb-4 shadow-inner">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Klien Tidak Ditemukan
          </h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Tidak ada data klien yang cocok dengan pencarian{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              "{searchQuery}"
            </span>
            .
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("All");
            }}
            className="mt-5 px-5 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-[#011D58]/20"
          >
            Reset Pencarian
          </button>
        </motion.div>
      )}

      {/* Modal Tambah Klien */}
      <AnimatePresence>
        {isModalOpen && (
          <AddClientModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
              triggerNotification("Klien baru berhasil ditambahkan.");
              router.refresh();
            }}
          />
        )}
      </AnimatePresence>

      {/* Toast Notifikasi Kanan Atas */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-8 right-8 z-[200] flex items-center gap-3 px-5 py-4 bg-emerald-600 dark:bg-emerald-500 text-white font-semibold text-sm rounded-2xl shadow-2xl shadow-emerald-600/30 backdrop-blur-xl"
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="pr-2">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}