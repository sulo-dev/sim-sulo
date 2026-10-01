"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import EditWebsiteModal from "@/components/EditWebsiteModal";
import { deleteWebsite } from "@/actions/websiteActions";
import {
  createCredential,
  deleteCredential,
} from "@/actions/credentialActions";

import AddArchiveModal from "@/components/AddArchiveModal";
import EditArchiveModal from "@/components/EditArchiveModal";
import { deleteArchive } from "@/actions/archiveActions";

type ArchiveData = {
  id: number;
  title: string;
  category: string;
  uploadedAt: string;
  fileUrl: string;
};

type CredentialData = {
  id: number;
  category: string;
  username: string;
  password?: string;
  accessUrl?: string;
  title?: string;
  notes?: string;
};

type ClientDropdown = { id: number; companyName: string };

type WebsiteDetailProps = {
  website: {
    id: number;
    name: string;
    status: string;
    clientId: number;
    clientName: string;
    techStack: string;
    productionUrl: string;
    archives: ArchiveData[];
    credentials: CredentialData[];
  } | null;
  allClients: ClientDropdown[];
};

// Framer Motion Variants
const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function WebsiteDetailClient({
  website,
  allClients,
}: WebsiteDetailProps) {
  const router = useRouter();

  // STATE: Tab Navigation
  const [activeTab, setActiveTab] = useState<"vault" | "archives">("vault");

  // State Modals Proyek
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // State Modals Arsip / File Manager
  const [isAddArchiveModalOpen, setIsAddArchiveModalOpen] = useState(false);
  const [archiveToEdit, setArchiveToEdit] = useState<ArchiveData | null>(null);
  const [archiveToDelete, setArchiveToDelete] = useState<ArchiveData | null>(
    null
  );
  const [isDeletingArchive, setIsDeletingArchive] = useState(false);

  // State Modals & Vault Kredensial
  const [isAddCredModalOpen, setIsAddCredModalOpen] = useState(false);
  const [credToDelete, setCredToDelete] = useState<number | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<
    Record<number, boolean>
  >({});
  const [isAddingCred, setIsAddingCred] = useState(false);
  const [newCred, setNewCred] = useState({
    category: "cPanel",
    username: "",
    password: "",
    accessUrl: "",
    title: "",
    notes: "",
  });

  // State Toast Custom
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
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
  };

  // Toggle Sensor Password
  const togglePasswordVisibility = (id: number) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Copy to Clipboard
  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast(`${label} berhasil disalin ke clipboard!`, "success");
  };

  // Action: Tambah Kredensial
  const handleAddCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!website) return;

    if (!newCred.username) {
      showToast("Username / ID wajib diisi!", "error");
      return;
    }

    setIsAddingCred(true);
    const res = await createCredential(website.id, newCred);
    setIsAddingCred(false);

    if (res.success) {
      showToast(res.message, "success");
      setIsAddCredModalOpen(false);
      setNewCred({
        category: "cPanel",
        username: "",
        password: "",
        accessUrl: "",
        title: "",
        notes: "",
      });
      router.refresh();
    } else {
      showToast(res.message, "error");
    }
  };

  // Action: Hapus Kredensial
  const handleDeleteCred = async (credId: number) => {
    if (!website) return;
    const res = await deleteCredential(credId, website.id);
    if (res.success) {
      showToast(res.message, "success");
      setCredToDelete(null);
      router.refresh();
    } else {
      showToast(res.message, "error");
    }
  };

  // Action: Unduh Arsip
  const handleDownloadArchive = (docName: string, fileUrl: string) => {
    if (!fileUrl) return showToast("Tautan file tidak tersedia.", "error");
    showToast(`Mengunduh berkas "${docName}"...`, "success");
    const downloadUrl = fileUrl.includes("vercel-storage.com")
      ? `${fileUrl}?download=1`
      : fileUrl;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = docName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Action: Eksekusi Hapus Arsip
  const executeDeleteArchive = async () => {
    if (!archiveToDelete || !website) return;
    setIsDeletingArchive(true);
    const res = await deleteArchive(archiveToDelete.id, archiveToDelete.fileUrl);
    if (res.success) {
      showToast(`Arsip "${archiveToDelete.title}" berhasil dihapus.`, "success");
      setArchiveToDelete(null);
      router.refresh();
    } else {
      showToast("Gagal menghapus arsip: " + res.message, "error");
    }
    setIsDeletingArchive(false);
  };

  // Action: Eksekusi Hapus Proyek (Website)
  const executeDeleteWebsite = async () => {
    if (!website) return;
    setIsDeleting(true);
    const res = await deleteWebsite(website.id);
    if (res.success) {
      sessionStorage.setItem(
        "sulo-toast-success",
        `Proyek ${website.name} telah dihapus permanen.`
      );
      router.push("/websites");
    } else {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      showToast("Gagal menghapus: " + res.message, "error");
    }
  };

  // Empty State untuk Proyek Tidak Ditemukan
  if (!website) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 border-dashed rounded-3xl p-8 max-w-2xl mx-auto backdrop-blur-xl my-8">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400 shadow-inner">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
          Proyek Tidak Ditemukan
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
          Data website yang Anda cari mungkin telah dihapus permanen dari sistem SULO-MIS.
        </p>
        <Link
          href="/websites"
          className="px-6 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#011D58]/20 transition-all"
        >
          Kembali ke Direktori Proyek
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative pb-12">
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

      {/* Breadcrumbs Navigasi */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium bg-white/50 dark:bg-slate-900/50 w-max px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
        <Link
          href="/websites"
          className="hover:text-[#FA4D09] dark:hover:text-[#FF9F03] transition-colors flex items-center gap-1.5"
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
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
          Proyek Website
        </Link>
        <span className="opacity-40">/</span>
        <span className="text-slate-900 dark:text-slate-200 font-bold">
          {website.name}
        </span>
      </div>

      {/* Hero Card Profile Website */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#FC7A0B]/10 to-transparent dark:from-[#FC7A0B]/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex items-center gap-5 relative z-10">
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-br from-[#011D58] to-[#FC7A0B] shadow-inner flex items-center justify-center text-white text-3xl font-black uppercase ring-4 ring-white dark:ring-slate-900 shrink-0">
            {website.name.charAt(0)}
          </div>
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {website.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                  website.status === "Active"
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                    : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                }`}
              >
                {website.status === "Active" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
                {website.status}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Terdaftar di SULO-MIS
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Header */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10 w-full lg:w-auto mt-2 lg:mt-0">
          {website.productionUrl && (
            <a
              href={
                website.productionUrl.startsWith("http")
                  ? website.productionUrl
                  : `https://${website.productionUrl}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 lg:flex-none justify-center px-4 py-2.5 bg-white dark:bg-slate-800 hover:text-[#FA4D09] dark:hover:text-[#FF9F03] text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-sm transition-all"
            >
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Kunjungi Web
            </a>
          )}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="flex-1 lg:flex-none justify-center px-4 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 transition-colors shadow-md shadow-[#011D58]/20"
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
            Edit Proyek
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
            title="Hapus Permanen"
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
      </div>

      {/* Mini Metric Cards Informasi (3 Kolom) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href={`/clients/${website.clientId}`}
          className="block h-full group"
        >
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm group-hover:border-[#FC7A0B]/40 transition-colors h-full">
            <span className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl shrink-0 group-hover:bg-[#FC7A0B]/10 group-hover:text-[#FC7A0B] transition-colors">
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
            <div className="overflow-hidden">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">
                Kepemilikan Klien
              </p>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate group-hover:text-[#FC7A0B] transition-colors">
                {website.clientName}
              </p>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
          <span className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
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
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </span>
          <div className="overflow-hidden">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">
              Tech Stack Utama
            </p>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate">
              {website.techStack || "Tidak diatur"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
          <span className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl shrink-0">
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
                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
              />
            </svg>
          </span>
          <div className="overflow-hidden">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">
              ID Sistem (SULO-MIS)
            </p>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate font-mono">
              WEB-{website.id.toString().padStart(4, "0")}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigasi dengan Animated Sliding Indicator */}
      <div className="flex justify-start pt-2">
        <div className="relative flex gap-1 bg-white/70 dark:bg-slate-900/70 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm overflow-x-auto custom-scrollbar w-full sm:w-auto">
          {(["vault", "archives"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`relative flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors z-10 whitespace-nowrap ${
                activeTab === tab
                  ? "text-[#011D58] dark:text-[#FF9F03]"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeDetailTabIndicator"
                  className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 -z-10"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              {tab === "vault" &&
                `🔐 Brankas Kredensial (${website.credentials?.length || 0})`}
              {tab === "archives" &&
                `📁 Arsip & Berkas Proyek (${website.archives?.length || 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* KONTEN TAB ACTIVE */}
      <AnimatePresence mode="wait">
        {/* TAB 1: BRANKAS KREDENSIAL */}
        {activeTab === "vault" && (
          <motion.div
            key="vault"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 pt-2"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Akses & Kredensial Sistem
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Penyimpanan rahasia sandi cPanel, Database, VPS, dan repositori proyek.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCredModalOpen(true)}
                className="px-4 py-2 bg-[#FC7A0B] hover:bg-[#FC7A0B]/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
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
                Tambah Kredensial
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {website.credentials && website.credentials.length > 0 ? (
                website.credentials.map((cred) => {
                  const isShowPass = !!visiblePasswords[cred.id];

                  return (
                    <div
                      key={cred.id}
                      className="p-5 bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-[#FC7A0B]/40 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Header Card Akses */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase tracking-wider rounded-md border border-blue-100 dark:border-blue-500/20 inline-block mb-1">
                              {cred.category}
                            </span>
                            <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-[#FA4D09] dark:group-hover:text-[#FF9F03] transition-colors">
                              {cred.title || cred.category}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {cred.accessUrl && (
                              <a
                                href={
                                  cred.accessUrl.startsWith("http")
                                    ? cred.accessUrl
                                    : `https://${cred.accessUrl}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-slate-400 hover:text-[#011D58] dark:hover:text-blue-400 rounded-lg transition-colors"
                                title="Buka URL Akses"
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
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => setCredToDelete(cred.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Hapus Kredensial"
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
                        </div>

                        {/* Detail Fields */}
                        <div className="space-y-2.5 text-xs">
                          {/* Username / ID */}
                          <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="overflow-hidden">
                              <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">
                                Username / ID
                              </p>
                              <p className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                                {cred.username}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(cred.username, "Username")
                              }
                              className="p-2 text-slate-400 hover:text-[#FC7A0B] bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 transition-colors shrink-0"
                              title="Salin Username"
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
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </button>
                          </div>

                          {/* Password dengan Sensor */}
                          <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="overflow-hidden">
                              <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">
                                Password / Secret
                              </p>
                              <p className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                                {isShowPass
                                  ? cred.password || "Tanpa Sandi"
                                  : "••••••••••••"}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  togglePasswordVisibility(cred.id)
                                }
                                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
                                title={
                                  isShowPass
                                    ? "Sembunyikan Password"
                                    : "Tampilkan Password"
                                }
                              >
                                {isShowPass ? (
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
                                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.016 10.016 0 013.682-.763c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18"
                                    />
                                  </svg>
                                ) : (
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
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopy(
                                    cred.password || "",
                                    "Password"
                                  )
                                }
                                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white bg-[#011D58] hover:bg-[#011D58]/90 rounded-lg shadow-sm transition-colors"
                              >
                                Salin
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-1 md:col-span-2 p-12 text-center bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    Brankas Kredensial Kosong
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Belum ada kredensial atau kunci akses yang tersimpan untuk proyek ini.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 2: ARSIP & BERKAS PROYEK */}
        {activeTab === "archives" && (
          <motion.div
            key="archives"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="pt-2 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Arsip & Berkas Proyek
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Penyimpanan BAST, Kontrak SPK, dan Panduan Teknis terintegrasi Arsip Sentral SULO.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddArchiveModalOpen(true)}
                className="px-4 py-2 bg-white dark:bg-slate-900 text-[#011D58] dark:text-white hover:text-[#FA4D09] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 shadow-sm shrink-0 cursor-pointer"
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
                Upload Arsip Baru
              </button>
            </div>

            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              <AnimatePresence>
                {website.archives && website.archives.length > 0 ? (
                  website.archives.map((archive) => (
                    <motion.div
                      key={archive.id}
                      variants={itemVariants}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm hover:border-[#FC7A0B]/40 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shrink-0">
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
                              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1 line-clamp-1">
                            {archive.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {archive.category}
                            </span>
                            <span>•</span>
                            <span>
                              {archive.uploadedAt
                                ? archive.uploadedAt.split("T")[0]
                                : "Baru Saja"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            handleDownloadArchive(
                              archive.title,
                              archive.fileUrl
                            )
                          }
                          title="Unduh Arsip"
                          className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-[#011D58] hover:text-white text-slate-600 dark:text-slate-300 rounded-xl transition-colors"
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
                        </button>
                        <button
                          type="button"
                          onClick={() => setArchiveToEdit(archive)}
                          title="Edit Info Arsip"
                          className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-[#FC7A0B] hover:text-white text-slate-600 dark:text-slate-300 rounded-xl transition-colors"
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
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setArchiveToDelete(archive)}
                          title="Hapus Arsip"
                          className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-rose-500 dark:text-rose-400 rounded-xl transition-colors"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-12 text-center bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                      Belum Ada Arsip Berkas
                    </h3>
                    <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                      Belum ada berkas kontrak, BAST, atau panduan teknis yang diunggah untuk proyek ini.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================= MODALS SYSTEM ======================= */}

      {/* 1. MODAL TAMBAH KREDENSIAL */}
      <AnimatePresence>
        {isAddCredModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddCredModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full z-10 border border-slate-200 dark:border-slate-800 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="p-1.5 bg-[#011D58] text-white rounded-lg text-xs">
                    🔐
                  </span>
                  Tambah Akses Kredensial
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddCredModalOpen(false)}
                  className="text-slate-400 hover:text-rose-500 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl transition-colors"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddCredential} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Judul Akses (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: cPanel Utama, Database PostgreSQL Production"
                    value={newCred.title}
                    onChange={(e) =>
                      setNewCred({ ...newCred, title: e.target.value })
                    }
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Kategori Akses *
                  </label>
                  <select
                    value={newCred.category}
                    onChange={(e) =>
                      setNewCred({ ...newCred, category: e.target.value })
                    }
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B] text-slate-900 dark:text-slate-200 font-medium"
                  >
                    <option value="cPanel">cPanel / Hosting</option>
                    <option value="Database">
                      Database (SQL / PostgreSQL)
                    </option>
                    <option value="VPS">VPS / SSH</option>
                    <option value="GitHub">Repository GitHub / GitLab</option>
                    <option value="Supabase">Supabase / Firebase</option>
                    <option value="Admin Panel">Admin Dashboard Utama</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Username / User ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: root / admin"
                    value={newCred.username}
                    onChange={(e) =>
                      setNewCred({ ...newCred, username: e.target.value })
                    }
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Password / Secret Key
                  </label>
                  <input
                    type="text"
                    placeholder="Kata sandi rahasia"
                    value={newCred.password}
                    onChange={(e) =>
                      setNewCred({ ...newCred, password: e.target.value })
                    }
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    URL Akses / Login Link (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://cpanel.klien.com:2083"
                    value={newCred.accessUrl}
                    onChange={(e) =>
                      setNewCred({ ...newCred, accessUrl: e.target.value })
                    }
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B] font-mono"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddCredModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingCred}
                    className="px-5 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-[#011D58]/20 flex items-center gap-2"
                  >
                    {isAddingCred ? "Menyimpan..." : "Simpan Kredensial"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. MODAL KONFIRMASI HAPUS KREDENSIAL */}
      <AnimatePresence>
        {credToDelete && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCredToDelete(null)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full z-10 border border-slate-200 dark:border-slate-800 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-500/20 shadow-inner">
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
                Hapus Kredensial Ini?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Akses sandi ini akan dihapus permanen dari brankas rahasia sistem.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setCredToDelete(null)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCred(credToDelete)}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20 transition-colors"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. MODALS ARSIP & PROYEK */}
      <AnimatePresence>
        {isAddArchiveModalOpen && (
          <AddArchiveModal
            isOpen={isAddArchiveModalOpen}
            onClose={() => setIsAddArchiveModalOpen(false)}
            websites={[website]}
            onSuccess={() => {
              showToast(
                "Arsip baru berhasil ditambahkan ke proyek!",
                "success"
              );
              router.refresh();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen && (
          <EditWebsiteModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            website={website}
            clients={allClients}
            onSuccess={() => {
              showToast("Detail Proyek berhasil diperbarui!", "success");
              router.refresh();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {archiveToEdit && (
          <EditArchiveModal
            isOpen={!!archiveToEdit}
            onClose={() => setArchiveToEdit(null)}
            data={archiveToEdit}
            onSuccess={() => {
              showToast("Info arsip berhasil diperbarui!", "success");
              router.refresh();
            }}
            websites={[website]}
          />
        )}
      </AnimatePresence>

      {/* MODAL KONFIRMASI HAPUS ARSIP */}
      <AnimatePresence>
        {archiveToDelete && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeletingArchive && setArchiveToDelete(null)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center z-10 shadow-2xl"
            >
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-500/20 shadow-inner">
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
                Hapus Arsip Berkas?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Arsip{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  "{archiveToDelete.title}"
                </span>{" "}
                akan dihapus selamanya dari penyimpanan cloud.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setArchiveToDelete(null)}
                  disabled={isDeletingArchive}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={executeDeleteArchive}
                  disabled={isDeletingArchive}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 disabled:opacity-70 transition-colors min-w-[110px]"
                >
                  {isDeletingArchive ? (
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

      {/* MODAL KONFIRMASI HAPUS PROYEK (WEBSITE) */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 text-center"
            >
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner border border-rose-200 dark:border-rose-500/20">
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                Hapus Proyek Website?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Anda yakin ingin menghapus permanen proyek{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  "{website.name}"
                </span>
                ? Seluruh kredensial dan arsip yang terhubung akan terhapus selamanya.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={executeDeleteWebsite}
                  disabled={isDeleting}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 min-w-[130px] disabled:opacity-70"
                >
                  {isDeleting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    "Ya, Hapus Permanen"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}