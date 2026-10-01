"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import AddUserModal from "@/components/AddUserModal";
import EditUserModal from "@/components/EditUserModal";
import { deleteUser } from "@/actions/userActions";

type UserData = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: string;
  annualLeaveQuota: number;
  isOnLeave: boolean;
  joinedDate: string;
  lastLogin: string;
};

type Props = {
  initialData: UserData[];
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

export default function UsersClient({ initialData }: Props) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // State Modals Form
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserData | null>(null);

  // Custom Delete Modal State
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 5000);
  };

  // Statistik
  const totalUsers = initialData.length;
  const activeUsers = initialData.filter((u) => u.status === "Active").length;
  const onLeaveUsers = initialData.filter((u) => u.isOnLeave).length;

  const uniqueRoles = Array.from(
    new Set(initialData.map((u) => u.role))
  ).filter(Boolean);

  // Filter Data
  const filteredData = initialData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "All" || item.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleSuccess = () => {
    router.refresh();
  };

  // Eksekusi Hapus Karyawan
  const executeDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);

    const res = await deleteUser(userToDelete.id);
    setIsDeleting(false);

    if (res.success) {
      showToast(
        `Karyawan ${userToDelete.name} berhasil dihapus dari direktori.`,
        "success"
      );
      setUserToDelete(null);
      handleSuccess();
    } else {
      showToast(`Gagal menghapus: ${res.message}`, "error");
      setUserToDelete(null);
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

      {/* HEADER & AKSI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FC7A0B]/10 text-[#FC7A0B] border border-[#FC7A0B]/20">
              SULO-MIS Employee Directory
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Direktori <span className="text-[#FA4D09] dark:text-[#FF9F03]">Karyawan & Tim</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola data akun, peran hak akses, dan status cuti tim internal SULO.
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
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          Tambah Karyawan
        </button>
      </div>

      {/* MINI STATS TERPADU */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Karyawan */}
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
              Total Karyawan
            </p>
            <p className="text-base font-black text-slate-900 dark:text-white truncate mt-0.5 font-mono">
              {totalUsers} Personel
            </p>
          </div>
        </div>

        {/* Status Aktif */}
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
              Status Aktif
            </p>
            <p className="text-base font-black text-slate-900 dark:text-white truncate mt-0.5 font-mono">
              {activeUsers} Hadir
            </p>
          </div>
        </div>

        {/* Sedang Cuti */}
        <div className="p-4 bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm flex items-center gap-3 relative overflow-hidden">
          {onLeaveUsers > 0 && (
            <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500 animate-pulse" />
          )}
          <div
            className={`p-3 rounded-xl shrink-0 ${
              onLeaveUsers > 0
                ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800"
            }`}
          >
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
              Sedang Cuti
            </p>
            <p
              className={`text-base font-black truncate mt-0.5 font-mono ${
                onLeaveUsers > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-slate-900 dark:text-white"
              }`}
            >
              {onLeaveUsers} Orang
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
            placeholder="Cari ID, nama, atau email karyawan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-transparent text-slate-900 dark:text-slate-200 text-xs outline-none placeholder:text-slate-400"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full sm:w-64 px-4 py-2.5 bg-transparent text-slate-700 dark:text-slate-300 text-xs outline-none cursor-pointer font-bold uppercase tracking-wider appearance-none"
          style={{
            backgroundImage:
              'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
            backgroundSize: "1em",
          }}
        >
          <option value="All">Semua Peran (Role)</option>
          {uniqueRoles.map((r, idx) => (
            <option key={idx} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* TABEL KARYAWAN */}
      <div className="rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-4 px-6 rounded-tl-3xl">Profil & ID</th>
                <th className="py-4 px-6">Kontak Akses</th>
                <th className="py-4 px-6">Status Kehadiran & Cuti</th>
                <th className="py-4 px-6">Role & Status Akun</th>
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
                  filteredData.map((user) => (
                    <motion.tr
                      key={user.id}
                      variants={tableRowVariants}
                      layout
                      className="hover:bg-white dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* PROFIL & ID */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#011D58] to-[#022b82] text-white flex items-center justify-center font-black text-xs shadow-md shrink-0 border border-white/20">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white text-xs group-hover:text-[#FA4D09] dark:group-hover:text-[#FF9F03] transition-colors">
                              {user.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700">
                                {user.id}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* KONTAK */}
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                          {user.email}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {user.phone || "-"}
                        </p>
                      </td>

                      {/* CUTI */}
                      <td className="py-4 px-6">
                        {user.isOnLeave ? (
                          <div className="flex flex-col items-start gap-1">
                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Sedang Cuti
                            </span>
                            <p className="text-[10px] text-slate-400">
                              Sisa Kuota:{" "}
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                                {user.annualLeaveQuota} Hari
                              </span>
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-start gap-1">
                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider">
                              Hadir (Bekerja)
                            </span>
                            <p className="text-[10px] text-slate-400">
                              Sisa Kuota:{" "}
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                                {user.annualLeaveQuota} Hari
                              </span>
                            </p>
                          </div>
                        )}
                      </td>

                      {/* ROLE & STATUS AKUN */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col items-start gap-1">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                            {user.role}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                              user.status === "Active"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                user.status === "Active"
                                  ? "bg-emerald-500"
                                  : "bg-rose-500"
                              }`}
                            />
                            {user.status === "Active"
                              ? "Akun Aktif"
                              : "Nonaktif"}
                          </span>
                        </div>
                      </td>

                      {/* AKSI */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditUser(user)}
                            className="p-1.5 text-slate-400 hover:text-[#011D58] dark:hover:text-[#FF9F03] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Edit Karyawan"
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
                            onClick={() => setUserToDelete(user)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Karyawan"
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
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-slate-900 dark:text-white font-bold mb-1 text-sm">
                        Karyawan Tidak Ditemukan
                      </p>
                      <p className="text-xs text-slate-500 mb-4">
                        Tidak ada data karyawan yang cocok dengan kueri pencarian Anda.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setRoleFilter("All");
                        }}
                        className="px-4 py-2 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#011D58]/20 cursor-pointer"
                      >
                        Reset Pencarian
                      </button>
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
        {userToDelete && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setUserToDelete(null)}
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
                Hapus Data Karyawan?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Anda yakin ingin menghapus data karyawan{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  "{userToDelete.name}"
                </span>{" "}
                (<span className="font-mono text-slate-500">{userToDelete.id}</span>)?
                Akses login dan riwayat akun akan terhapus.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
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
          <AddUserModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSuccess={handleSuccess}
            showToast={showToast}
          />
        )}
        {editUser && (
          <EditUserModal
            isOpen={!!editUser}
            onClose={() => setEditUser(null)}
            data={editUser}
            onSuccess={handleSuccess}
            showToast={showToast}
          />
        )}
      </AnimatePresence>
    </div>
  );
}