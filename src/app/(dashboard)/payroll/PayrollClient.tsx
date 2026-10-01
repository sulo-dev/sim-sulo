"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { deletePayroll } from "@/actions/payrollActions";
import AddPayrollModal from "@/components/AddPayrollModal";
import EditPayrollModal from "@/components/EditPayrollModal";
import { formatDateIndo } from "@/lib/utils";

type PayrollData = {
  id: number;
  userId: string;
  userName: string;
  websiteId: number | null;
  websiteName: string | null;
  type: string;
  amount: string | number;
  paymentDate: string | null;
  status: string;
  notes: string | null;
};

type UserDropdown = { id: string; name: string };
type WebsiteDropdown = { id: number; name: string };

type Props = {
  initialData: PayrollData[];
  users: UserDropdown[];
  websites: WebsiteDropdown[];
};

// Helper: Format Rupiah IDR
const formatIDR = (value: number | string) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

// Varian Animasi untuk Baris Tabel
const tableContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const tableRowVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } },
};

export default function PayrollClient({
  initialData,
  users,
  websites,
}: Props) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<PayrollData | null>(null);

  // Custom Delete Modal State
  const [itemToDelete, setItemToDelete] = useState<PayrollData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const triggerNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 5000);
  };

  // Kalkulasi Statistik Cepat (Hanya menghitung yang "Paid")
  const totalPaid = initialData
    .filter((p) => p.status === "Paid")
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const totalGaji = initialData
    .filter((p) => p.status === "Paid" && p.type === "Gaji Pokok")
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const totalBonus = initialData
    .filter(
      (p) =>
        p.status === "Paid" &&
        (p.type === "Bonus Proyek" || p.type === "Bagi Hasil")
    )
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  // Filter Data List
  const filteredData = initialData.filter((item) => {
    const matchesSearch =
      item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.websiteName &&
        item.websiteName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;
    const matchesType = typeFilter === "All" || item.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Eksekusi Hapus Data
  const executeDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    const res = await deletePayroll(itemToDelete.id);
    if (res.success) {
      triggerNotification(
        `Catatan honor ${itemToDelete.userName} berhasil dihapus.`
      );
      setItemToDelete(null);
      router.refresh();
    } else {
      triggerNotification(`Gagal menghapus: ${res.message}`, "error");
    }
    setIsDeleting(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative pb-10">
      {/* Toast Notification Floating */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`fixed top-8 right-8 z-[200] flex items-center gap-3 px-5 py-4 text-white font-semibold text-sm rounded-2xl shadow-2xl backdrop-blur-xl border ${
              toast.type === "success"
                ? "bg-emerald-600 dark:bg-emerald-500 shadow-emerald-600/30 border-emerald-400/30"
                : "bg-rose-600 dark:bg-rose-500 shadow-rose-600/30 border-rose-400/30"
            }`}
          >
            <div className="p-1 bg-white/20 rounded-lg shrink-0">
              {toast.type === "success" ? (
                <svg
                  className="w-5 h-5 text-white"
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
              ) : (
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>
            <p className="pr-2">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER & TOMBOL AKSI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FC7A0B]/10 text-[#FC7A0B] border border-[#FC7A0B]/20">
              SULO-MIS Payroll & Honorarium
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Rekap Honor &{" "}
            <span className="text-[#FA4D09] dark:text-[#FF9F03]">
              Payroll Tim
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Pantau gaji pokok, bonus proyek, dan bagi hasil tim developer secara transparan.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#011D58]/20 flex items-center justify-center gap-2 active:scale-95 shrink-0 cursor-pointer"
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
          Catat Honor Baru
        </button>
      </div>

      {/* STATISTIK MINI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Dibayarkan */}
        <div className="p-5 bg-gradient-to-br from-[#011D58] to-[#022b82] dark:from-slate-800 dark:to-slate-900 border border-[#011D58] dark:border-slate-700 rounded-3xl shadow-lg relative overflow-hidden flex items-center gap-4">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
          <div className="p-3.5 bg-white/20 text-white rounded-2xl shrink-0 z-10 backdrop-blur-sm">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <div className="z-10 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200 truncate">
              Total Dibayarkan (All Time)
            </p>
            <p className="text-lg sm:text-xl font-black text-white truncate mt-0.5 font-mono">
              {formatIDR(totalPaid)}
            </p>
          </div>
        </div>

        {/* Porsi Gaji Pokok */}
        <div className="p-5 bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl backdrop-blur-xl shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">
              Porsi Gaji Pokok
            </p>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5 font-mono truncate">
              {formatIDR(totalGaji)}
            </p>
          </div>
        </div>

        {/* Porsi Bonus & Bagi Hasil */}
        <div className="p-5 bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl backdrop-blur-xl shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">
              Bonus & Bagi Hasil
            </p>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5 font-mono truncate">
              {formatIDR(totalBonus)}
            </p>
          </div>
        </div>
      </div>

      {/* TOOLBAR FILTER */}
      <div className="flex flex-col sm:flex-row gap-0 bg-white/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm w-full overflow-hidden focus-within:ring-2 focus-within:ring-[#FC7A0B]/30 transition-all">
        <div className="relative w-full border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800">
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
            placeholder="Cari nama karyawan atau proyek..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-transparent text-slate-900 dark:text-slate-200 text-xs outline-none placeholder:text-slate-400"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full sm:w-56 px-4 py-2.5 bg-transparent text-slate-700 dark:text-slate-300 text-xs outline-none cursor-pointer border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider appearance-none"
          style={{
            backgroundImage:
              'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
            backgroundSize: "1em",
          }}
        >
          <option value="All">Semua Jenis Honor</option>
          <option value="Gaji Pokok">Gaji Pokok</option>
          <option value="Bonus Proyek">Bonus Proyek</option>
          <option value="Bagi Hasil">Bagi Hasil</option>
          <option value="Tunjangan">Tunjangan</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48 px-4 py-2.5 bg-transparent text-slate-700 dark:text-slate-300 text-xs outline-none cursor-pointer font-bold uppercase tracking-wider appearance-none"
          style={{
            backgroundImage:
              'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
            backgroundSize: "1em",
          }}
        >
          <option value="All">Semua Status</option>
          <option value="Paid">Sudah Dibayar</option>
          <option value="Unpaid">Belum Dibayar</option>
        </select>
      </div>

      {/* TABEL DATA PAYROLL */}
      <div className="rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-4 px-6 rounded-tl-3xl">Tim / Developer</th>
                <th className="py-4 px-6">Jenis Honor</th>
                <th className="py-4 px-6">Nominal & Tanggal</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right rounded-tr-3xl">Aksi</th>
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
                      {/* Kolom 1: Nama Karyawan */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-[#011D58]/10 dark:bg-[#011D58]/40 text-[#011D58] dark:text-[#FF9F03] flex items-center justify-center shrink-0 border border-[#011D58]/20 font-black text-xs shadow-sm">
                            {data.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white text-xs group-hover:text-[#FA4D09] dark:group-hover:text-[#FF9F03] transition-colors">
                              {data.userName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              ID: {data.userId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Kolom 2: Jenis Honor & Proyek */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              data.type === "Gaji Pokok"
                                ? "bg-blue-500"
                                : data.type === "Bonus Proyek"
                                ? "bg-emerald-500"
                                : data.type === "Bagi Hasil"
                                ? "bg-purple-500"
                                : "bg-amber-500"
                            }`}
                          />
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                            {data.type}
                          </p>
                        </div>
                        {data.websiteName ? (
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 dark:text-slate-400 font-bold mt-1 tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md max-w-fit border border-slate-200/50 dark:border-slate-700/50">
                            <svg
                              className="w-3 h-3 text-slate-400"
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
                            {data.websiteName}
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400 mt-1">-</p>
                        )}
                      </td>

                      {/* Kolom 3: Nominal & Tanggal */}
                      <td className="py-4 px-6">
                        <p className="font-black text-[#011D58] dark:text-[#FF9F03] text-sm font-mono">
                          {formatIDR(data.amount)}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                          Tgl:{" "}
                          {data.paymentDate
                            ? formatDateIndo(data.paymentDate)
                            : "Belum Ditentukan"}
                        </p>
                      </td>

                      {/* Kolom 4: Status Paid / Unpaid */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            data.status === "Paid"
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                              : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                          }`}
                        >
                          {data.status === "Paid" ? (
                            <>
                              <svg
                                className="w-3.5 h-3.5"
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
                              PAID
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              UNPAID
                            </>
                          )}
                        </span>
                      </td>

                      {/* Kolom 5: Aksi */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditItem(data)}
                            className="p-1.5 text-slate-400 hover:text-[#011D58] dark:hover:text-[#FF9F03] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Edit Honor"
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
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setItemToDelete(data)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Honor"
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
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
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
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-slate-900 dark:text-white font-bold mb-1 text-sm">
                        Catatan Honor Kosong
                      </p>
                      <p className="text-xs text-slate-500">
                        Tidak ada data payroll yang cocok dengan kueri atau filter Anda.
                      </p>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* MODAL KONFIRMASI HAPUS */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setItemToDelete(null)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 text-center z-10"
            >
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner border border-rose-100 dark:border-rose-500/20">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                Hapus Catatan Honor?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Anda yakin ingin menghapus catatan honor untuk{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  "{itemToDelete.userName}"
                </span>{" "}
                sebesar{" "}
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formatIDR(itemToDelete.amount)}
                </span>
                ? Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  disabled={isDeleting}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={executeDelete}
                  disabled={isDeleting}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 min-w-[110px] disabled:opacity-70"
                >
                  {isDeleting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    "Ya, Hapus"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RENDER MODALS FORM */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddPayrollModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            users={users}
            websites={websites}
            onSuccess={() => {
              triggerNotification("Catatan honor baru berhasil disimpan!");
              router.refresh();
            }}
          />
        )}
        {editItem && (
          <EditPayrollModal
            isOpen={!!editItem}
            onClose={() => setEditItem(null)}
            users={users}
            websites={websites}
            data={editItem}
            onSuccess={() => {
              triggerNotification("Data honor berhasil diperbarui!");
              router.refresh();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}