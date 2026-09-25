"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import AddFinanceModal from "@/components/AddFinanceModal";
import FinanceDetailModal from "@/components/FinanceDetailModal";
import EditFinanceModal from "@/components/EditFinanceModal";

type BreakdownItem = {
  item?: string;
  keterangan?: string;
  amount?: number;
  nominal?: number;
};

type FinanceData = {
  id: number;
  websiteId: number;
  websiteName: string;
  clientName: string;
  billingCycle: string;
  revenue: number;
  cost: number;
  profit: number;
  costBreakdown: BreakdownItem[];
  nextBilling: string;
  status: string;
};

type WebsiteDropdown = { id: number; name: string; clientName: string };

type Props = {
  initialData: FinanceData[];
  websites: WebsiteDropdown[];
};

const formatIDR = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

// Varian Animasi untuk Baris Tabel
const tableContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const tableRowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }
};

export default function FinanceClient({ initialData, websites }: Props) {
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // State Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [detailFinance, setDetailFinance] = useState<FinanceData | null>(null);
  const [editFinance, setEditFinance] = useState<FinanceData | null>(null);

  // --- SISTEM NOTIFIKASI TOAST ---
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ 
    show: false, message: "", type: "success" 
  });
  
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 5000); // Disamakan 5 detik
  };

  // Hitung Statistik
  const totalRevenue = initialData.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalCost = initialData.reduce((acc, curr) => acc + curr.cost, 0);
  const netProfit = totalRevenue - totalCost;
  const unpaidCount = initialData.filter((i) => i.status === "Unpaid").length;

  const filteredData = initialData.filter((item) => {
    const matchesSearch = 
      item.websiteName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handler Refresh
  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative pb-10">
      
      {/* Toast Notification */}
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
            Laporan <span className="text-[#FA4D09]">Keuangan</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pantau arus kas, biaya server bulanan, dan margin keuntungan tiap proyek.
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 bg-[#011D58] hover:bg-[#022b82] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#011D58]/20 flex items-center justify-center gap-2 active:scale-95 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Catat Keuangan Proyek
        </button>
      </div>

      {/* Mini Stats & Filter Terpadu */}
      <div className="flex flex-col xl:flex-row gap-5 justify-between items-start xl:items-end">
        
        {/* Ringkasan (Stat Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full xl:w-auto">
          {/* Gross Revenue */}
          <div className="p-4 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">Gross Revenue</p>
              <p className="text-base font-black text-slate-900 dark:text-white truncate mt-1">{formatIDR(totalRevenue)}</p>
            </div>
          </div>
          
          {/* Infra Cost */}
          <div className="p-4 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm flex items-center gap-3">
            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">Infra. Cost</p>
              <p className="text-base font-black text-slate-900 dark:text-white truncate mt-1">{formatIDR(totalCost)}</p>
            </div>
          </div>
          
          {/* Net Profit */}
          <div className="p-4 bg-gradient-to-br from-[#011D58] to-[#022b82] dark:from-slate-800 dark:to-slate-900 border border-[#011D58] dark:border-slate-700 rounded-2xl shadow-lg shadow-[#011D58]/20 flex items-center gap-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full pointer-events-none"></div>
            <div className="p-3 bg-white/20 text-white rounded-xl shrink-0 relative z-10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <div className="overflow-hidden relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200 dark:text-slate-400 truncate">Net Profit</p>
              <p className="text-base font-black text-white truncate mt-1">{formatIDR(netProfit)}</p>
            </div>
          </div>

          {/* Unpaid */}
          <div className="p-4 bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm flex items-center gap-3 relative overflow-hidden">
            {unpaidCount > 0 && <div className="absolute top-0 right-0 w-1.5 h-full bg-rose-500 animate-pulse"></div>}
            <div className={`p-3 rounded-xl shrink-0 ${unpaidCount > 0 ? "bg-rose-50 text-rose-500 dark:bg-rose-500/10" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">Unpaid Invoices</p>
              <p className={`text-base font-black truncate mt-1 ${unpaidCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>{unpaidCount} Tagihan</p>
            </div>
          </div>
        </div>

        {/* Toolbar Pencarian & Filter Terpadu */}
        <div className="flex flex-col sm:flex-row gap-0 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm w-full xl:w-auto overflow-hidden focus-within:ring-2 focus-within:ring-[#FC7A0B]/50 transition-shadow shrink-0">
          <div className="relative w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Cari proyek atau klien..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-transparent text-slate-900 dark:text-slate-200 text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 px-4 py-3 bg-transparent text-slate-700 dark:text-slate-300 text-sm outline-none cursor-pointer font-medium appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
          >
            <option value="All">Semua Status</option>
            <option value="Paid">Lunas (Paid)</option>
            <option value="Unpaid">Belum Lunas (Unpaid)</option>
            <option value="Internal">Internal (Non-Profit)</option>
          </select>
        </div>
      </div>

      {/* Tabel Keuangan Premium */}
      <div className="rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-5 px-6 rounded-tl-3xl">Proyek & Klien</th>
                <th className="py-5 px-6">Pendapatan (Rev)</th>
                <th className="py-5 px-6">Biaya Infra. (Cost)</th>
                <th className="py-5 px-6">Margin Profit</th>
                <th className="py-5 px-6">Jatuh Tempo</th>
                <th className="py-5 px-6">Status Pembayaran</th>
                <th className="py-5 px-6 text-right rounded-tr-3xl">Aksi</th>
              </tr>
            </thead>
            <motion.tbody 
              variants={tableContainerVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-slate-100 dark:divide-slate-800/60"
            >
              <AnimatePresence mode="popLayout">
                {filteredData.length > 0 ? (
                  filteredData.map((data) => (
                    <motion.tr 
                      key={data.id}
                      variants={tableRowVariants}
                      layout
                      className="hover:bg-white dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900 dark:text-white group-hover:text-[#FA4D09] dark:group-hover:text-[#FF9F03] transition-colors">{data.websiteName}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-1 uppercase tracking-wide">
                          <span>{data.clientName}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                          <span>{data.billingCycle}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">
                        {formatIDR(data.revenue)}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400">
                        {data.cost > 0 ? (
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                            - {formatIDR(data.cost)}
                          </span>
                        ) : (
                          <span>Rp 0</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`font-black ${data.profit > 0 ? 'text-emerald-600 dark:text-emerald-400' : data.profit < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}`}>
                          {formatIDR(data.profit)}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-600 dark:text-slate-400">
                        {data.nextBilling}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 w-max ${
                          data.status === 'Paid' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                          data.status === 'Unpaid' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}>
                          {data.status === 'Unpaid' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>}
                          {data.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => setDetailFinance(data)}
                          className="px-4 py-2 text-xs font-bold text-[#011D58] dark:text-white bg-slate-100 hover:bg-[#011D58] hover:text-white dark:bg-slate-800 dark:hover:bg-[#FF9F03] rounded-xl transition-all ml-auto flex items-center gap-1.5 shadow-sm"
                        >
                          Rincian 
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <p className="text-slate-900 dark:text-white font-bold mb-1">Tidak Ada Data</p>
                      <p className="text-sm text-slate-500">Tidak ada catatan keuangan yang cocok dengan pencarian Anda.</p>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* RENDER SEMUA MODALS DI SINI */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddFinanceModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)} 
            websites={websites} 
            onSuccess={handleSuccess} 
            showToast={showToast} 
          />
        )}

        {detailFinance && (
          <FinanceDetailModal 
            isOpen={!!detailFinance} 
            onClose={() => setDetailFinance(null)} 
            data={detailFinance} 
            onSuccess={handleSuccess} 
            showToast={showToast}
            onEditClick={() => {
              setEditFinance(detailFinance);
            }} 
          />
        )}

        {editFinance && (
          <EditFinanceModal 
            isOpen={!!editFinance}
            onClose={() => setEditFinance(null)}
            data={editFinance}
            websites={websites}
            onSuccess={handleSuccess}
            showToast={showToast}
          />
        )}
      </AnimatePresence>
    </div>
  );
}