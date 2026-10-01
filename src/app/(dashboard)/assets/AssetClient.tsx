"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { deleteAsset } from "@/actions/assetActions";
import AddAssetModal from "@/components/AddAssetModal";
import EditAssetModal from "@/components/EditAssetModal";
import { formatDateIndo } from "@/lib/utils";

type AssetData = {
  id: number;
  assetCode: string;
  name: string;
  category: string;
  purchaseDate: string | null;
  price: string | number;
  condition: string;
  status: string;
  assignedTo: string | null;
  notes: string | null;
  assigneeName?: string | null;
};

type UserDropdown = { id: string; name: string };

type Props = {
  initialData: AssetData[];
  users: UserDropdown[];
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

export default function AssetClient({ initialData, users }: Props) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<AssetData | null>(null);

  // Custom Delete Modal State
  const [assetToDelete, setAssetToDelete] = useState<AssetData | null>(null);
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

  // Kalkulasi Statistik
  const totalAssets = initialData.length;
  const inUseAssets = initialData.filter((a) => a.status === "In Use").length;
  const repairAssets = initialData.filter((a) => a.condition === "Repair").length;
  const totalValue = initialData.reduce(
    (acc, curr) => acc + Number(curr.price || 0),
    0
  );

  // Filter Data
  const filteredData = initialData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.assigneeName &&
        item.assigneeName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;
    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Eksekusi Hapus Data Aset
  const executeDelete = async () => {
    if (!assetToDelete) return;
    setIsDeleting(true);

    const res = await deleteAsset(assetToDelete.id);
    if (res.success) {
      triggerNotification(`Aset ${assetToDelete.name} berhasil dihapus.`);
      setAssetToDelete(null);
      router.refresh();
    } else {
      triggerNotification(`Gagal menghapus: ${res.message}`, "error");
    }
    setIsDeleting(false);
  };

  // Helper Icon Emoji Kategori
  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case "Laptop":
        return "💻";
      case "Smartphone":
        return "📱";
      case "Monitor":
        return "🖥️";
      case "Furniture":
        return "🪑";
      case "Kendaraan":
        return "🚗";
      default:
        return "📦";
    }
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
              SULO-MIS Asset Management
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Inventaris <span className="text-[#FA4D09] dark:text-[#FF9F03]">Aset Operasional</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola dan pantau seluruh perangkat keras & perlengkapan kerja tim SULO.
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
          Tambah Aset Baru
        </button>
      </div>

      {/* STATISTIK MINI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Aset */}
        <div className="p-4 bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
              Total Aset
            </p>
            <p className="text-base font-black text-slate-900 dark:text-white mt-0.5 font-mono">
              {totalAssets} Unit
            </p>
          </div>
        </div>

        {/* Dipinjamkan */}
        <div className="p-4 bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
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
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
              Dipinjamkan
            </p>
            <p className="text-base font-black text-slate-900 dark:text-white mt-0.5 font-mono">
              {inUseAssets} Karyawan
            </p>
          </div>
        </div>

        {/* Perlu Servis */}
        <div className="p-4 bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm flex items-center gap-3 relative overflow-hidden">
          {repairAssets > 0 && (
            <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500 animate-pulse" />
          )}
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
              Perlu Servis
            </p>
            <p
              className={`text-base font-black mt-0.5 font-mono ${
                repairAssets > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-slate-900 dark:text-white"
              }`}
            >
              {repairAssets} Unit
            </p>
          </div>
        </div>

        {/* Total Nilai Aset */}
        <div className="p-4 bg-gradient-to-br from-[#011D58] to-[#022b82] dark:from-slate-800 dark:to-slate-900 border border-[#011D58] dark:border-slate-700 rounded-2xl shadow-lg shadow-[#011D58]/20 flex items-center gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full pointer-events-none" />
          <div className="p-3 bg-white/20 text-white rounded-xl shrink-0 z-10">
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="min-w-0 z-10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200 dark:text-slate-400 truncate">
              Total Nilai Aset
            </p>
            <p
              className="text-sm font-black text-white truncate mt-0.5 font-mono"
              title={formatIDR(totalValue)}
            >
              {formatIDR(totalValue)}
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
            placeholder="Cari nama aset, kode, atau peminjam..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-transparent text-slate-900 dark:text-slate-200 text-xs outline-none placeholder:text-slate-400"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-48 px-4 py-2.5 bg-transparent text-slate-700 dark:text-slate-300 text-xs outline-none cursor-pointer border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider appearance-none"
          style={{
            backgroundImage:
              'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
            backgroundSize: "1em",
          }}
        >
          <option value="All">Semua Kategori</option>
          <option value="Laptop">Laptop / PC</option>
          <option value="Smartphone">Smartphone / Tablet</option>
          <option value="Monitor">Monitor</option>
          <option value="Furniture">Furniture</option>
          <option value="Kendaraan">Kendaraan</option>
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
          <option value="Available">Tersedia</option>
          <option value="In Use">Sedang Digunakan</option>
          <option value="Retired">Pensiun / Rusak</option>
        </select>
      </div>

      {/* TABEL ASET */}
      <div className="rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-4 px-6 rounded-tl-3xl">Perangkat & Kategori</th>
                <th className="py-4 px-6">Harga Beli</th>
                <th className="py-4 px-6 text-center">Kondisi</th>
                <th className="py-4 px-6">Status & Peminjam</th>
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
                      {/* Kolom 1: Perangkat & Kategori */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60 text-lg shadow-sm">
                            {getCategoryEmoji(data.category)}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white text-xs group-hover:text-[#FA4D09] dark:group-hover:text-[#FF9F03] transition-colors">
                              {data.name}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold mt-0.5 uppercase tracking-wider">
                              <span className="text-[#FA4D09] bg-[#FA4D09]/10 px-1.5 py-0.2 rounded">
                                {data.assetCode}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                              <span className="text-slate-500 dark:text-slate-400">
                                {data.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kolom 2: Harga Beli & Tanggal Beli */}
                      <td className="py-4 px-6 font-mono">
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                          {formatIDR(data.price)}
                        </p>
                        <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                          Beli:{" "}
                          {data.purchaseDate
                            ? formatDateIndo(data.purchaseDate)
                            : "-"}
                        </p>
                      </td>

                      {/* Kolom 3: Kondisi */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            data.condition === "Good"
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                              : data.condition === "Repair"
                              ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                              : "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
                          }`}
                        >
                          {data.condition === "Good"
                            ? "🟢 Baik"
                            : data.condition === "Repair"
                            ? "🟡 Servis"
                            : "🔴 Rusak"}
                        </span>
                      </td>

                      {/* Kolom 4: Status & Peminjam */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                              data.status === "Available"
                                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                                : data.status === "In Use"
                                ? "bg-[#011D58]/10 text-[#011D58] dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {data.status === "Available"
                              ? "Di Kantor"
                              : data.status === "In Use"
                              ? "Dipinjam"
                              : "Pensiun"}
                          </span>
                          {data.status === "In Use" && data.assigneeName && (
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                              <svg
                                className="w-3.5 h-3.5 text-slate-400"
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
                              <span>{data.assigneeName}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Kolom 5: Aksi */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditItem(data)}
                            className="p-1.5 text-slate-400 hover:text-[#011D58] dark:hover:text-[#FF9F03] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Edit Aset"
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
                            onClick={() => setAssetToDelete(data)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Aset"
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
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </div>
                      <p className="text-slate-900 dark:text-white font-bold mb-1 text-sm">
                        Aset Tidak Ditemukan
                      </p>
                      <p className="text-xs text-slate-500">
                        Tidak ada data inventaris yang cocok dengan kueri pencarian atau filter Anda.
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
        {assetToDelete && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setAssetToDelete(null)}
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
                Hapus Aset Inventaris?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Anda yakin ingin menghapus aset{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  "{assetToDelete.name}"
                </span>{" "}
                (<span className="font-mono text-[#FA4D09]">{assetToDelete.assetCode}</span>)?
                Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setAssetToDelete(null)}
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
          <AddAssetModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            users={users}
            onSuccess={() => {
              triggerNotification("Aset baru berhasil ditambahkan!");
              router.refresh();
            }}
          />
        )}
        {editItem && (
          <EditAssetModal
            isOpen={!!editItem}
            onClose={() => setEditItem(null)}
            users={users}
            data={editItem}
            onSuccess={() => {
              triggerNotification("Data aset berhasil diperbarui!");
              router.refresh();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}