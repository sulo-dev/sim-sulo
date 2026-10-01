"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import EditClientModal from "@/components/EditClientModal";
import { deleteClient } from "@/actions/clientActions";
import { createMeetingLog, deleteMeetingLog } from "@/actions/meetingActions";

type WebsiteData = { id: number; name: string; status: string };
type DocumentData = { id: number; title: string; date: string; websiteName: string };
type MeetingData = { id: number; title: string; date: string; notes: string };

type ClientDetailProps = {
  client: {
    id: number;
    companyName: string;
    picName: string;
    email: string;
    phone: string;
    status: string;
    websites: WebsiteData[];
    documents: DocumentData[];
    meetings: MeetingData[];
  } | null;
  isInvalidId?: boolean;
};

// Framer Motion Variants
const tabVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

export default function ClientDetailClient({
  client,
  isInvalidId,
}: ClientDetailProps) {
  const router = useRouter();

  // State Caching Anti-Flash saat Klien Dihapus
  const [cachedClient, setCachedClient] = useState(client);
  const [activeTab, setActiveTab] = useState("websites");

  // State Modal & Aksi
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<
    "idle" | "deleting" | "success"
  >("idle");
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);

  // Form Log Meeting State
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    meetingDate: "",
    notes: "",
  });
  const [isSubmittingMeeting, setIsSubmittingMeeting] = useState(false);

  // Toast Notification State (Success & Error)
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  useEffect(() => {
    if (client) {
      setCachedClient(client);
    }
  }, [client]);

  const triggerNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      4000
    );
  };

  // Format link WhatsApp & Email
  const cleanPhone = cachedClient?.phone
    ? cachedClient.phone.replace(/\D/g, "")
    : "";
  const waLink = cleanPhone
    ? `https://wa.me/${
        cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone
      }`
    : null;

  const emailAddress = cachedClient?.email?.trim();
  const emailLink = emailAddress
    ? `mailto:${emailAddress}?subject=Follow-up%20Project%20-%20${encodeURIComponent(
        cachedClient?.companyName || ""
      )}`
    : null;

  // Handler Download MOCK PDF
  const handleDownloadPDF = (docName: string) => {
    setDownloadingDoc(docName);
    setTimeout(() => {
      const base64PDF =
        "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLU31jBQsTAz1LBSKUrnCtRTyuVJF/v//zwcsFADyCAsRCmVuZHN0cmVhbQplbmRvYmoKCjMgMCBvYmoKNDQKZW5kb2JqCgo0IDAgb2JqCjw8L0ZpbHRlci9GbGF0ZURlY29kZS9MZW5ndGggMTI4Pj5zdHJlYW0KeJwr5HIMclXIzdcvT01OzCtOtFJIyy9SqMsvVCjJV0gqSC0qzy8t0gEKWxlYcIXkKyTml2QoRBVnJmfmKVQGFOeUpgYV6wF5ZRCVhnqGQAEGhtAAkK+XnF+SkamXmFuQk1qkr2BgoFBaUqwPNAiUBwB+EyFmCmVuZHN0cmVhbQplbmRvYmoKCjUgMCBvYmoKPDwvQ29udGVudHMgNCAwIFIvVHlwZS9QYWdlL1Jlc291cmNlczw8L1Byb2NTZXRbL1BERi9UZXh0L0ltYWdlQi9JbWFnZUMvSW1hZ2VJXS9Gb250PDwvRjEgMiAwIFI+Pj4+L1BhcmVudCAxIDAgUi9NZWRpYUJveFswIDAgNTk1LjI4IDg0MS44OV0+PgplbmRvYmoKCjEgMCBvYmoKPDwvVHlwZS9QYWdlcy9Db3VudCAxL0tpZHNbNSAwIFJdPj4KZW5kb2JqCgo2IDAgb2JqCjw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAxIDAgUj4+CmVuZG9iagoKNyAwIG9iago8PC9DcmVhdG9yKFBERi5qcykvUHJvZHVjZXIoUERGLjsyKS9DcmVhdGlvbkRhdGUoRDoyMDI2MDkxMTAwMDAwMFopPj4KZW5kb2JqCgp4cmVmCjAgOAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDA0MDYgMDAwMDAgbiAKMDAwMDAwMDE2MyAwMDAwMCBuIAowMDAwMDAwMjU5IDAwMDAwIG4gCjAwMDAwMDAzNTkgMDAwMDAgbiAKMDAwMDAwMDQ2MyAwMDAwMCBuIAowMDAwMDAwNjI4IDAwMDAwIG4gCjAwMDAwMDA2ODQgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDgvUm9vdCA2IDAgUi9JbmZvIDcgMCBSPj4Kc3RhcnR4cmVmCjc5MQolJUVPRgo=";
      const byteCharacters = atob(base64PDF);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${docName.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setDownloadingDoc(null);
      triggerNotification(`Dokumen "${docName}" berhasil diunduh.`);
    }, 1200);
  };

  // Handler Hapus Klien
  const handleDeleteClient = async () => {
    if (!cachedClient) return;
    setDeleteStatus("deleting");

    const res = await deleteClient(cachedClient.id);

    if (res.success) {
      setDeleteStatus("success");
      sessionStorage.setItem(
        "sulo-toast-success",
        "Data klien berhasil dihapus secara permanen."
      );
      setTimeout(() => router.push("/clients"), 800);
    } else {
      setDeleteStatus("idle");
      triggerNotification(
        res.message || "Gagal menghapus data klien dari database.",
        "error"
      );
    }
  };

  const handleCloseDeleteModal = () => {
    if (deleteStatus === "deleting") return;
    setIsDeleteModalOpen(false);
    setTimeout(() => setDeleteStatus("idle"), 300);
  };

  // Handler Submit Log Meeting
  const handleSubmitMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cachedClient) return;
    setIsSubmittingMeeting(true);

    const res = await createMeetingLog({
      clientId: cachedClient.id,
      ...meetingForm,
    });

    if (res.success) {
      setIsMeetingModalOpen(false);
      setMeetingForm({ title: "", meetingDate: "", notes: "" });
      triggerNotification("Catatan meeting berhasil disimpan.");
      router.refresh();
    } else {
      triggerNotification(
        res.message || "Gagal menyimpan catatan meeting.",
        "error"
      );
    }
    setIsSubmittingMeeting(false);
  };

  // Handler Hapus Log Meeting
  const handleDeleteMeeting = async (meetingId: number) => {
    if (!cachedClient) return;

    const res = await deleteMeetingLog(meetingId, cachedClient.id);
    if (res.success) {
      triggerNotification("Catatan meeting berhasil dihapus.");
      router.refresh();
    } else {
      triggerNotification(
        res.message || "Gagal menghapus catatan meeting.",
        "error"
      );
    }
  };

  // Pengecekan Klien Tidak Ditemukan
  if (!cachedClient || isInvalidId) {
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
          {isInvalidId ? "ID Klien Tidak Valid" : "Klien Tidak Ditemukan"}
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
          {isInvalidId
            ? "Pastikan URL menggunakan format nomor identifikasi klien yang benar."
            : "Data profil klien yang Anda cari mungkin telah dihapus permanen."}
        </p>
        <Link
          href="/clients"
          className="px-6 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#011D58]/20 transition-all"
        >
          Kembali ke Direktori Klien
        </Link>
      </div>
    );
  }

  const isProspect = cachedClient.status.toLowerCase() === "prospek";

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative pb-10">
      {/* Breadcrumbs Navigasi */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium bg-white/50 dark:bg-slate-900/50 w-max px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
        <Link
          href="/clients"
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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          Klien
        </Link>
        <span className="opacity-40">/</span>
        <span className="text-slate-900 dark:text-slate-200 font-bold">
          {cachedClient.companyName}
        </span>
      </div>

      {/* Hero Card Profile Klien */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow Latar Belakang */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#011D58]/10 to-[#FC7A0B]/10 dark:from-[#011D58]/20 dark:to-[#FF9F03]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        {/* Logo Avatar & Detail Utama */}
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-br from-[#011D58] to-[#022b82] dark:from-slate-800 dark:to-slate-900 shadow-inner flex items-center justify-center text-white text-3xl font-black uppercase ring-4 ring-white dark:ring-slate-900 shrink-0">
            {cachedClient.companyName.charAt(0)}
          </div>
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {cachedClient.companyName}
            </h2>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                  isProspect
                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20"
                    : cachedClient.status === "Active"
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                }`}
              >
                {cachedClient.status === "Active" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
                {isProspect && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                )}
                {cachedClient.status}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10 w-full lg:w-auto mt-2 lg:mt-0">
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 lg:flex-none justify-center flex px-4 py-2.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl border border-emerald-200/80 dark:border-emerald-500/20 items-center gap-2 transition-all shadow-sm"
            >
              💬 WhatsApp
            </a>
          )}

          {emailLink && (
            <a
              href={emailLink}
              className="flex-1 lg:flex-none justify-center flex px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-200 dark:border-slate-700 items-center gap-2 transition-all shadow-sm"
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
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Email
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
            Edit Klien
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
            title="Hapus Klien"
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

      {/* Grid Informasi Metrik Mini (4 Kolom) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </span>
          <div className="overflow-hidden">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">
              Email Kontak
            </p>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate">
              {cachedClient.email || "Tidak diatur"}
            </p>
          </div>
        </div>

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
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </span>
          <div className="overflow-hidden">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">
              No. WhatsApp PIC
            </p>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate font-mono">
              {cachedClient.phone || "Belum diatur"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
          <span className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </span>
          <div className="overflow-hidden">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">
              Penanggung Jawab
            </p>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate">
              {cachedClient.picName || "Tidak diatur"}
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
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </span>
          <div className="overflow-hidden">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">
              ID Klien Sistem
            </p>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate font-mono">
              SULO-CL-{cachedClient.id.toString().padStart(4, "0")}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigasi dengan Animated Sliding Highlight */}
      <div className="flex justify-start">
        <div className="relative flex gap-1 bg-white/70 dark:bg-slate-900/70 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm overflow-x-auto custom-scrollbar w-full sm:w-auto">
          {["websites", "contracts", "meetings"].map((tab) => (
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
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 -z-10"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              {tab === "websites" &&
                `Proyek Website (${cachedClient.websites.length})`}
              {tab === "contracts" &&
                `Dokumen & Kontrak (${cachedClient.documents.length})`}
              {tab === "meetings" &&
                `Log Meeting (${cachedClient.meetings.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Konten Tabs Active */}
      <AnimatePresence mode="wait">
        {/* TAB 1: WEBSITES */}
        {activeTab === "websites" && (
          <motion.div
            key="websites"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {cachedClient.websites.length > 0 ? (
              cachedClient.websites.map((web) => (
                <Link key={web.id} href={`/websites/${web.id}`}>
                  <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 hover:border-[#FC7A0B]/40 cursor-pointer group flex justify-between items-center shadow-sm hover:shadow-xl hover:shadow-[#FC7A0B]/5 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#011D58]/10 dark:bg-slate-800 text-[#011D58] dark:text-[#FF9F03] rounded-2xl group-hover:bg-[#FC7A0B]/10 group-hover:text-[#FC7A0B] transition-colors">
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
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#FA4D09] dark:group-hover:text-[#FF9F03] transition-colors mb-1">
                          {web.name}
                        </h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                          {web.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-slate-300 dark:text-slate-600 group-hover:text-[#FA4D09] dark:group-hover:text-[#FF9F03] transition-colors group-hover:translate-x-1 duration-300">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))
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
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Belum Ada Proyek
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Klien ini belum memiliki proyek website aktif yang terhubung.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: KONTRAK / DOKUMEN */}
        {activeTab === "contracts" && (
          <motion.div
            key="contracts"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            {cachedClient.documents.length > 0 ? (
              cachedClient.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 rounded-2xl flex items-center justify-center shrink-0">
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
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                        {doc.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {doc.websiteName}
                        </span>
                        <span>•</span>
                        <span>{doc.date}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownloadPDF(doc.title)}
                    disabled={downloadingDoc === doc.title}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#FC7A0B]/50 hover:bg-[#FC7A0B]/5 dark:hover:bg-[#FF9F03]/10 text-slate-700 dark:text-slate-300 hover:text-[#FC7A0B] dark:hover:text-[#FF9F03] text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {downloadingDoc === doc.title ? (
                      <>
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        <span>Mengunduh...</span>
                      </>
                    ) : (
                      <>
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
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        <span>Unduh PDF</span>
                      </>
                    )}
                  </button>
                </div>
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
                  Tidak Ada Dokumen
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Belum ada dokumen atau kontrak resmi yang diunggah untuk klien ini.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: LOG MEETINGS */}
        {activeTab === "meetings" && (
          <motion.div
            key="meetings"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-white/70 dark:bg-slate-900/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-[#FC7A0B]/10 text-[#FC7A0B] rounded-xl">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Riwayat Komunikasi & Meeting
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Catat risalah rapat, diskusi prospek, dan tindakan lanjutan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMeetingModalOpen(true)}
                className="px-4 py-2 bg-[#FC7A0B] hover:bg-[#FC7A0B]/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
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
                Catat Meeting
              </button>
            </div>

            {/* Vertical Timeline View */}
            {cachedClient.meetings.length > 0 ? (
              <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 sm:ml-5 space-y-6 pb-2">
                {cachedClient.meetings.map((meeting) => (
                  <div key={meeting.id} className="relative pl-6 sm:pl-8 group">
                    <span className="absolute -left-[9px] sm:-left-[11px] top-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white dark:bg-slate-900 border-4 border-[#011D58] dark:border-[#FF9F03] group-hover:scale-125 transition-transform duration-300" />

                    <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <h4 className="font-black text-slate-900 dark:text-white text-base leading-tight">
                          {meeting.title}
                        </h4>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            {meeting.date}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteMeeting(meeting.id)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Hapus Log Meeting"
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
                      <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 font-medium">
                        {meeting.notes}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Belum Ada Log Meeting
                </h3>
                <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                  Riwayat komunikasi, kesimpulan rapat, dan rencana aksi mendatang dengan klien ini akan dicatat di sini.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Tambah Meeting */}
      <AnimatePresence>
        {isMeetingModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMeetingModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full z-10 border border-slate-200 dark:border-slate-800/80 overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Catat Meeting Baru
                </h3>
                <button
                  type="button"
                  onClick={() => setIsMeetingModalOpen(false)}
                  className="text-slate-400 hover:text-rose-500 bg-slate-200/50 dark:bg-slate-800 p-2 rounded-xl transition-colors"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitMeeting} noValidate className="p-6 space-y-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Judul / Topik Meeting <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={meetingForm.title}
                    onChange={(e) =>
                      setMeetingForm({ ...meetingForm, title: e.target.value })
                    }
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B] outline-none transition-all"
                    placeholder="Contoh: Diskusi Negosiasi Kontrak Q3"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Tanggal & Waktu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="datetime-local"
                    value={meetingForm.meetingDate}
                    onChange={(e) =>
                      setMeetingForm({ ...meetingForm, meetingDate: e.target.value })
                    }
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B] outline-none transition-all dark:[color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Catatan / Risalah Meeting <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={meetingForm.notes}
                    onChange={(e) =>
                      setMeetingForm({ ...meetingForm, notes: e.target.value })
                    }
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-[#FC7A0B]/30 focus:border-[#FC7A0B] outline-none transition-all resize-none"
                    placeholder="Tuliskan poin hasil diskusi atau keputusan rapat..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsMeetingModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingMeeting}
                    className="px-5 py-2.5 bg-[#011D58] hover:bg-[#011D58]/90 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-[#011D58]/20 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmittingMeeting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      "Simpan Catatan"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Edit Klien */}
      <AnimatePresence>
        {isEditModalOpen && (
          <EditClientModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={() => {
              triggerNotification("Perubahan data klien berhasil disimpan.");
              router.refresh();
            }}
            client={cachedClient}
          />
        )}
      </AnimatePresence>

      {/* Modal Hapus Klien dengan Inline Success State */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDeleteModal}
              className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full z-10 border border-slate-200 dark:border-slate-800/80 overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {deleteStatus !== "success" ? (
                  <motion.div
                    key="confirm-delete"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 text-center"
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
                      Hapus Profil Klien Ini?
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                      Semua proyek website, dokumen, dan riwayat terkait{" "}
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {cachedClient.companyName}
                      </span>{" "}
                      akan dihapus secara permanen dari server.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        type="button"
                        onClick={handleCloseDeleteModal}
                        disabled={deleteStatus === "deleting"}
                        className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors disabled:opacity-50"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteClient}
                        disabled={deleteStatus === "deleting"}
                        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-600/20 disabled:opacity-70 min-w-[110px]"
                      >
                        {deleteStatus === "deleting" ? (
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
                ) : (
                  <motion.div
                    key="success-delete"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-10 flex flex-col items-center justify-center min-h-[280px]"
                  >
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-500/20">
                      <svg
                        className="w-8 h-8"
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
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">
                      Klien Berhasil Dihapus
                    </h3>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`fixed top-8 right-8 z-[200] flex items-center gap-3 px-5 py-4 font-semibold text-sm rounded-2xl shadow-2xl backdrop-blur-xl ${
              toast.type === "error"
                ? "bg-rose-600 dark:bg-rose-500 text-white shadow-rose-600/30"
                : "bg-emerald-600 dark:bg-emerald-500 text-white shadow-emerald-600/30"
            }`}
          >
            {toast.type === "error" ? (
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
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
            )}
            <p className="pr-2">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}