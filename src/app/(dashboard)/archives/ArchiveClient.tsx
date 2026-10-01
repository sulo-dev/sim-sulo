"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { deleteArchive } from "@/actions/archiveActions";
import AddArchiveModal from "@/components/AddArchiveModal";
import EditArchiveModal from "@/components/EditArchiveModal";

type ArchiveData = {
  id: number;
  category: string;
  websiteId: number | null;
  title: string;
  fileUrl: string;
  fileExtension: string;
  fileSize: string;
  uploadedBy: string;
  uploadDate: string;
  websiteName?: string;
};

type WebsiteData = { id: number; name: string };

type Props = {
  initialData: ArchiveData[];
  websites: WebsiteData[];
};

// Kategori Folders Sesuai Skema Database v2.4
const FOLDERS = [
  "Semua Arsip",
  "Legalitas PT",
  "SOP Perusahaan",
  "Dokumen Proyek",
  "Tender & Penawaran",
];

// Helper Penentu Ikon & Warna File Berdasarkan Ekstensi
const getFileIcon = (ext: string) => {
  const e = (ext || "").toLowerCase();
  if (e.includes("pdf"))
    return {
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20",
      label: "PDF",
    };
  if (e.includes("doc"))
    return {
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20",
      label: "DOC",
    };
  if (e.includes("xls"))
    return {
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
      label: "XLS",
    };
  if (e.includes("zip") || e.includes("rar"))
    return {
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
      label: "ZIP",
    };
  if (e.includes("png") || e.includes("jpg") || e.includes("jpeg"))
    return {
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20",
      label: "IMG",
    };
  return {
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
    label: "FILE",
  };
};

// Varian Animasi Grid
const gridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export default function ArchiveClient({ initialData, websites }: Props) {
  const router = useRouter();

  const [activeFolder, setActiveFolder] = useState("Semua Arsip");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ArchiveData | null>(null);

  // Custom Delete Modal State
  const [docToDelete, setDocToDelete] = useState<ArchiveData | null>(null);
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

  // Hitung Jumlah File per Folder
  const getFolderCount = (folderName: string) => {
    if (folderName === "Semua Arsip") return initialData.length;
    return initialData.filter((i) => i.category === folderName).length;
  };

  // Filter Data Berdasarkan Folder & Pencarian
  const filteredData = initialData.filter((item) => {
    const matchesFolder =
      activeFolder === "Semua Arsip" || item.category === activeFolder;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.websiteName?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      );
    return matchesFolder && matchesSearch;
  });

  // Helper Format Tanggal
  const formatSafeDate = (dateVal: string) => {
    if (!dateVal || dateVal === "-") return "-";
    try {
      const cleanDateStr = dateVal.includes("T")
        ? dateVal.split("T")[0]
        : dateVal;
      const d = new Date(cleanDateStr);
      if (isNaN(d.getTime())) return dateVal;
      return d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateVal;
    }
  };

  // Eksekusi Hapus Dokumen
  const executeDelete = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);

    const res = await deleteArchive(
      docToDelete.id,
      docToDelete.fileUrl,
      docToDelete.websiteId
    );
    if (res.success) {
      triggerNotification(`Dokumen "${docToDelete.title}" berhasil dihapus.`);
      setDocToDelete(null);
      router.refresh();
    } else {
      triggerNotification(`Gagal menghapus file: ${res.message}`, "error");
    }
    setIsDeleting(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative pb-10">
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

      {/* HEADER UTAMA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#011D58] dark:bg-[#FF9F03] rounded-2xl flex items-center justify-center shadow-lg text-white dark:text-slate-900 shrink-0 border border-[#011D58]/20 dark:border-[#FF9F03]/30">
            <svg
              className="w-6 h-6 sm:w-7 sm:h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FC7A0B]/10 text-[#FC7A0B] border border-[#FC7A0B]/20">
                SULO-MIS Document Archive
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Arsip & <span className="text-[#FA4D09] dark:text-[#FF9F03]">Legalitas Sentral</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Manajemen berkas, dokumen legal PT SULO, dan arsip proyek terpusat.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
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
              placeholder="Cari berkas dokumen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-[#FC7A0B] text-slate-700 dark:text-slate-200 font-medium transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-[#011D58]/20 flex items-center gap-2 shrink-0 transition-all active:scale-95 cursor-pointer"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            <span className="hidden sm:inline">Upload Dokumen</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* SIDEBAR FOLDERS */}
        <div className="w-full lg:w-64 shrink-0 bg-white/70 dark:bg-slate-900/80 p-3 rounded-3xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-xl shadow-sm flex lg:flex-col gap-1.5 overflow-x-auto">
          {FOLDERS.map((folder) => {
            const count = getFolderCount(folder);
            const isActive = activeFolder === folder;
            return (
              <button
                key={folder}
                type="button"
                onClick={() => setActiveFolder(folder)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl font-bold text-xs tracking-wide transition-all whitespace-nowrap lg:whitespace-normal cursor-pointer ${
                  isActive
                    ? "bg-[#011D58] dark:bg-[#FF9F03] text-white dark:text-slate-950 shadow-md shadow-[#011D58]/15 dark:shadow-none"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <svg
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? "text-[#FC7A0B] dark:text-slate-900"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  <span className="truncate">{folder}</span>
                </div>
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                    isActive
                      ? "bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* GRID DOKUMEN */}
        <div className="flex-1 w-full">
          {filteredData.length > 0 ? (
            <motion.div
              variants={gridVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredData.map((doc) => {
                  const iconStyle = getFileIcon(doc.fileExtension);
                  return (
                    <motion.div
                      key={doc.id}
                      variants={cardVariants}
                      layout
                      className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-[#FC7A0B]/40 transition-all group flex flex-col h-full relative overflow-hidden backdrop-blur-xl"
                    >
                      {/* Top Action & Icon */}
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs border ${iconStyle.bg} ${iconStyle.color} shrink-0 shadow-sm`}
                        >
                          {iconStyle.label}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setEditItem(doc)}
                            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-[#011D58] hover:text-white text-slate-500 rounded-xl transition-colors cursor-pointer"
                            title="Edit Arsip"
                          >
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
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDocToDelete(doc)}
                            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-500 rounded-xl transition-colors cursor-pointer"
                            title="Hapus Arsip"
                          >
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Detail Title */}
                      <div className="flex-1 mb-6">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm font-extrabold text-slate-900 dark:text-white hover:text-[#FA4D09] dark:hover:text-[#FF9F03] line-clamp-2 transition-colors leading-snug"
                        >
                          {doc.title}
                        </a>
                        <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mt-2 tracking-wider flex items-center gap-1.5 flex-wrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FC7A0B]" />
                          <span>{doc.category}</span>
                          {doc.websiteName && (
                            <>
                              <span className="text-slate-300 dark:text-slate-700">
                                •
                              </span>
                              <span className="text-slate-600 dark:text-slate-400 font-semibold">
                                {doc.websiteName}
                              </span>
                            </>
                          )}
                        </p>
                      </div>

                      {/* Footer Metadata */}
                      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <div>
                          <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">
                            Ukuran / Tanggal
                          </p>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                            {doc.fileSize} • {formatSafeDate(doc.uploadDate)}
                          </span>
                        </div>
                        {doc.fileUrl && (
                          <a
                            href={
                              doc.fileUrl.includes("vercel-storage")
                                ? `${doc.fileUrl}?download=1`
                                : doc.fileUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#011D58] hover:text-white dark:hover:bg-[#FF9F03] dark:hover:text-slate-950 text-slate-600 dark:text-slate-300 transition-colors shadow-sm"
                            title="Unduh File"
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
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                          </a>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="bg-white/40 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-16 flex flex-col items-center justify-center text-center backdrop-blur-md">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-400 shadow-inner">
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
                    d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Folder Dokumen Kosong
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                Belum ada berkas ditemukan dalam kategori atau kueri pencarian ini.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL KONFIRMASI HAPUS */}
      <AnimatePresence>
        {docToDelete && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setDocToDelete(null)}
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
                Hapus Berkas Dokumen?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Anda yakin ingin menghapus berkas{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  "{docToDelete.title}"
                </span>{" "}
                dari arsip? File fisik juga akan terhapus secara permanen.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setDocToDelete(null)}
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
          <AddArchiveModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            websites={websites}
            onSuccess={() => {
              triggerNotification("Dokumen baru berhasil diunggah!");
              router.refresh();
            }}
          />
        )}

        {editItem && (
          <EditArchiveModal
            isOpen={!!editItem}
            onClose={() => setEditItem(null)}
            websites={websites}
            data={editItem}
            onSuccess={() => {
              triggerNotification("Data dokumen berhasil diperbarui!");
              router.refresh();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}