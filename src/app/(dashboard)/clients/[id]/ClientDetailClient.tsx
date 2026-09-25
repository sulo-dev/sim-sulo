"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import EditClientModal from "@/components/EditClientModal"; 
import { deleteClient } from "@/actions/clientActions";

type WebsiteData = { id: number; name: string; status: string };
type DocumentData = { id: number; title: string; date: string; websiteName: string };

type ClientDetailProps = {
  client: {
    id: number;
    companyName: string;
    picName: string;
    email: string;
    status: string;
    websites: WebsiteData[];
    documents: DocumentData[];
  } | null;
  isInvalidId?: boolean;
};

// Framer Motion Variants
const tabVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

export default function ClientDetailClient({ client, isInvalidId }: ClientDetailProps) {
  const router = useRouter();

  // RAHASIA ANTI-FLASH (Menghindari layar error saat klien baru saja dihapus)
  const [cachedClient] = useState(client);
  const [activeTab, setActiveTab] = useState("websites");
  
  // State Modal & Aksi
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'deleting' | 'success'>('idle');
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);
  
  // Toast Notification State
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });
  
  const triggerNotification = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 5000); // Disamakan 5 detik
  };

  const handleDownloadPDF = (docName: string) => {
    setDownloadingDoc(docName);
    setTimeout(() => {
      const base64PDF = "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLU31jBQsTAz1LBSKUrnCtRTyuVJF/v//zwcsFADyCAsRCmVuZHN0cmVhbQplbmRvYmoKCjMgMCBvYmoKNDQKZW5kb2JqCgo0IDAgb2JqCjw8L0ZpbHRlci9GbGF0ZURlY29kZS9MZW5ndGggMTI4Pj5zdHJlYW0KeJwr5HIMclXIzdcvT01OzCtOtFJIyy9SqMsvVCjJV0gqSC0qzy8t0gEKWxlYcIXkKyTml2QoRBVnJmfmKVQGFOeUpgYV6wF5ZRCVhnqGQAEGhtAAkK+XnF+SkamXmFuQk1qkr2BgoFBaUqwPNAiUBwB+EyFmCmVuZHN0cmVhbQplbmRvYmoKCjUgMCBvYmoKPDwvQ29udGVudHMgNCAwIFIvVHlwZS9QYWdlL1Jlc291cmNlczw8L1Byb2NTZXRbL1BERi9UZXh0L0ltYWdlQi9JbWFnZUMvSW1hZ2VJXS9Gb250PDwvRjEgMiAwIFI+Pj4+L1BhcmVudCAxIDAgUi9NZWRpYUJveFswIDAgNTk1LjI4IDg0MS44OV0+PgplbmRvYmoKCjEgMCBvYmoKPDwvVHlwZS9QYWdlcy9Db3VudCAxL0tpZHNbNSAwIFJdPj4KZW5kb2JqCgo2IDAgb2JqCjw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAxIDAgUj4+CmVuZG9iagoKNyAwIG9iago8PC9DcmVhdG9yKFBERi5qcykvUHJvZHVjZXIoUERGLmpzKS9DcmVhdGlvbkRhdGUoRDoyMDI2MDkxMTAwMDAwMFopPj4KZW5kb2JqCgp4cmVmCjAgOAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDA0MDYgMDAwMDAgbiAKMDAwMDAwMDE2MyAwMDAwMCBuIAowMDAwMDAwMjU5IDAwMDAwIG4gCjAwMDAwMDAzNTkgMDAwMDAgbiAKMDAwMDAwMDQ2MyAwMDAwMCBuIAowMDAwMDAwNjI4IDAwMDAwIG4gCjAwMDAwMDA2ODQgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDgvUm9vdCA2IDAgUi9JbmZvIDcgMCBSPj4Kc3RhcnR4cmVmCjc5MQolJUVPRgo=";
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
      a.download = `${docName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setDownloadingDoc(null);
      triggerNotification(`Dokumen "${docName.replace(/_/g, ' ')}" berhasil diunduh.`);
    }, 1500);
  };

  const handleDeleteClient = async () => {
    if (!cachedClient) return;
    setDeleteStatus('deleting');
    
    const res = await deleteClient(cachedClient.id);

    if (res.success) {
      setDeleteStatus('success');
      sessionStorage.setItem("sulo-toast-success", "Data klien berhasil dihapus secara permanen.");
      
      setTimeout(() => {
        router.push("/clients");
      }, 800); 
    } else {
      setDeleteStatus('idle');
      alert("Gagal menghapus klien: " + res.message);
    }
  };

  const handleCloseDeleteModal = () => {
    if (deleteStatus === 'deleting') return;
    setIsDeleteModalOpen(false);
    setTimeout(() => setDeleteStatus('idle'), 300);
  };

  // Pengecekan Klien Tidak Valid / Dihapus (Empty State yang Elegan)
  if (!cachedClient || isInvalidId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 border-dashed rounded-3xl p-8 max-w-3xl mx-auto">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {isInvalidId ? "ID Klien Tidak Valid" : "Klien Tidak Ditemukan"}
        </h3>
        <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">
          {isInvalidId ? "Pastikan format URL menggunakan ID numerik yang benar." : "Data klien yang Anda cari mungkin telah dihapus permanen dari sistem."}
        </p>
        <Link href="/clients" className="px-6 py-3 bg-[#011D58] hover:bg-[#022b82] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#011D58]/20 transition-all">
          Kembali ke Direktori Klien
        </Link>
      </div>
    );
  }

  // RETURN UTAMA CLIENT DETAIL
  return (
    <div className="space-y-6 max-w-6xl mx-auto relative pb-10">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium bg-white/40 dark:bg-slate-900/40 w-max px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 backdrop-blur-md">
        <Link href="/clients" className="hover:text-[#FA4D09] dark:hover:text-[#FF9F03] transition-colors flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          Klien
        </Link>
        <span className="opacity-50">/</span>
        <span className="text-slate-900 dark:text-slate-200 font-bold">{cachedClient.companyName}</span>
      </div>

      {/* Hero Section Client */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Latar Blur Dekoratif */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#011D58]/5 to-[#FC7A0B]/5 dark:from-[#011D58]/20 dark:to-[#FF9F03]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        {/* Info Avatar & Nama */}
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#011D58] to-[#022b82] dark:from-slate-800 dark:to-slate-900 shadow-inner flex items-center justify-center text-white text-3xl sm:text-4xl font-black uppercase ring-4 ring-white dark:ring-slate-950 shrink-0">
            {cachedClient.companyName.charAt(0)}
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {cachedClient.companyName}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                cachedClient.status === 'Active' 
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}>
                {cachedClient.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                {cachedClient.status} Contract
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 relative z-10 w-full lg:w-auto mt-4 lg:mt-0">
          <a href={`mailto:${cachedClient.email}`} className="flex-1 lg:flex-none justify-center flex px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#FA4D09] dark:hover:text-[#FF9F03] text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 items-center gap-2 transition-all shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Email
          </a>
          <button onClick={() => setIsEditModalOpen(true)} className="flex-1 lg:flex-none justify-center px-5 py-2.5 bg-[#011D58] hover:bg-[#022b82] text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-[#011D58]/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Edit Klien
          </button>
          <button onClick={() => setIsDeleteModalOpen(true)} className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-500/30 transition-all shadow-sm" title="Hapus Klien">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      {/* Grid Informasi Detail (Mini Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
          <span className="p-3 bg-[#FC7A0B]/10 text-[#FC7A0B] rounded-xl shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </span>
          <div className="overflow-hidden">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Email Kontak</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate">{cachedClient.email || 'Tidak diatur'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
          <span className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </span>
          <div className="overflow-hidden">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Penanggung Jawab</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate">{cachedClient.picName || 'Tidak diatur'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
          <span className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          </span>
          <div className="overflow-hidden">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">ID Klien Sistem</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate font-mono">SULO-CL-{cachedClient.id.toString().padStart(4, '0')}</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigasi (Pill / Segmented Control Style) */}
      <div className="flex justify-start">
        <div className="flex gap-1 bg-white/60 dark:bg-slate-900/60 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm overflow-x-auto no-scrollbar w-full sm:w-auto">
          {['websites', 'contracts'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? "bg-white dark:bg-slate-800 text-[#011D58] dark:text-[#FF9F03] shadow-sm border border-slate-100 dark:border-slate-700" 
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border border-transparent"
              }`}
            >
              {tab === 'websites' 
                ? `Proyek Website (${cachedClient.websites.length})` 
                : `Dokumen & Kontrak (${cachedClient.documents.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Konten Tabs */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: WEBSITES */}
        {activeTab === "websites" && (
          <motion.div key="websites" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {cachedClient.websites.length > 0 ? cachedClient.websites.map((web) => (
              <Link key={web.id} href={`/websites/${web.id}`}>
                <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-[#FC7A0B]/50 dark:hover:border-[#FF9F03]/50 cursor-pointer group flex justify-between items-center shadow-sm hover:shadow-xl hover:shadow-[#FC7A0B]/5 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#011D58]/5 dark:bg-[#011D58]/20 text-[#011D58] dark:text-slate-300 rounded-xl group-hover:bg-[#FC7A0B]/10 group-hover:text-[#FC7A0B] transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#FA4D09] dark:group-hover:text-[#FF9F03] transition-colors mb-1">{web.name}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">{web.status}</span>
                    </div>
                  </div>
                  <div className="text-slate-300 dark:text-slate-600 group-hover:text-[#FA4D09] dark:group-hover:text-[#FF9F03] transition-colors group-hover:translate-x-1 duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="col-span-1 md:col-span-2 p-12 text-center bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Belum Ada Proyek</h3>
                <p className="text-sm text-slate-500 font-medium">Klien ini belum memiliki proyek website aktif di dalam sistem.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: KONTRAK / DOKUMEN */}
        {activeTab === "contracts" && (
          <motion.div key="contracts" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
            {cachedClient.documents.length > 0 ? cachedClient.documents.map((doc) => (
              <div key={doc.id} className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{doc.title}</p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{doc.websiteName}</span>
                      <span>•</span>
                      <span>{doc.date}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDownloadPDF(doc.title)} 
                  disabled={downloadingDoc === doc.title} 
                  className="w-full sm:w-auto px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#FC7A0B]/50 hover:bg-[#FC7A0B]/5 dark:hover:bg-[#FF9F03]/10 text-slate-700 dark:text-slate-300 hover:text-[#FC7A0B] dark:hover:text-[#FF9F03] text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {downloadingDoc === doc.title ? (
                    <><span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin"></span> Mengunduh...</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> Unduh PDF</>
                  )}
                </button>
              </div>
            )) : (
              <div className="p-12 text-center bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Tidak Ada Dokumen</h3>
                <p className="text-sm text-slate-500 font-medium">Belum ada dokumen atau kontrak yang diunggah untuk klien ini.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* MODAL EDIT KLIEN */}
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

      {/* MODAL HAPUS KLIEN */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={handleCloseDeleteModal} 
              className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm cursor-pointer" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full z-10 border border-slate-200 dark:border-slate-800/80 overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {deleteStatus !== 'success' ? (
                  <motion.div key="confirm-delete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 text-center">
                    <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Hapus Klien Ini?</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                      Semua data proyek, infrastruktur, dan dokumen terkait <span className="font-bold text-slate-800 dark:text-slate-200">{cachedClient.companyName}</span> akan dihapus permanen.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button onClick={handleCloseDeleteModal} disabled={deleteStatus === 'deleting'} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm transition-colors disabled:opacity-50">
                        Batal
                      </button>
                      <button onClick={handleDeleteClient} disabled={deleteStatus === 'deleting'} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 min-w-[120px] transition-colors shadow-lg shadow-rose-600/20 disabled:opacity-70">
                        {deleteStatus === 'deleting' ? (
                          <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Menghapus...</>
                        ) : "Ya, Hapus"}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="success-delete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-10 flex flex-col items-center justify-center min-h-[320px]">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-5 shadow-inner border border-emerald-200 dark:border-emerald-500/20">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Berhasil Dihapus</h3>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST NOTIFIKASI KANAN ATAS */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -20, scale: 0.9 }} 
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed top-8 right-8 z-[200] flex items-center gap-3 px-5 py-4 bg-emerald-600 dark:bg-emerald-500 text-white font-semibold text-sm rounded-2xl shadow-2xl shadow-emerald-600/30 border border-emerald-400/30 backdrop-blur-xl"
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